"use client"

import { Star } from "lucide-react"
import { useState } from "react"

interface StarRatingProps {
  rating: number
  onRatingChange?: (rating: number) => void
  max?: number
  readOnly?: boolean
  size?: "sm" | "md" | "lg"
}

export function StarRating({ rating, onRatingChange, max = 5, readOnly = false, size = "md" }: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0)
  const ratingId = `star-rating-${Math.random().toString(36).substring(2, 9)}`

  const handleClick = (index: number) => {
    if (!readOnly && onRatingChange) {
      // If clicking the same star twice, clear the rating
      if (rating === index) {
        onRatingChange(0)
      } else {
        onRatingChange(index)
      }
    }
  }

  const handleMouseEnter = (index: number) => {
    if (!readOnly) {
      setHoverRating(index)
    }
  }

  const handleMouseLeave = () => {
    if (!readOnly) {
      setHoverRating(0)
    }
  }

  const getSizeClass = () => {
    switch (size) {
      case "sm":
        return "h-4 w-4"
      case "lg":
        return "h-8 w-8"
      default:
        return "h-6 w-6"
    }
  }

  return (
    <div className="flex" role="radiogroup" aria-labelledby={ratingId} aria-describedby={`${ratingId}-description`}>
      <span id={ratingId} className="sr-only">
        Rating
      </span>
      <span id={`${ratingId}-description`} className="sr-only">
        Select a rating from 1 to {max} stars
      </span>

      {[...Array(max)].map((_, index) => {
        const starValue = index + 1
        const isFilled = hoverRating ? starValue <= hoverRating : starValue <= rating
        const starId = `${ratingId}-star-${starValue}`

        return (
          <button
            key={index}
            id={starId}
            type="button"
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => handleMouseEnter(starValue)}
            onMouseLeave={handleMouseLeave}
            className={`${getSizeClass()} ${readOnly ? "cursor-default" : "cursor-pointer"} transition-colors`}
            disabled={readOnly}
            aria-checked={starValue <= rating}
            aria-label={`${starValue} star${starValue !== 1 ? "s" : ""}`}
            role="radio"
          >
            <Star
              className={`${getSizeClass()} ${isFilled ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"}`}
            />
          </button>
        )
      })}
    </div>
  )
}

