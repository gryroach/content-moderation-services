"use client"

import { StarRating } from "@/components/star-rating"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { submitReview } from "@/lib/api"
import { AlertCircle, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import type React from "react"
import { useState } from "react"

interface ReviewFormProps {
  movieId: string
  movieTitle: string
  onReviewSubmitted?: () => void
}

export default function ReviewForm({ movieId, movieTitle, onReviewSubmitted }: ReviewFormProps) {
  const [title, setTitle] = useState("")
  const [reviewText, setReviewText] = useState("")
  const [rating, setRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  // Исправим обработчик отправки формы, чтобы он правильно логировал данные
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted", { movieId, title, reviewText, rating })

    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    if (!title.trim()) {
      setError("Please enter a review title")
      return
    }

    if (!reviewText.trim()) {
      setError("Please enter your review")
      return
    }

    if (rating === 0) {
      setError("Please select a rating")
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)

      // Подготовим данные для отправки в правильном формате
      const reviewData = {
        movie_id: movieId,
        title: title.trim(),
        review_text: reviewText.trim(),
        rating,
      }

      console.log("Submitting review:", reviewData)

      const result = await submitReview(reviewData)

      console.log("Review submission result:", result)

      if (result) {
        setSuccess(true)
        setTitle("")
        setReviewText("")
        setRating(0)

        toast({
          title: "Review submitted successfully",
          description: "Your review is now pending moderation.",
          duration: 5000,
        })

        // Вызываем колбэк, если он предоставлен
        if (onReviewSubmitted) {
          setTimeout(() => {
            onReviewSubmitted()
          }, 500)
        }
      }
    } catch (err) {
      // Only log to console, don't show in UI unless it's a validation error
      console.error("Error submitting review:", err)
      // We don't set the error state here to avoid showing API errors in the UI
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <Alert className="bg-green-500/10 text-green-500 border-green-500/20">
        <CheckCircle className="h-4 w-4" />
        <AlertTitle>Review Submitted!</AlertTitle>
        <AlertDescription>
          Thank you for your review of "{movieTitle}". Your review has been submitted and is pending moderation. It will
          be visible once approved by our team.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Write a Review</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="review-rating">Your Rating</Label>
            <div id="review-rating">
              <StarRating rating={rating} onRatingChange={setRating} max={5} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="review-title">Review Title</Label>
            <Input
              id="review-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your thoughts"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="review-text">Your Review</Label>
            <Textarea
              id="review-text"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="What did you like or dislike about this movie?"
              rows={5}
              disabled={isSubmitting}
            />
          </div>

          <p className="text-xs text-muted-foreground">
            Your review will be visible after moderation. We don't allow offensive, discriminatory, or inappropriate
            content.
          </p>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

