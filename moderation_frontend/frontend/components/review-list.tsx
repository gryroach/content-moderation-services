"use client"

import { useState } from "react"
import type { Review } from "@/types/api"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { updateReviewStatus } from "@/lib/api"
import { CheckCircle, XCircle, AlertTriangle, User, Calendar, Film, Shield } from "lucide-react"
import AIModeration from "./ai-moderation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ReviewListProps {
  reviews: Review[]
  onStatusUpdate: (reviewId: string, status: "approved" | "rejected" | "pending", rejectionReason?: string) => void
}

export default function ReviewList({ reviews, onStatusUpdate }: ReviewListProps) {
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({})

  const handleStatusChange = async (reviewId: string, status: "approved" | "rejected" | "pending") => {
    try {
      const rejectionReason = status === "rejected" ? rejectionReasons[reviewId] : undefined

      await updateReviewStatus(reviewId, {
        status,
        rejection_reason: rejectionReason,
      })

      onStatusUpdate(reviewId, status, rejectionReason)
    } catch (error) {
      console.error("Error updating review status:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
            <CheckCircle className="h-3 w-3 mr-1" /> Approved
          </Badge>
        )
      case "rejected":
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

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review._id} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">{review.title}</CardTitle>
              {getStatusBadge(review.status)}
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-2">
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>{review.user_name || `User ID: ${review.user_id.substring(0, 8)}...`}</span>
              </div>
              <div className="flex items-center gap-1">
                <Film className="h-3 w-3" />
                <span>Movie ID: {review.movie_id.substring(0, 8)}...</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{new Date(review.created_at).toLocaleString()}</span>
              </div>
              {review.moderation_at && (
                <div className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  <span>Moderated: {new Date(review.moderation_at).toLocaleString()}</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="pb-3">
            <p className="whitespace-pre-line text-sm">{review.review_text}</p>

            {review.auto_moderation_result && (
              <Accordion type="single" collapsible className="mt-4" defaultValue="ai-moderation">
                <AccordionItem value="ai-moderation">
                  <AccordionTrigger className="text-sm">AI Moderation Analysis</AccordionTrigger>
                  <AccordionContent>
                    <AIModeration result={review.auto_moderation_result} />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}

            {review.rejection_reason && (
              <div className="mt-4 p-3 border rounded-md bg-red-500/5 border-red-500/20">
                <h4 className="text-sm font-medium text-red-500 mb-1">Rejection Reason:</h4>
                <p className="text-xs text-muted-foreground">{review.rejection_reason}</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-3 pt-0">
            {review.status === "pending" && (
              <div className="w-full">
                <Label htmlFor={`rejection-reason-${review._id}`} className="text-xs mb-1">
                  Rejection reason (required if rejecting)
                </Label>
                <Input
                  id={`rejection-reason-${review._id}`}
                  value={rejectionReasons[review._id] || ""}
                  onChange={(e) => setRejectionReasons((prev) => ({ ...prev, [review._id]: e.target.value }))}
                  placeholder="Enter reason for rejection"
                  className="text-sm mb-3"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 w-full">
              {review.status !== "approved" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-green-500/20 text-green-500 hover:bg-green-500/10"
                  onClick={() => handleStatusChange(review._id, "approved")}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              )}
              {review.status !== "rejected" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-500/20 text-red-500 hover:bg-red-500/10"
                  onClick={() => handleStatusChange(review._id, "rejected")}
                  disabled={review.status === "pending" && !rejectionReasons[review._id]?.trim()}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              )}
              {review.status !== "pending" && (
                <Button variant="outline" size="sm" onClick={() => handleStatusChange(review._id, "pending")}>
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Mark as Pending
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

