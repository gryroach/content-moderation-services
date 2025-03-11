import { createSafeApiClient } from "@/lib/api-wrapper"
import { getToken } from "@/lib/token-storage"
import type {
  AutoModerationResult,
  CreateReview,
  ModerationResponseStatus,
  ModerationStatusRequest,
  PaginationResult,
  ReviewDB,
} from "@/types/moderation-api"

// Base URL for the moderation API
const MODERATION_API_BASE_URL = process.env.NEXT_PUBLIC_MODERATION_API_BASE_URL || "/api-moderator/v1"

// Create a safe API client
const apiClient = createSafeApiClient(MODERATION_API_BASE_URL)

// Функция для получения токена модератора
function getModeratorToken(): string | null {
  if (typeof window !== "undefined") {
    return getToken(true) // true = moderator token
  }
  return null
}

// Get reviews for moderation with pagination
export async function getReviewsForModeration(page = 1, size = 10): Promise<PaginationResult<ReviewDB>> {
  const token = getModeratorToken()

  const result = await apiClient.get<PaginationResult<ReviewDB>>(`/review/reviews?page=${page}&size=${size}`, {
    defaultValue: { pagination: { page, has_next: false }, data: [] },
    authToken: token || undefined,
  })

  return result || { pagination: { page, has_next: false }, data: [] }
}

// Get a specific review by ID
export async function getReviewById(reviewId: string): Promise<ReviewDB | null> {
  const token = getModeratorToken()

  return await apiClient.get<ReviewDB | null>(`/review/${reviewId}`, {
    defaultValue: null,
    authToken: token || undefined,
  })
}

// Moderate a review (approve, reject or mark as pending)
export async function moderateReview(
  reviewId: string,
  status: ModerationStatusRequest | "pending",
  rejectionReason?: string,
): Promise<ModerationResponseStatus> {
  // Для статуса pending используем пустую причину отклонения
  const reason = status === "pending" || !rejectionReason ? "Empty" : rejectionReason
  const token = getModeratorToken()

  try {
    const endpoint = `/review/${reviewId}?moderation_status=${status}&rejection_reason=${encodeURIComponent(reason)}`
    console.log(`Sending moderation request to: ${endpoint}`)

    const result = await apiClient.patch<ModerationResponseStatus>(endpoint, undefined, {
      defaultValue: { success: false },
      authToken: token || undefined,
    })

    return result || { success: false }
  } catch (error) {
    console.error("Error in moderateReview:", error)
    return { success: false }
  }
}

// Create a new review (for testing purposes)
export async function createReview(review: CreateReview): Promise<ReviewDB | null> {
  const token = getModeratorToken()

  return await apiClient.post<ReviewDB | null>("/review/", review, {
    defaultValue: null,
    authToken: token || undefined,
  })
}

// Parse auto moderation result from string to object
export function parseAutoModerationResult(result: string | null | undefined): AutoModerationResult | null {
  // Handle empty string case explicitly
  if (result === "" || result === null || result === undefined) return null

  // Handle the case where result might already be an object
  if (typeof result === "object") {
    return normalizeAutoModerationResult(result as any)
  }

  try {
    // Parse the JSON string
    const parsed = JSON.parse(result)

    // Normalize the parsed result
    return normalizeAutoModerationResult(parsed)
  } catch (error) {
    console.warn(
      `Failed to parse auto moderation result: ${typeof result} - ${result?.substring(0, 50)}${result && result.length > 50 ? "..." : ""}`,
    )
    return null
  }
}

/**
 * Normalize an auto moderation result object to ensure all properties have the correct types
 */
function normalizeAutoModerationResult(data: any): AutoModerationResult {
  if (!data) return createDefaultAutoModerationResult()

  return {
    // Ensure status is a string
    status: typeof data.status === "string" ? data.status : "unknown",

    // Ensure tags is an array
    tags: Array.isArray(data.tags)
      ? data.tags
      : typeof data.tags === "string" && data.tags !== ""
        ? [data.tags] // Convert single string to array
        : [],

    // Ensure issues is an array
    issues: Array.isArray(data.issues) ? data.issues.map(normalizeIssue) : [],

    // Ensure confidence is a number
    confidence:
      typeof data.confidence === "number"
        ? data.confidence
        : typeof data.confidence === "string"
          ? Number.parseFloat(data.confidence) || 0
          : 0,
  }
}

/**
 * Normalize an issue object to ensure all properties have the correct types
 */
interface AutoModerationIssue {
  code: string
  category: string
  description: string
  law: string
}

function normalizeIssue(issue: any): AutoModerationIssue {
  if (!issue || typeof issue !== "object") {
    return {
      code: "unknown",
      category: "Unknown Issue",
      description: "No description provided",
      law: "unknown",
    }
  }

  return {
    code: typeof issue.code === "string" ? issue.code : "unknown",
    category: typeof issue.category === "string" ? issue.category : "Unknown Issue",
    description: typeof issue.description === "string" ? issue.description : "No description provided",
    law: typeof issue.law === "string" ? issue.law : "unknown",
  }
}

/**
 * Create a default auto moderation result object
 */
function createDefaultAutoModerationResult(): AutoModerationResult {
  return {
    status: "unknown",
    tags: [],
    issues: [],
    confidence: 0,
  }
}

// Format a date string safely
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "N/A"

  try {
    const date = new Date(dateString)
    return isNaN(date.getTime())
      ? "Invalid Date"
      : date.toLocaleString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
  } catch (error) {
    return "Invalid Date"
  }
}

// Safely truncate a string
export function truncateString(str: string | null | undefined, maxLength = 50): string {
  if (!str) return ""
  return str.length > maxLength ? `${str.substring(0, maxLength)}...` : str
}

