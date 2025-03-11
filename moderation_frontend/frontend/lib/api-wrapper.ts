import { safeAccess } from "./error-handling"

/**
 * Type for API response handler options
 */
export interface ApiResponseHandlerOptions<T> {
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
  defaultValue?: T
  retryCount?: number
  maxRetries?: number
  authToken?: string // Добавляем опцию для передачи токена
}

// Track failed endpoints to implement circuit breaking
const failedEndpoints = new Map<string, { count: number; lastFailure: number }>()
const CIRCUIT_BREAK_THRESHOLD = 5 // Number of consecutive failures before circuit breaking
const CIRCUIT_RESET_TIME = 30000 // Time in ms before resetting circuit (30 seconds)

/**
 * Check if an endpoint is circuit-broken (too many recent failures)
 */
function isCircuitBroken(endpoint: string): boolean {
  const failureInfo = failedEndpoints.get(endpoint)
  if (!failureInfo) return false

  // Reset circuit after the reset time
  if (Date.now() - failureInfo.lastFailure > CIRCUIT_RESET_TIME) {
    failedEndpoints.delete(endpoint)
    return false
  }

  return failureInfo.count >= CIRCUIT_BREAK_THRESHOLD
}

/**
 * Record a failure for an endpoint
 */
function recordFailure(endpoint: string): void {
  const failureInfo = failedEndpoints.get(endpoint) || { count: 0, lastFailure: 0 }
  failureInfo.count += 1
  failureInfo.lastFailure = Date.now()
  failedEndpoints.set(endpoint, failureInfo)
}

/**
 * Reset failure count for an endpoint
 */
function resetFailure(endpoint: string): void {
  failedEndpoints.delete(endpoint)
}

/**
 * Higher-order function to handle API responses with robust error handling
 * @param promise The promise returned by the API call
 * @param endpoint The API endpoint being called
 * @param options Options for handling the response
 * @returns A promise that resolves to the data or the default value
 */
export async function handleApiResponse<T>(
  promise: Promise<Response>,
  endpoint: string,
  options: ApiResponseHandlerOptions<T> = {},
): Promise<T | undefined> {
  const { onSuccess, onError, defaultValue, retryCount = 0, maxRetries = 2 } = options

  // Check if circuit is broken for this endpoint
  if (isCircuitBroken(endpoint)) {
    console.warn(`Circuit broken for endpoint: ${endpoint}. Too many recent failures.`)
    if (onError) {
      onError(new Error(`Service unavailable: Too many recent failures for ${endpoint}`))
    }
    return defaultValue
  }

  try {
    const response = await promise

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error")
      let errorData

      try {
        errorData = JSON.parse(errorText)
      } catch (e) {
        errorData = { message: errorText }
      }

      const errorMessage = safeAccess(errorData, "message", `API error: ${response.status}`)
      const error = new Error(errorMessage)

      // Record failure for circuit breaking
      recordFailure(endpoint)

      // Retry logic for server errors (5xx)
      if (response.status >= 500 && retryCount < maxRetries) {
        console.warn(`Retrying failed request to ${endpoint} (attempt ${retryCount + 1}/${maxRetries})`)
        // Exponential backoff
        const backoffTime = Math.min(1000 * Math.pow(2, retryCount), 10000)
        await new Promise((resolve) => setTimeout(resolve, backoffTime))

        return handleApiResponse(promise, endpoint, {
          ...options,
          retryCount: retryCount + 1,
        })
      }

      if (onError) {
        onError(error)
      }

      return defaultValue
    }

    // Reset failure count on success
    resetFailure(endpoint)

    // Handle empty responses
    const contentType = response.headers.get("content-type")
    if (contentType?.includes("application/json")) {
      const text = await response.text()

      // Handle empty JSON responses
      if (!text || text.trim() === "") {
        const result = defaultValue as T
        if (onSuccess) {
          onSuccess(result)
        }
        return result
      }

      try {
        const data = JSON.parse(text) as T
        if (onSuccess) {
          onSuccess(data)
        }
        return data
      } catch (error) {
        console.error("Failed to parse JSON response:", error)
        recordFailure(endpoint)

        if (onError) {
          onError(new Error(`Invalid JSON response from ${endpoint}: ${text.substring(0, 100)}`))
        }
        return defaultValue
      }
    } else {
      // Handle non-JSON responses
      const text = await response.text()
      const result = text as unknown as T
      if (onSuccess) {
        onSuccess(result)
      }
      return result
    }
  } catch (error) {
    console.error(`API request to ${endpoint} failed:`, error)

    // Record failure for circuit breaking
    recordFailure(endpoint)

    // Retry on network errors
    if (retryCount < maxRetries) {
      console.warn(`Retrying failed request to ${endpoint} (attempt ${retryCount + 1}/${maxRetries})`)
      // Exponential backoff
      const backoffTime = Math.min(1000 * Math.pow(2, retryCount), 10000)
      await new Promise((resolve) => setTimeout(resolve, backoffTime))

      return handleApiResponse(promise, endpoint, {
        ...options,
        retryCount: retryCount + 1,
      })
    }

    if (onError && error instanceof Error) {
      onError(error)
    } else if (onError) {
      onError(new Error(String(error)))
    }
    return defaultValue
  }
}

/**
 * Create a safe API client with built-in error handling
 * @param baseUrl The base URL for API requests
 * @returns An object with methods for making API requests
 */
export function createSafeApiClient(baseUrl: string) {
  // Функция для получения заголовков авторизации
  const getAuthHeaders = (token?: string) => {
    // Если токен передан явно, используем его
    if (token) {
      return { Authorization: `Bearer ${token}` }
    }

    // Иначе пытаемся получить токен из localStorage
    const storedToken = typeof window !== "undefined" ? localStorage.getItem("moderator_jwt_token") : null
    return storedToken ? { Authorization: `Bearer ${storedToken}` } : {}
  }

  return {
    async get<T>(endpoint: string, options: ApiResponseHandlerOptions<T> = {}) {
      const url = `${baseUrl}${endpoint}`
      return handleApiResponse<T>(
        fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(options.authToken),
          },
        }),
        endpoint,
        options,
      )
    },

    async post<T, D = any>(endpoint: string, data?: D, options: ApiResponseHandlerOptions<T> = {}) {
      const url = `${baseUrl}${endpoint}`
      return handleApiResponse<T>(
        fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(options.authToken),
          },
          body: data ? JSON.stringify(data) : undefined,
        }),
        endpoint,
        options,
      )
    },

    async put<T, D = any>(endpoint: string, data?: D, options: ApiResponseHandlerOptions<T> = {}) {
      const url = `${baseUrl}${endpoint}`
      return handleApiResponse<T>(
        fetch(url, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(options.authToken),
          },
          body: data ? JSON.stringify(data) : undefined,
        }),
        endpoint,
        options,
      )
    },

    async patch<T, D = any>(endpoint: string, data?: D, options: ApiResponseHandlerOptions<T> = {}) {
      const url = `${baseUrl}${endpoint}`
      console.log(`Making PATCH request to: ${url}`, data)
      return handleApiResponse<T>(
        fetch(url, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(options.authToken),
          },
          body: data ? JSON.stringify(data) : undefined,
        }),
        endpoint,
        options,
      )
    },

    async delete<T>(endpoint: string, options: ApiResponseHandlerOptions<T> = {}) {
      const url = `${baseUrl}${endpoint}`
      return handleApiResponse<T>(
        fetch(url, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(options.authToken),
          },
        }),
        endpoint,
        options,
      )
    },
  }
}

