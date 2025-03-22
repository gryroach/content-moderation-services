export type ReviewStatus = 'approved' | 'rejected' | 'pending';

export type StatusFilter = 'all' | ReviewStatus;
export type SortOption = 'newest' | 'oldest';
export type DateFilter = 'all' | 'last5min' | 'last1hour' | 'today';
export type ConfidenceFilter = 'all' | 'high' | 'medium' | 'low';

export interface Review {
  _id: string;
  movie_id: string;
  user_id: string;
  user_name: string;
  title: string;
  review_text: string;
  rating: number;
  status: ReviewStatus;
  created_at: string;
  updated_at?: string;
  auto_moderation_result?: string | object;
  moderator_comment?: string | object;
  rejection_reason?: string;
  auto_moderation_processed?: boolean;
}

export interface ModerationComment {
  status?: ReviewStatus;
  confidence?: number;
  tags?: string[];
  issues?: Array<{
    code?: string;
    category?: string;
    description?: string;
    text?: string;
    severity?: 'high' | 'medium' | 'low';
    law?: string;
  }>;
  message?: string;
  [key: string]: any;
}

export interface ReviewFormValues {
  title: string;
  text: string;
  rating: number;
}

export interface APIResponse<T> {
  success: boolean;
  data: T;
  error?: string;
} 