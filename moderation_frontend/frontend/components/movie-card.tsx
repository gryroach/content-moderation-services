import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"
import type { Movie } from "@/types/api"

interface MovieCardProps {
  movie: Movie
}

export default function MovieCard({ movie }: MovieCardProps) {
  return (
    <Link href={`/movies/${movie._id}`}>
      <Card className="overflow-hidden h-full transition-all hover:shadow-lg">
        <div className="aspect-[2/3] relative bg-muted">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/0 flex items-end p-4">
            <h3 className="font-semibold text-white line-clamp-2">{movie.title}</h3>
          </div>
          <img
            src={movie.poster_url || `/placeholder.svg?height=450&width=300&text=${encodeURIComponent(movie.title)}`}
            alt={movie.title}
            className="object-cover w-full h-full"
          />
        </div>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-current" />
              <span>{movie.rating}/10</span>
            </Badge>
            <span className="text-xs text-muted-foreground">{new Date(movie.created_at).toLocaleDateString()}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
