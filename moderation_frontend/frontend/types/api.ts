export interface Movie {
  _id: string
  title: string
  rating: number
  created_at: string
  poster_url?: string
}

export interface MovieDetail extends Omit<Movie, "_id"> {
  id: string
  additional_info: AdditionalInfo
}

export interface AdditionalInfo {
  reactions_count: number
  likes_count: number
  dislikes_count: number
  bookmarks_count: number
  reviews_count: number
}

export interface Review {
  _id: string
  movie_id: string
  user_id: string
  title: string
  review_text: string
  rating: number
  status: "approved" | "rejected" | "pending"
  created_at: string
  auto_moderation_result?: AIModeration | null
  rejection_reason?: string | null
  moderator_id?: string | null
  moderation_at?: string | null
  user_name?: string
}

export interface CreateReviewData {
  movie_id: string
  title: string
  review_text: string
  rating: number
}

export interface StatusUpdate {
  status: "approved" | "rejected" | "pending"
  rejection_reason?: string
  moderator_comment?: string | object
}

export interface AIModeration {
  status: string
  tags: string[]
  issues: AIIssue[]
  confidence: number
}

export interface AIIssue {
  code: string
  category: string
  description: string
  law: string
}

// Обновленные типы в соответствии с API
export type ReviewOrderBy = "title" | "created_at" | "rating"

export type SortDirection = 1 | -1

export interface ReviewsQueryParams {
  movie_id?: string
  user_id?: string
  rating__gte?: number
  rating__lte?: number
  page_size?: number
  page_number?: number
  order_by?: ReviewOrderBy
  direction?: SortDirection
}

