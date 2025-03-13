/**
 * Enhanced logging utility for debugging API issues
 */

// Log levels
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

// Current log level - can be adjusted based on environment
const currentLogLevel = process.env.NODE_ENV === "production" ? LogLevel.WARN : LogLevel.DEBUG

// Maximum size for logged objects/arrays
const MAX_LOG_SIZE = 1000

/**
 * Truncate large objects/arrays for logging
 */
function truncateForLogging(data: any): any {
  if (data === null || data === undefined) {
    return data
  }

  if (typeof data === "string") {
    return data.length > MAX_LOG_SIZE
      ? `${data.substring(0, MAX_LOG_SIZE)}... [truncated, ${data.length} chars total]`
      : data
  }

  if (typeof data !== "object") {
    return data
  }

  try {
    const str = JSON.stringify(data)
    if (str.length <= MAX_LOG_SIZE) {
      return data
    }

    // For arrays, truncate to first few elements
    if (Array.isArray(data)) {
      return {
        _truncated: true,
        _originalLength: data.length,
        _preview: data.slice(0, 3),
        _message: `Array truncated, ${data.length} items total`,
      }
    }

    // For objects, include a subset of properties
    const truncated: Record<string, any> = {
      _truncated: true,
      _originalSize: str.length,
      _preview: {},
    }

    // Include a few key properties
    const keys = Object.keys(data)
    truncated._message = `Object truncated, ${keys.length} properties total`

    // Add some key properties to the preview
    const previewKeys = keys.slice(0, 5)
    for (const key of previewKeys) {
      truncated._preview[key] = data[key]
    }

    return truncated
  } catch (e) {
    return {
      _error: "Could not stringify object for logging",
      _type: typeof data,
    }
  }
}

/**
 * Log a message with context data
 */
export function log(level: LogLevel, message: string, context?: any, error?: Error): void {
  // Skip if below current log level
  if (level < currentLogLevel) {
    return
  }

  const timestamp = new Date().toISOString()
  const truncatedContext = context ? truncateForLogging(context) : undefined

  const logData = {
    timestamp,
    level: LogLevel[level],
    message,
    ...(truncatedContext ? { context: truncatedContext } : {}),
    ...(error
      ? {
          error: {
            message: error.message,
            name: error.name,
            stack: error.stack,
          },
        }
      : {}),
  }

  switch (level) {
    case LogLevel.DEBUG:
      console.debug(message, logData)
      break
    case LogLevel.INFO:
      console.info(message, logData)
      break
    case LogLevel.WARN:
      console.warn(message, logData)
      break
    case LogLevel.ERROR:
      console.error(message, logData)
      break
  }
}

// Convenience methods
export const debug = (message: string, context?: any) => log(LogLevel.DEBUG, message, context)

export const info = (message: string, context?: any) => log(LogLevel.INFO, message, context)

export const warn = (message: string, context?: any, error?: Error) => log(LogLevel.WARN, message, context, error)

export const error = (message: string, context?: any, error?: Error) => log(LogLevel.ERROR, message, context, error)

/**
 * Log API request details
 */
export function logApiRequest(method: string, url: string, data?: any, headers?: Record<string, string>): void {
  debug("API Request", {
    method,
    url,
    data,
    headers: headers ? { ...headers, Authorization: headers.Authorization ? "[REDACTED]" : undefined } : undefined,
  })
}

/**
 * Log API response details
 */
export function logApiResponse(method: string, url: string, status: number, data?: any, error?: Error): void {
  if (status >= 400) {
    warn(`API Response Error: ${method} ${url} (${status})`, { data }, error)
  } else {
    debug("API Response", {
      method,
      url,
      status,
      data,
    })
  }
}

