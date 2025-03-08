"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { createSafeApiClient } from "@/lib/api-wrapper"

// Define the state interface for the hook
interface UseSafeApiState<T> {
  data: T | undefined
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

/**
 * Custom hook for safely fetching data from an API
 * @param endpoint The API endpoint to fetch from
 * @param defaultValue The default value to use if the API call fails
 * @param dependencies Dependencies that should trigger a refetch when changed
 * @returns An object with the data, loading state, error, and refetch function
 */
export function useSafeApi<T>(endpoint: string, defaultValue?: T, dependencies: any[] = []): UseSafeApiState<T> {
  const [data, setData] = useState<T | undefined>(defaultValue)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  // Use refs to prevent infinite loops
  const isMounted = useRef(true)
  const isFirstRender = useRef(true)
  const lastEndpoint = useRef(endpoint)
  const lastDependencies = useRef(dependencies)

  // Get the API base URL from environment variables
  const apiBaseUrl = process.env.NEXT_PUBLIC_MODERATION_API_BASE_URL || "/api-moderator/v1"
  const apiClient = createSafeApiClient(apiBaseUrl)

  const fetchData = useCallback(async () => {
    // Prevent fetching if unmounted
    if (!isMounted.current) return

    // Prevent duplicate requests on the same render cycle
    if (
      !isFirstRender.current &&
      lastEndpoint.current === endpoint &&
      JSON.stringify(lastDependencies.current) === JSON.stringify(dependencies)
    ) {
      return
    }

    lastEndpoint.current = endpoint
    lastDependencies.current = dependencies
    isFirstRender.current = false

    setIsLoading(true)
    setError(null)

    try {
      const result = await apiClient.get<T>(endpoint, {
        defaultValue,
        onError: (err) => {
          if (isMounted.current) {
            setError(err)
            console.warn(`API error for ${endpoint}:`, err)
          }
        },
      })

      if (isMounted.current) {
        setData(result)
      }
    } catch (err) {
      // This should rarely happen due to our error handling in the API client
      if (isMounted.current) {
        setError(err instanceof Error ? err : new Error(String(err)))
        console.error(`Unhandled error for ${endpoint}:`, err)
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false)
      }
    }
  }, [apiClient, endpoint, defaultValue, ...dependencies])

  // Cleanup function to prevent state updates after unmount
  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  // Fetch data on mount and when dependencies change
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Return the state and a refetch function
  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  }
}

/**
 * Custom hook for safely mutating data via an API
 * @param method The HTTP method to use
 * @param endpoint The API endpoint to call
 * @returns An object with the mutation function, loading state, and error
 */
export function useSafeMutation<T, D = any>(method: "post" | "put" | "patch" | "delete", endpoint: string) {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)
  const [data, setData] = useState<T | undefined>(undefined)

  // Use ref to prevent state updates after unmount
  const isMounted = useRef(true)

  // Get the API base URL from environment variables
  const apiBaseUrl = process.env.NEXT_PUBLIC_MODERATION_API_BASE_URL || "/api-moderator/v1"
  const apiClient = createSafeApiClient(apiBaseUrl)

  // Cleanup function to prevent state updates after unmount
  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  const mutate = useCallback(
    async (data?: D): Promise<T | undefined> => {
      if (!isMounted.current) return undefined

      setIsLoading(true)
      setError(null)

      try {
        const result = await apiClient[method]<T, D>(endpoint, data, {
          onError: (err) => {
            if (isMounted.current) {
              setError(err)
              console.warn(`API ${method} error for ${endpoint}:`, err)
            }
          },
        })

        if (isMounted.current) {
          setData(result)
        }
        return result
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))
        if (isMounted.current) {
          setError(error)
          console.error(`Unhandled error for ${method} ${endpoint}:`, err)
        }
        throw error
      } finally {
        if (isMounted.current) {
          setIsLoading(false)
        }
      }
    },
    [apiClient, method, endpoint],
  )

  return {
    mutate,
    isLoading,
    error,
    data,
  }
}
