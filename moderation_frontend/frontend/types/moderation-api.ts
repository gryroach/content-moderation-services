// Types based on the provided OpenAPI specification

export interface Pagination {
  page: number
  has_next: boolean
}

export interface PaginationResult<T> {
  pagination: Pagination
  data: T[]
}

export enum ModerationStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export enum ModerationStatusRequest {
  APPROVED = "approved",
  REJECTED = "rejected",
  PENDING = "pending",
}

export interface ModerationResponseStatus {
  success: boolean
}

export interface ReviewDB {
  id: string
  user_id: string
  movie_id: string
  review_id: string
  review_title: string
  review_text: string
  auto_moderation_result: string | null
  moderation_status: ModerationStatus
  rejection_reason: string | null
  moderator_id: string | null
  created_at: string
  moderation_at: string | null
}

export interface CreateReview {
  user_id: string
  movie_id: string
  review_id: string
  review_title: string
  review_text: string
  auto_moderation_result?: string | null
  moderation_status?: ModerationStatus
}

export interface AutoModerationResult {
  status: string
  tags: string[]
  issues: AutoModerationIssue[]
  confidence: number
}

// Добавляем экспорт для AutoModerationIssue
export interface AutoModerationIssue {
  code: string
  category: string
  description: string
  law: string
}

