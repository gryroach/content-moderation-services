"use client"

import ReviewForm from "@/components/review-form"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getMovie, getMovieReviews } from "@/lib/api"
import type { Movie, Review } from "@/types/api"
import { Calendar, MessageCircle, PenLine, Star, User } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"

export default function MoviePage() {
  const params = useParams()
  const router = useRouter()
  const [movie, setMovie] = useState<Movie | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Reference to track if component is mounted
  const isMounted = useRef(true)
  // Reference to store the auto-refresh interval
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)
  // Reference to track if we're already fetching data
  const isRefreshingRef = useRef(false)

  // Track previous state for comparison
  const previousReviewsRef = useRef<string>("")

  // Получаем ID фильма из параметров маршрута
  const movieId = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : null

  // Function to fetch reviews
  const fetchReviews = useCallback(
    async (shouldSetLoading = false) => {
      if (!movieId || isRefreshingRef.current) return

      isRefreshingRef.current = true

      if (shouldSetLoading) {
        setIsLoading(true)
      }

      try {
        // Always try to get real data first, but silently fall back to mock data if needed
        const reviewsData = await getMovieReviews(movieId, {
          order_by: "created_at",
          direction: -1,
          page_size: 20,
          page_number: 1,
        })

        // Only update if component is still mounted and reviews have changed
        if (isMounted.current) {
          // Compare with previous state to avoid unnecessary renders
          const reviewsJson = JSON.stringify(reviewsData)
          if (reviewsJson !== previousReviewsRef.current) {
            setReviews(reviewsData)
            previousReviewsRef.current = reviewsJson
          }
        }
      } catch (error) {
        // This should never happen now, but just in case
        console.warn("Error fetching reviews:", error)
      } finally {
        isRefreshingRef.current = false
        if (shouldSetLoading && isMounted.current) {
          setIsLoading(false)
        }
      }
    },
    [movieId],
  )

  // Function to fetch movie data
  const fetchMovie = useCallback(async () => {
    if (!movieId) {
      setError("Invalid movie ID")
      setIsLoading(false)
      return
    }

    try {
      // Get movie data - will silently fall back to mock data if needed
      const movieData = await getMovie(movieId)

      if (isMounted.current) {
        if (!movieData) {
          setIsLoading(false)
          return
        }

        setMovie(movieData)
      }
    } catch (error) {
      // This should never happen now, but just in case
      console.warn("Error fetching movie data:", error)
    }
  }, [movieId])

  // Initial data fetch
  useEffect(() => {
    const fetchData = async () => {
      await fetchMovie()
      await fetchReviews(true)
    }

    fetchData()

    // Set up auto-refresh interval for reviews
    refreshIntervalRef.current = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchReviews(false)
      }
    }, 5000) // Refresh every 5 seconds

    // Cleanup function
    return () => {
      isMounted.current = false
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
    }
  }, [fetchMovie, fetchReviews])

  // Обработчик для обновления списка рецензий после отправки новой
  const handleReviewSubmitted = async () => {
    await fetchReviews(false)
  }

  // Если произошла ошибка
  if (error && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="text-muted-foreground mb-6">{error}</p>
        <button
          onClick={() => router.push("/movies")}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
        >
          Back to Movies
        </button>
      </div>
    )
  }

  // Если данные загружаются
  if (isLoading || !movie) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/3">
            <Skeleton className="aspect-[2/3] w-full h-full" />
          </div>
          <div className="w-full md:w-2/3 space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <div className="pt-4 border-t">
              <Skeleton className="h-8 w-1/2 mb-4" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Фильтруем рецензии по статусу
  const approvedReviews = reviews.filter((review) => review.status === "approved")
  const pendingReviews = reviews.filter((review) => review.status === "pending")

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/3">
          <div className="aspect-[2/3] bg-muted rounded-lg overflow-hidden">
            <img
              src={movie.poster_url || `/placeholder.svg?height=450&width=300&text=${encodeURIComponent(movie.title)}`}
              alt={movie.title}
              className="object-cover w-full h-full"
            />
          </div>
        </div>

        <div className="w-full md:w-2/3 space-y-4">
          <h1 className="text-3xl font-bold">{movie.title}</h1>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-current" />
              <span>{movie.rating}/10</span>
            </Badge>
            <span className="text-sm text-muted-foreground">
              Released: {new Date(movie.created_at).toLocaleDateString()}
            </span>
          </div>

          <div className="pt-4 border-t">
            <h2 className="text-xl font-semibold mb-4">About this movie</h2>
            <p className="text-muted-foreground">
              This is a placeholder description for {movie.title}. In a production environment, this would contain the
              actual movie description, cast information, and other details.
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="reviews" className="space-y-4">
        <TabsList>
          <TabsTrigger value="reviews" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            <span>Reviews ({approvedReviews.length})</span>
          </TabsTrigger>
          <TabsTrigger value="write-review" className="flex items-center gap-2">
            <PenLine className="h-4 w-4" />
            <span>Write a Review</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reviews" className="space-y-4">
          <Separator />

          {approvedReviews.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No reviews yet. Be the first to review this movie!
            </div>
          ) : (
            <div className="space-y-4">
              {approvedReviews.map((review) => (
                <Card key={review._id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold">{review.title}</h3>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"}`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{review.user_name || `User ${review.user_id.substring(0, 6)}`}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(review.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{review.review_text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {pendingReviews.length > 0 && (
            <div className="mt-6 p-4 border rounded-md bg-yellow-500/10 border-yellow-500/20">
              <h3 className="text-sm font-medium text-yellow-500 mb-2">
                You have {pendingReviews.length} pending {pendingReviews.length === 1 ? "review" : "reviews"} for this
                movie
              </h3>
              <p className="text-xs text-muted-foreground">
                Your {pendingReviews.length === 1 ? "review is" : "reviews are"} awaiting moderation and will be visible
                once approved.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="write-review">
          <Separator />
          <div className="py-4">
            {movieId && (
              <ReviewForm movieId={movieId} movieTitle={movie.title} onReviewSubmitted={handleReviewSubmitted} />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

