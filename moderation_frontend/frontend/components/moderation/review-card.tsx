"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { isDefined, safeAccess, suppressErrors } from "@/lib/error-handling"
import { formatDate, moderateReview, parseAutoModerationResult, truncateString } from "@/lib/moderation-api"
import { ModerationStatus, ModerationStatusRequest, type ReviewDB } from "@/types/moderation-api"
import { AlertTriangle, Calendar, CheckCircle, Clock, Film, User, XCircle } from "lucide-react"
import { useEffect, useState } from "react"
import AutoModerationDisplay from "./auto-moderation-display"

interface ReviewCardProps {
  review: ReviewDB
  onModerationComplete: (reviewId: string, status: ModerationStatus, rejectionReason?: string) => void
}

export default function ReviewCard({ review, onModerationComplete }: ReviewCardProps) {
  const [rejectionReason, setRejectionReason] = useState(review.rejection_reason || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [currentStatus, setCurrentStatus] = useState<ModerationStatus>(review.moderation_status)
  const [localReview, setLocalReview] = useState<ReviewDB>(review)

  // Обновляем локальное состояние, когда приходят новые пропсы
  useEffect(() => {
    setLocalReview(review)
    setCurrentStatus(review.moderation_status)
  }, [review])

  // Safely parse the auto moderation result
  const autoModerationResult = parseAutoModerationResult(localReview.auto_moderation_result)

  // Safely access review properties
  const reviewId = safeAccess<string, string>(localReview, "id", "unknown")
  const userId = safeAccess<string, string>(localReview, "user_id", "unknown")
  const movieId = safeAccess<string, string>(localReview, "movie_id", "unknown")
  const reviewTitle = safeAccess<string, string>(localReview, "review_title", "Untitled Review")
  const reviewText = safeAccess<string, string>(localReview, "review_text", "No content")
  const createdAt = safeAccess<string, string>(localReview, "created_at", "")

  // Проверяем, создана ли рецензия сегодня
  const isCreatedToday = () => {
    if (!createdAt) return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const reviewDate = new Date(createdAt)
    return reviewDate >= today
  }

  const handleModerate = async (status: ModerationStatusRequest | "pending") => {
    // Validate rejection reason if rejecting
    if (status === ModerationStatusRequest.REJECTED && !rejectionReason.trim()) {
      setError("Please provide a reason for rejection")
      return
    }

    setError(null)
    setIsSubmitting(true)

    try {
      console.log(`Moderating review ${reviewId} with status: ${status}`)

      // Для статуса pending не требуется причина отклонения
      const reason =
        status === "pending"
          ? "Empty"
          : status === ModerationStatusRequest.REJECTED
            ? rejectionReason
            : "Not applicable"

      // Use suppressErrors to prevent UI errors
      const result = await suppressErrors(async () => await moderateReview(reviewId, status, reason), {
        success: false,
      })

      if (result && result.success) {
        // Обновляем локальное состояние карточки
        setCurrentStatus(status as ModerationStatus)

        // Обновляем локальную копию рецензии
        setLocalReview((prev) => ({
          ...prev,
          moderation_status: status as ModerationStatus,
          rejection_reason: status === ModerationStatusRequest.REJECTED ? rejectionReason : null,
          moderation_at: new Date().toISOString(),
        }))

        // Уведомляем родительский компонент об изменении
        onModerationComplete(
          reviewId,
          status as ModerationStatus,
          status === ModerationStatusRequest.REJECTED ? rejectionReason : undefined,
        )
      } else {
        setError("Failed to update review status. Please try again.")
      }
    } catch (err) {
      console.error("Error in handleModerate:", err)
      setError(`Failed to update review status: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = () => {
    switch (currentStatus) {
      case ModerationStatus.APPROVED:
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
            <CheckCircle className="h-3 w-3 mr-1" /> Approved
          </Badge>
        )
      case ModerationStatus.REJECTED:
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
            <XCircle className="h-3 w-3 mr-1" /> Rejected
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
            <AlertTriangle className="h-3 w-3 mr-1" /> Pending
          </Badge>
        )
    }
  }

  // Safely truncate user and movie IDs for display
  const displayUserId = truncateString(userId, 8)
  const displayMovieId = truncateString(movieId, 8)
  const formattedDate = formatDate(createdAt)

  return (
    <Card className={`mb-4 ${isCreatedToday() ? "border-primary/50" : ""}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              {reviewTitle}
              {isCreatedToday() && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                        <Clock className="h-3 w-3 mr-1" /> Today
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>This review was created today</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </h3>
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-1">
              {isDefined(userId) && (
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>User ID: {displayUserId}</span>
                </div>
              )}
              {isDefined(movieId) && (
                <div className="flex items-center gap-1">
                  <Film className="h-3 w-3" />
                  <span>Movie ID: {displayMovieId}</span>
                </div>
              )}
              {isDefined(createdAt) && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formattedDate}</span>
                </div>
              )}
            </div>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="whitespace-pre-line text-sm border-l-4 border-muted p-3 bg-muted/30 rounded">
          {isExpanded || reviewText.length <= 300 ? (
            reviewText
          ) : (
            <>
              {reviewText.substring(0, 300)}...
              <Button variant="link" size="sm" onClick={() => setIsExpanded(true)} className="p-0 h-auto">
                Show more
              </Button>
            </>
          )}
        </div>

        {autoModerationResult && <AutoModerationDisplay result={autoModerationResult} />}

        {isDefined(localReview.rejection_reason) &&
          localReview.rejection_reason &&
          currentStatus === ModerationStatus.REJECTED && (
            <div className="p-3 border rounded-md bg-red-500/5 border-red-500/20">
              <h4 className="text-sm font-medium text-red-500 mb-1">Rejection Reason:</h4>
              <p className="text-xs text-muted-foreground">{localReview.rejection_reason}</p>
            </div>
          )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {currentStatus === ModerationStatus.PENDING && (
          <div className="space-y-2">
            <Label htmlFor={`rejection-reason-${reviewId}`}>Rejection reason (required if rejecting)</Label>
            <Textarea
              id={`rejection-reason-${reviewId}`}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter reason for rejection"
              rows={3}
              disabled={isSubmitting}
            />
          </div>
        )}
      </CardContent>

      {/* Кнопки модерации */}
      <CardFooter className="flex justify-end gap-2">
        {currentStatus === ModerationStatus.PENDING && (
          <>
            <Button
              variant="outline"
              size="sm"
              className="border-green-500/20 text-green-500 hover:bg-green-500/10"
              onClick={() => handleModerate(ModerationStatusRequest.APPROVED)}
              disabled={isSubmitting}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-red-500/20 text-red-500 hover:bg-red-500/10"
              onClick={() => handleModerate(ModerationStatusRequest.REJECTED)}
              disabled={isSubmitting || !rejectionReason.trim()}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </>
        )}

        {/* Кнопки для изменения статуса уже промодерированных рецензий */}
        {currentStatus === ModerationStatus.APPROVED && (
          <Button
            variant="outline"
            size="sm"
            className="border-yellow-500/20 text-yellow-500 hover:bg-yellow-500/10"
            onClick={() => handleModerate("pending")}
            disabled={isSubmitting}
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Mark as Pending
          </Button>
        )}

        {currentStatus === ModerationStatus.REJECTED && (
          <Button
            variant="outline"
            size="sm"
            className="border-yellow-500/20 text-yellow-500 hover:bg-yellow-500/10"
            onClick={() => handleModerate("pending")}
            disabled={isSubmitting}
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Mark as Pending
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

