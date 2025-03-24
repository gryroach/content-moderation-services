import { getToken as getStoredToken } from "@/lib/token-storage"
import type { CreateReviewData, Movie, Review, ReviewsQueryParams, StatusUpdate } from "@/types/api"
import { v4 as uuidv4 } from "uuid"
import { mockMovies, mockReviews } from "./mock-data"

// In development mode, use mock data
const isDev = process.env.NODE_ENV === "development"

// Base URL for API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api-ugc/v1"

// Helper function to get JWT token
const getToken = () => {
  if (typeof window !== "undefined") {
    return getStoredToken(false) // false = user token
  }
  return null
}

// Helper function for API requests
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const url = `${API_BASE_URL}${endpoint}`
  console.log(`Making API request to: ${url}`, {
    method: options.method || "GET",
    body: options.body ? JSON.parse(options.body as string) : undefined,
  })

  try {
    // Add mode: 'cors' explicitly to ensure proper CORS handling
    console.log(`Attempting fetch to ${url}...`)
    let response
    try {
      response = await fetch(url, {
        ...options,
        headers,
        mode: "cors",
        credentials: "include", // Include cookies if needed
      })
    } catch (fetchError) {
      // Log the specific fetch error but don't throw
      console.warn(`Fetch operation failed for ${url}:`, fetchError)
      return null as any
    }

    if (!response.ok) {
      const errorText = await response.text()
      // Log to console but don't throw
      console.warn(`API error (${response.status}):`, errorText)

      // Return null/undefined to trigger fallback to mock data
      return null as any
    }

    // Для отладки: всегда логируем ответ
    let responseText
    try {
      responseText = await response.text()
    } catch (textError) {
      console.warn(`Failed to get response text from ${url}:`, textError)
      return null as any
    }

    let data
    try {
      data = responseText ? JSON.parse(responseText) : {}
      console.log(`API response from ${endpoint}:`, data)
    } catch (e) {
      console.warn(`Failed to parse API response as JSON:`, responseText)
      // Return null/undefined to trigger fallback to mock data
      return null as any
    }

    return data
  } catch (error) {
    // Log the error but don't propagate it
    console.warn(`API request failed for ${endpoint}:`, error)
    // Return null/undefined to trigger fallback to mock data
    return null as any
  }
}

// Helper function to build query string from params
function buildQueryString(params: Record<string, any>): string {
  const query = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&")

  return query ? `?${query}` : ""
}

// Movies API
export async function getMovies(): Promise<Movie[]> {
  try {
    // Always try the real API first
    const apiResult = await apiRequest<Movie[]>("/movies/")

    // If we got a valid result, return it
    if (apiResult && Array.isArray(apiResult) && apiResult.length > 0) {
      return apiResult
    }

    // Otherwise fall back to mock data
    console.log("Falling back to mock movie data")
    return mockMovies
  } catch (error) {
    // This should never happen now, but just in case
    console.warn("Unexpected error in getMovies, using mock data:", error)
    return mockMovies
  }
}

export async function getMovie(id: string): Promise<Movie | null> {
  try {
    // Always try the real API first
    const apiResult = await apiRequest<Movie>(`/movies/${id}`)

    // If we got a valid result, return it
    if (apiResult && apiResult._id) {
      return apiResult
    }

    // Otherwise fall back to mock data
    console.log(`Falling back to mock data for movie ${id}`)
    return mockMovies.find((movie) => movie._id === id) || null
  } catch (error) {
    // This should never happen now, but just in case
    console.warn(`Unexpected error in getMovie for ID ${id}, using mock data:`, error)
    return mockMovies.find((movie) => movie._id === id) || null
  }
}

