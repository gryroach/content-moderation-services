import { redirect } from "next/navigation"

export default function ModerationIndexPage() {
  // Redirect to the reviews page
  redirect("/moderation/reviews")
}
