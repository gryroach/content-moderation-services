"use client"

import { useState } from "react"
import { Star } from "lucide-react"

interface StarRatingProps {
  rating: number
  onRatingChange?: (rating: number) => void
  max?: number
  readOnly?: boolean
  size?: "sm" | "md" | "lg"
}

export function StarRating({ rating, onRatingChange, max = 5, readOnly = false, size = "md" }: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0)

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
    <div className="flex">
      {[...Array(max)].map((_, index) => {
        const starValue = index + 1
        const isFilled = hoverRating ? starValue <= hoverRating : starValue <= rating

        return (
          <button
            key={index}
            type="button"
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => handleMouseEnter(starValue)}
            onMouseLeave={handleMouseLeave}
            className={`${getSizeClass()} ${readOnly ? "cursor-default" : "cursor-pointer"} transition-colors`}
            disabled={readOnly}
            aria-label={`Rate ${starValue} out of ${max}`}
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
