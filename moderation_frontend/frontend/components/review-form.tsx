"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { StarRating } from "@/components/star-rating"
import { submitReview } from "@/lib/api"
import { AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"

interface ReviewFormProps {
  movieId: string
  movieTitle: string
}

export default function ReviewForm({ movieId, movieTitle }: ReviewFormProps) {
  const [title, setTitle] = useState("")
  const [reviewText, setReviewText] = useState("")
  const [rating, setRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

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

      await submitReview({
        movie_id: movieId,
        title: title.trim(),
        review_text: reviewText.trim(),
        rating,
      })

      setSuccess(true)
      setTitle("")
      setReviewText("")
      setRating(0)

      // Refresh the page after 2 seconds to show the pending review
      setTimeout(() => {
        router.refresh()
      }, 2000)
    } catch (err) {
      setError("Failed to submit review. Please try again.")
      console.error("Error submitting review:", err)
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
            <Label htmlFor="rating">Your Rating</Label>
            <StarRating rating={rating} onRatingChange={setRating} max={5} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Review Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your thoughts"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="review">Your Review</Label>
            <Textarea
              id="review"
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
