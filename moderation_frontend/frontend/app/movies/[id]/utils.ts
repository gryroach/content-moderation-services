import { getMovie, getMovieReviews } from "@/lib/api"
import { ReviewOrderBy, SortDirection } from "@/types/api"
import type { Metadata } from "next"

// Функция для получения данных фильма и рецензий
export async function getMovieData(id: string) {
  const movie = await getMovie(id)

  if (!movie) {
    return { movie: null, reviews: [] }
  }

  const reviews = await getMovieReviews(id, {
    order_by: ReviewOrderBy.CREATED_AT,
    direction: SortDirection.DESC,
    page_size: 20,
    page_number: 1,
  })

  return {
    movie,
    reviews,
    approvedReviews: reviews.filter((review) => review.status === "approved"),
    pendingReviews: reviews.filter((review) => review.status === "pending"),
  }
}

// Функция для генерации метаданных страницы
export async function generateMovieMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { movie } = await getMovieData(params.id)

  if (!movie) {
    return {
      title: "Movie Not Found",
      description: "The requested movie could not be found.",
    }
  }

  return {
    title: movie.title,
    description: `View and review ${movie.title}. Current rating: ${movie.rating}/10.`,
  }
}