// Reviews API
export async function getReviews(params?: ReviewsQueryParams): Promise<Review[]> {
  try {
    // Build query parameters
    const queryParams: Record<string, any> = {}

    if (params) {
      if (params.movie_id) queryParams.movie_id = params.movie_id
      if (params.user_id) queryParams.user_id = params.user_id
      if (params.rating__gte !== undefined) queryParams.rating__gte = params.rating__gte
      if (params.rating__lte !== undefined) queryParams.rating__lte = params.rating__lte
      if (params.page_size) queryParams.page_size = params.page_size
      if (params.page_number) queryParams.page_number = params.page_number
      if (params.order_by) queryParams.order_by = params.order_by
      if (params.direction) queryParams.direction = params.direction
    }

    const queryString = buildQueryString(queryParams)
    console.log(`Getting reviews with query: ${queryString}`)

    // Always try the real API first
    const apiResult = await apiRequest<Review[]>(`/reviews/${queryString}`)

    // If we got a valid result, return it
    if (apiResult && Array.isArray(apiResult)) {
      return apiResult
    }

    // Otherwise fall back to mock data
    console.log("Falling back to mock review data")

    let filteredReviews = [...mockReviews]

    // Apply filters if specified
    if (params) {
      if (params.movie_id) {
        filteredReviews = filteredReviews.filter((review) => review.movie_id === params.movie_id)
      }

      if (params.user_id) {
        filteredReviews = filteredReviews.filter((review) => review.user_id === params.user_id)
      }

      if (params.rating__gte !== undefined) {
        filteredReviews = filteredReviews.filter((review) => review.rating >= params.rating__gte!)
      }

      if (params.rating__lte !== undefined) {
        filteredReviews = filteredReviews.filter((review) => review.rating <= params.rating__lte!)
      }

      // Sorting
      if (params.order_by) {
        const direction = params.direction || 1

        filteredReviews.sort((a, b) => {
          let valueA, valueB

          switch (params.order_by) {
            case "title":
              valueA = a.title
              valueB = b.title
              break
            case "created_at":
              valueA = new Date(a.created_at).getTime()
              valueB = new Date(b.created_at).getTime()
              break
            case "rating":
              valueA = a.rating
              valueB = b.rating
              break
            default:
              valueA = a.title
              valueB = b.title
          }

          if (valueA < valueB) return -1 * direction
          if (valueA > valueB) return 1 * direction
          return 0
        })
      }

      // Pagination
      if (params.page_size && params.page_number) {
        const startIndex = (params.page_number - 1) * params.page_size
        filteredReviews = filteredReviews.slice(startIndex, startIndex + params.page_size)
      }
    }

    return filteredReviews
  } catch (error) {
    // This should never happen now, but just in case
    console.warn("Unexpected error in getReviews, using mock data:", error)

    let filteredReviews = [...mockReviews]
    if (params?.movie_id) {
      filteredReviews = filteredReviews.filter((review) => review.movie_id === params.movie_id)
    }

    return filteredReviews
  }
}

export async function getMovieReviews(
  movieId: string,
  params?: Omit<ReviewsQueryParams, "movie_id">,
): Promise<Review[]> {
  const queryParams: ReviewsQueryParams = {
    ...params,
    movie_id: movieId,
  }

  return getReviews(queryParams)
}

export async function getReview(id: string): Promise<Review | null> {
  try {
    if (isDev) {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 200))

      const review = mockReviews.find((review) => review._id === id)
      if (!review) {
        return null
      }

      return review
    }

    try {
      return await apiRequest<Review>(`/reviews/${id}`)
    } catch (error) {
      console.warn(`Failed to get review with ID ${id}:`, error)
      return null
    }
  } catch (error) {
    console.warn(`Error getting review with ID ${id}:`, error)
    return null
  }
}

export async function submitReview(data: CreateReviewData): Promise<Review | null> {
  // Always log the data being submitted
  console.log("Submitting review to API:", data)

  try {
    // Prepare the request data
    const requestData = {
      movie_id: data.movie_id,
      title: data.title,
      review_text: data.review_text,
      rating: data.rating,
    }

    // Always try the real API first
    const result = await apiRequest<Review>("/reviews/", {
      method: "POST",
      body: JSON.stringify(requestData),
    })

    // If we got a valid result, return it
    if (result && result._id) {
      console.log("API response for review submission:", result)
      return result
    }

    // Otherwise fall back to mock data
    console.log("Falling back to mock data for review submission")

    // Create a new review with pending status
    const newReview: Review = {
      _id: uuidv4(),
      movie_id: data.movie_id,
      user_id: "current-user-id", // In a real app, this would be the actual user ID
      user_name: "Current User", // In a real app, this would be the actual username
      title: data.title,
      review_text: data.review_text,
      rating: data.rating,
      status: "pending",
      created_at: new Date().toISOString(),
    }

    // Add to mock reviews
    mockReviews.unshift(newReview)

    // Simulate backend adding AI moderation results after some time
    setTimeout(() => {
      const reviewIndex = mockReviews.findIndex((r) => r._id === newReview._id)
      if (reviewIndex !== -1) {
        // Simulate random moderation result
        const randomStatus = Math.random() > 0.7 ? "rejected" : "approved"
        mockReviews[reviewIndex].auto_moderation_result = {
          status: randomStatus,
          tags: randomStatus === "approved" ? ["safe", "positive"] : ["risky", "potentially_harmful"],
          issues:
            randomStatus === "approved"
              ? []
              : [
                  {
                    code: "2.3",
                    category: "Content Policy Violation",
                    description: "This is a simulated moderation issue for demonstration purposes.",
                    law: "Terms of Service",
                  },
                ],
          confidence: randomStatus === "approved" ? 0.95 : 0.75,
        }
      }
    }, 3000)

    return newReview
  } catch (error) {
    // This should never happen now, but just in case
    console.warn("Unexpected error in submitReview, using mock data:", error)

    // Create a new review with pending status
    const newReview: Review = {
      _id: uuidv4(),
      movie_id: data.movie_id,
      user_id: "current-user-id",
      user_name: "Current User",
      title: data.title,
      review_text: data.review_text,
      rating: data.rating,
      status: "pending",
      created_at: new Date().toISOString(),
    }

    // Add to mock reviews
    mockReviews.unshift(newReview)

    return newReview
  }
}

