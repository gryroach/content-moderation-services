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
}

export interface StatusUpdate {
  status: "approved" | "rejected" | "pending"
  rejection_reason?: string
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
