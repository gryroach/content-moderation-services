/**
 * Utility functions for robust error handling in API responses
 */

/**
 * Safely parse a JSON string into an object
 * @param jsonString The JSON string to parse, or null/undefined
 * @param defaultValue The default value to return if parsing fails
 * @returns The parsed object or the default value
 */
export function safeParseJSON<T>(jsonString: string | null | undefined, defaultValue: T): T {
  if (jsonString === null || jsonString === undefined || jsonString === "") return defaultValue

  try {
    return JSON.parse(jsonString) as T
  } catch (error) {
    console.warn(
      `Failed to parse JSON string: ${jsonString?.substring(0, 50)}${jsonString && jsonString.length > 50 ? "..." : ""}`,
    )
    return defaultValue
  }
}

/**
 * Safely access a property that might be null or undefined
 * @param obj The object to access a property from
 * @param path The path to the property (e.g., 'user.profile.name')
 * @param defaultValue The default value to return if the property doesn't exist
 * @returns The property value or the default value
 */
export function safeAccess<T, D>(obj: any, path: string, defaultValue: D): T | D {
  if (obj === null || obj === undefined) return defaultValue

  const properties = path.split(".")
  let current = obj

  for (const prop of properties) {
    if (current === null || current === undefined || typeof current !== "object") {
      return defaultValue
    }
    current = current[prop]
  }

  return current !== undefined && current !== null ? (current as T) : defaultValue
}

/**
 * Type guard to check if a value is not null or undefined
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined
}

/**
 * Safely convert a value to a string
 */
export function safeToString(value: any): string {
  if (value === null || value === undefined) return ""
  if (typeof value === "string") return value
  if (typeof value === "number" || typeof value === "boolean") return String(value)
  if (typeof value === "object") {
    try {
      return JSON.stringify(value)
    } catch (error) {
      return "[Object]"
    }
  }
  return ""
}

/**
 * Safely convert a value to a number
 */
export function safeToNumber(value: any, defaultValue = 0): number {
  if (value === null || value === undefined) return defaultValue
  if (typeof value === "number") return value
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value)
    return isNaN(parsed) ? defaultValue : parsed
  }
  return defaultValue
}

/**
 * Safely convert a value to a boolean
 */
export function safeToBoolean(value: any, defaultValue = false): boolean {
  if (value === null || value === undefined) return defaultValue
  if (typeof value === "boolean") return value
  if (typeof value === "string") {
    return value.toLowerCase() === "true" || value === "1"
  }
  if (typeof value === "number") {
    return value === 1
  }
  return defaultValue
}

/**
 * Safely convert a value to a date
 */
export function safeToDate(value: any, defaultValue: Date = new Date()): Date {
  if (value === null || value === undefined) return defaultValue
  if (value instanceof Date) return value
  if (typeof value === "string" || typeof value === "number") {
    try {
      const date = new Date(value)
      return isNaN(date.getTime()) ? defaultValue : date
    } catch (error) {
      return defaultValue
    }
  }
  return defaultValue
}

/**
 * Safely convert a value to an array
 */
export function safeToArray<T>(value: any, defaultValue: T[] = []): T[] {
  if (value === null || value === undefined) return defaultValue
  if (Array.isArray(value)) return value
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed : defaultValue
    } catch (error) {
      return defaultValue
    }
  }
  return defaultValue
}