export async function updateReviewStatus(id: string, status: StatusUpdate): Promise<Review | null> {
  try {
    console.log('Обновление статуса отзыва:', id, status);
    
    // Подготавливаем строку запроса согласно документации API
    const queryParams: Record<string, any> = {
      status_update: status.status,
      moderation_comment: status.moderator_comment || "" // Параметр обязателен по документации
    };
    
    // Добавляем rejection_reason, если есть
    if (status.rejection_reason) {
      queryParams.rejection_reason = status.rejection_reason;
    }
    
    // Формируем query-строку
    const queryString = buildQueryString(queryParams);
    
    // Try the real API first - теперь передаем параметры в query, а не в body
    const result = await apiRequest<Review>(`/reviews/${id}/status${queryString}`, {
      method: "PATCH"
      // Не используем body, так как параметры в query
    })

    // If we got a valid result, return it
    if (result && result._id) {
      return result
    }

    // Otherwise fall back to mock data
    console.log(`Falling back to mock data for updating review status ${id}`)

    const reviewIndex = mockReviews.findIndex((review) => review._id === id)
    if (reviewIndex === -1) {
      return null
    }

    mockReviews[reviewIndex].status = status.status as "approved" | "rejected" | "pending"

    if (status.rejection_reason) {
      mockReviews[reviewIndex].rejection_reason = status.rejection_reason
    }
    
    // Добавляем обработку модераторского комментария
    if (status.moderator_comment !== undefined) {
      // @ts-ignore - для обхода типизации
      mockReviews[reviewIndex].moderator_comment = status.moderator_comment;
    }

    mockReviews[reviewIndex].moderation_at = new Date().toISOString()
    mockReviews[reviewIndex].moderator_id = "current-moderator-id" // In a real app, this would be the actual moderator ID

    return mockReviews[reviewIndex]
  } catch (error) {
    // This should never happen now, but just in case
    console.warn(`Unexpected error in updateReviewStatus for ID ${id}, using mock data:`, error)

    const reviewIndex = mockReviews.findIndex((review) => review._id === id)
    if (reviewIndex === -1) {
      return null
    }

    mockReviews[reviewIndex].status = status.status as "approved" | "rejected" | "pending"

    if (status.rejection_reason) {
      mockReviews[reviewIndex].rejection_reason = status.rejection_reason
    }
    
    // Добавляем обработку модераторского комментария
    if (status.moderator_comment !== undefined) {
      // @ts-ignore - для обхода типизации
      mockReviews[reviewIndex].moderator_comment = status.moderator_comment;
    }

    mockReviews[reviewIndex].moderation_at = new Date().toISOString()

    return mockReviews[reviewIndex]
  }
}

export async function deleteReview(id: string): Promise<boolean> {
  try {
    console.log(`Удаление рецензии с ID: ${id}`);
    
    // Вызов API для удаления рецензии
    const response = await fetch(`${API_BASE_URL}/reviews/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
      mode: "cors",
      credentials: "include",
    });
    
    if (response.status === 204) {
      console.log(`Рецензия с ID: ${id} успешно удалена`);
      return true;
    }
    
    console.warn(`Ошибка при удалении рецензии: ${response.status} ${response.statusText}`);
    return false;
  } catch (error) {
    console.error(`Ошибка при удалении рецензии с ID ${id}:`, error);
    return false;
  }
}

