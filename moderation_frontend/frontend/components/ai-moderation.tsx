import type { AIModeration } from "@/types/api"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, CheckCircle, Shield } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface AIModerationProps {
  result: AIModeration
}

export default function AIModerationComponent({ result }: AIModerationProps) {
  const { status, tags, issues, confidence } = result

  const getStatusBadge = () => {
    switch (status) {
      case "approved":
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
            <CheckCircle className="h-3 w-3 mr-1" /> Approved by AI
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
            <AlertTriangle className="h-3 w-3 mr-1" /> Rejected by AI
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
            <Shield className="h-3 w-3 mr-1" /> Review Needed
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getStatusBadge()}
          <span className="text-sm font-medium">Confidence: {(confidence * 100).toFixed(0)}%</span>
        </div>
      </div>

      {tags && tags.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Tags</h4>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="capitalize">
                {tag.replace("_", " ")}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {issues && issues.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Identified Issues</h4>
          <div className="space-y-3">
            {issues.map((issue, index) => (
              <div key={index} className="border rounded-md p-3 space-y-2 bg-muted/30">
                <div className="flex justify-between">
                  <span className="text-xs font-medium">Code: {issue.code}</span>
                  <span className="text-xs font-medium">Law: {issue.law}</span>
                </div>
                <h5 className="text-sm font-medium">{issue.category}</h5>
                <p className="text-xs text-muted-foreground">{issue.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <h4 className="text-sm font-medium">AI Confidence</h4>
        <div className="space-y-1">
          <Progress
            value={confidence * 100}
            className={`h-2 ${confidence > 0.7 ? "bg-red-500" : confidence > 0.4 ? "bg-yellow-500" : "bg-green-500"}`}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Low</span>
            <span>Medium</span>
            <span>High</span>
          </div>
        </div>
      </div>

      <div className="text-xs text-muted-foreground border-t pt-2">
        <p>AI moderation is provided as a guide. Human review is still required for final decisions.</p>
      </div>
    </div>
  )
}

