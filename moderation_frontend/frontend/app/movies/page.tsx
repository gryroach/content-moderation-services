import MovieCard from "@/components/movie-card"
import { getMovies } from "@/lib/api"

// Mock movies for development
const mockMovies = [
  { _id: "1", title: "Mock Movie 1", poster_path: "/mock1.jpg", vote_average: 7.5 },
  { _id: "2", title: "Mock Movie 2", poster_path: "/mock2.jpg", vote_average: 8.0 },
  { _id: "3", title: "Mock Movie 3", poster_path: "/mock3.jpg", vote_average: 6.5 },
]

export default async function MoviesPage() {
  try {
    const movies = await getMovies()

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Movies</h1>
          <p className="text-muted-foreground">Browse our collection of movies and leave your reviews</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {movies.map((movie) => (
            <MovieCard key={movie._id} movie={movie} />
          ))}
        </div>
      </div>
    )
  } catch (error) {
    // Log the error to console but don't show it in the UI
    console.error("Error loading movies:", error)

    // Return a generic message without exposing the error details
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Movies</h1>
          <p className="text-muted-foreground">Browse our collection of movies and leave your reviews</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* Render mock movies in development mode */}
          {process.env.NODE_ENV === "development" &&
            mockMovies.map((movie) => <MovieCard key={movie._id} movie={movie} />)}
        </div>
      </div>
    )
  }
}

