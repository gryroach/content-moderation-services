import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, CheckCircle, Shield } from "lucide-react"
import type { AutoModerationResult } from "@/types/moderation-api"
import { safeAccess, safeToArray, safeToNumber } from "@/lib/error-handling"

interface AutoModerationDisplayProps {
  result: AutoModerationResult | null
}

export default function AutoModerationDisplay({ result }: AutoModerationDisplayProps) {
  if (!result) {
    return (
      <Card className="bg-muted/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">AI Moderation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No AI moderation data available</p>
        </CardContent>
      </Card>
    )
  }

  // Safely access properties with defaults
  const status = safeAccess<string, string>(result, "status", "unknown")
  const tags = safeToArray<string>(result.tags || [])
  const issues = safeToArray<any>(result.issues || [])
  const confidence = safeToNumber(result.confidence, 0)

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
    <Card className="bg-muted/30">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">AI Moderation</CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h4 className="text-xs font-medium">AI Confidence: {(confidence * 100).toFixed(0)}%</h4>
          <Progress
            value={confidence * 100}
            className={`h-2 ${confidence > 0.7 ? "bg-red-500" : confidence > 0.4 ? "bg-yellow-500" : "bg-green-500"}`}
          />
        </div>

        {tags && tags.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium">Tags</h4>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="capitalize text-xs">
                  {typeof tag === "string" ? tag.replace("_", " ") : "unknown"}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {issues && issues.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium">Identified Issues</h4>
            <div className="space-y-2">
              {issues.map((issue, index) => {
                const code = safeAccess<string, string>(issue, "code", "unknown")
                const law = safeAccess<string, string>(issue, "law", "unknown")
                const category = safeAccess<string, string>(issue, "category", "Unknown Issue")
                const issueDescription = safeAccess<string, string>(issue, "description", "No description provided")

                return (
                  <div key={index} className="border rounded-md p-2 space-y-1 bg-background/50 text-xs">
                    <div className="flex justify-between">
                      <span className="font-medium">Code: {code}</span>
                      <span className="text-muted-foreground">Law: {law}</span>
                    </div>
                    <h5 className="font-medium">{category}</h5>
                    <p className="text-muted-foreground">{issueDescription}</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
