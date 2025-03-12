import type { AIModeration, Movie, Review } from "@/types/api"
import { v4 as uuidv4 } from "uuid"

// Mock movie data with poster images
export const mockMovies: Movie[] = [
  {
    _id: "1a2b3c4d-5e6f-4a8b-9c0d-1e2f3a4b5c6d",
    title: "The Dark Knight",
    rating: 9,
    created_at: new Date(2022, 0, 15).toISOString(),
    poster_url: "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_.jpg",
  },
  {
    _id: "2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q",
    title: "Inception",
    rating: 8,
    created_at: new Date(2022, 1, 20).toISOString(),
    poster_url: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_.jpg",
  },
  {
    _id: "3c4d5e6f-7g8h-9i0j-1k2l-3m4n5o6p7q8r",
    title: "Interstellar",
    rating: 8,
    created_at: new Date(2022, 2, 25).toISOString(),
    poster_url:
      "https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg",
  },
  {
    _id: "4d5e6f7g-8h9i-0j1k-2l3m-4n5o6p7q8r9s",
    title: "The Shawshank Redemption",
    rating: 9,
    created_at: new Date(2022, 3, 10).toISOString(),
    poster_url:
      "https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NmNlLWJiNDMtZDViZWM2MzIxZDYwXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_.jpg",
  },
  {
    _id: "5e6f7g8h-9i0j-1k2l-3m4n-5o6p7q8r9s0t",
    title: "Pulp Fiction",
    rating: 8,
    created_at: new Date(2022, 4, 5).toISOString(),
    poster_url:
      "https://m.media-amazon.com/images/M/MV5BNGNhMDIzZTUtNTBlZi00MTRlLWFjM2ItYzViMjE3YzI5MjljXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg",
  },
  {
    _id: "6f7g8h9i-0j1k-2l3m-4n5o-6p7q8r9s0t1u",
    title: "The Godfather",
    rating: 9,
    created_at: new Date(2022, 5, 15).toISOString(),
    poster_url:
      "https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg",
  },
  {
    _id: "7g8h9i0j-1k2l-3m4n-5o6p-7q8r9s0t1u2v",
    title: "Fight Club",
    rating: 8,
    created_at: new Date(2022, 6, 20).toISOString(),
    poster_url:
      "https://m.media-amazon.com/images/M/MV5BMmEzNTkxYjQtZTc0MC00YTVjLTg5ZTEtZWMwOWVlYzY0NWIwXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg",
  },
  {
    _id: "8h9i0j1k-2l3m-4n5o-6p7q-8r9s0t1u2v3w",
    title: "Forrest Gump",
    rating: 8,
    created_at: new Date(2022, 7, 25).toISOString(),
    poster_url:
      "https://m.media-amazon.com/images/M/MV5BNWIwODRlZTUtY2U3ZS00Yzg1LWJhNzYtMmZiYmEyNmU1NjMzXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_.jpg",
  },
]

// Generate consistent review IDs for reference
const reviewIds = {
  darkKnight1: uuidv4(),
  darkKnight2: uuidv4(),
  inception1: uuidv4(),
  inception2: uuidv4(),
  interstellar1: uuidv4(),
  shawshank1: uuidv4(),
  pulpFiction1: uuidv4(),
  godfather1: uuidv4(),
  fightClub1: uuidv4(),
  forrestGump1: uuidv4(),
}

// Mock review data with different statuses and AI moderation results
export const mockReviews: Review[] = [
  {
    _id: reviewIds.darkKnight1,
    movie_id: "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p", // The Dark Knight
    user_id: uuidv4(),
    title: "Amazing movie!",
    review_text:
      "This is one of the best movies I have ever seen. The acting, direction, and screenplay are all top-notch. Heath Ledger's performance as the Joker is legendary and deserved the Oscar. The practical effects and stunts are incredible, and the story is engaging from start to finish.",
    rating: 5,
    status: "approved",
    created_at: new Date(2023, 0, 10).toISOString(),
    auto_moderation_result: {
      status: "approved",
      tags: ["positive", "safe"],
      issues: [],
      confidence: 0.95,
    },
    moderation_at: new Date(2023, 0, 11).toISOString(),
    moderator_id: uuidv4(),
    user_name: "MovieFan123",
  },
  {
    _id: reviewIds.darkKnight2,
    movie_id: "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p", // The Dark Knight
    user_id: uuidv4(),
    title: "Overrated and too dark",
    review_text:
      "I don't understand the hype around this movie. It's too dark and depressing. The runtime is also too long, and some scenes drag on unnecessarily. Not a fan of this take on Batman.",
    rating: 2,
    status: "approved",
    created_at: new Date(2023, 1, 5).toISOString(),
    auto_moderation_result: {
      status: "approved",
      tags: ["negative", "critical", "safe"],
      issues: [],
      confidence: 0.89,
    },
    moderation_at: new Date(2023, 1, 6).toISOString(),
    moderator_id: uuidv4(),
    user_name: "CriticEye",
  },
  {
    _id: reviewIds.inception1,
    movie_id: "2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q", // Inception
    user_id: uuidv4(),
    title: "Mind-bending experience",
    review_text:
      "This movie will make you question reality. The concept is brilliant and execution is flawless. Christopher Nolan has created a masterpiece that combines action, sci-fi, and philosophical questions about reality and perception. The visual effects are stunning and the score by Hans Zimmer is perfect.",
    rating: 5,
    status: "approved",
    created_at: new Date(2023, 1, 15).toISOString(),
    auto_moderation_result: {
      status: "approved",
      tags: ["positive", "safe"],
      issues: [],
      confidence: 0.92,
    },
    moderation_at: new Date(2023, 1, 16).toISOString(),
    moderator_id: uuidv4(),
    user_name: "DreamExplorer",
  },
  {
    _id: reviewIds.inception2,
    movie_id: "2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q", // Inception
    user_id: uuidv4(),
    title: "Too complicated for its own good",
    review_text:
      "While visually impressive, the plot is unnecessarily convoluted. The movie tries too hard to be clever and ends up being confusing. The ending is ambiguous just for the sake of being ambiguous.",
    rating: 3,
    status: "approved",
    created_at: new Date(2023, 2, 10).toISOString(),
    auto_moderation_result: {
      status: "approved",
      tags: ["mixed", "critical", "safe"],
      issues: [],
      confidence: 0.88,
    },
    moderation_at: new Date(2023, 2, 11).toISOString(),
    moderator_id: uuidv4(),
    user_name: "SimplePlot",
  },
  {
    _id: reviewIds.interstellar1,
    movie_id: "3c4d5e6f-7g8h-9i0j-1k2l-3m4n5o6p7q8r", // Interstellar
    user_id: uuidv4(),
    title: "Overrated sci-fi",
    review_text:
      "I don't understand why people like this movie so much. The plot has holes and the characters are underdeveloped. The science is questionable at best, and the ending feels like a cop-out.",
    rating: 2,
    status: "pending",
    created_at: new Date(2023, 2, 20).toISOString(),
    auto_moderation_result: {
      status: "review",
      tags: ["negative", "critical"],
      issues: [],
      confidence: 0.75,
    },
    user_name: "ScienceNerd",
  },
  {
    _id: reviewIds.shawshank1,
    movie_id: "4d5e6f7g-8h9i-0j1k-2l3m-4n5o6p7q8r9s", // The Shawshank Redemption
    user_id: uuidv4(),
    title: "A masterpiece",
    review_text:
      "This film should be studied in every film school. It's a perfect example of storytelling and character development. The performances by Tim Robbins and Morgan Freeman are outstanding, and the themes of hope and redemption are beautifully portrayed.",
    rating: 5,
    status: "pending",
    created_at: new Date(2023, 3, 25).toISOString(),
    auto_moderation_result: {
      status: "approved",
      tags: ["positive", "educational"],
      issues: [],
      confidence: 0.88,
    },
    user_name: "FilmStudent22",
  },
  {
    _id: reviewIds.pulpFiction1,
    movie_id: "5e6f7g8h-9i0j-1k2l-3m4n-5o6p7q8r9s0t", // Pulp Fiction
    user_id: uuidv4(),
    title: "Too violent",
    review_text:
      "This movie glorifies violence and criminal behavior. It sends a terrible message to young viewers. I think movies like this contribute to the moral decay of our society.",
    rating: 1,
    status: "pending",
    created_at: new Date(2023, 4, 5).toISOString(),
    auto_moderation_result: {
      status: "rejected",
      tags: ["negative", "risky", "potentially_harmful"],
      issues: [
        {
          code: "2.3",
          category: "Пропаганда насилия",
          description: "Содержит утверждения о моральном разложении общества.",
          law: "ФЗ №436-ФЗ",
        },
      ],
      confidence: 0.65,
    },
    user_name: "MoralGuardian",
  },
  {
    _id: reviewIds.godfather1,
    movie_id: "6f7g8h9i-0j1k-2l3m-4n5o-6p7q8r9s0t1u", // The Godfather
    user_id: uuidv4(),
    title: "Classic for a reason",
    review_text:
      "There's a reason this is considered one of the greatest films ever made. Every aspect of filmmaking is at its peak here. The performances, direction, screenplay, cinematography, and score are all perfect. Marlon Brando and Al Pacino deliver iconic performances.",
    rating: 5,
    status: "pending",
    created_at: new Date(2023, 5, 10).toISOString(),
    auto_moderation_result: {
      status: "approved",
      tags: ["positive", "safe"],
      issues: [],
      confidence: 0.91,
    },
    user_name: "CinematicLegend",
  },
  {
    _id: reviewIds.fightClub1,
    movie_id: "7g8h9i0j-1k2l-3m4n-5o6p-7q8r9s0t1u2v", // Fight Club
    user_id: uuidv4(),
    title: "Promotes dangerous ideas",
    review_text:
      "This movie promotes terrorism and anarchy. The main character is basically a terrorist who wants to destroy society. People who enjoy this kind of content should be on a watchlist.",
    rating: 1,
    status: "pending",
    created_at: new Date(2023, 6, 15).toISOString(),
    auto_moderation_result: {
      status: "rejected",
      tags: ["legal", "risky", "potentially_illegal"],
      issues: [
        {
          code: "1.1",
          category: "Противодействие экстремизму",
          description: "Призывы к формированию негативного отношения к определенным группам людей.",
          law: "ФЗ №114-ФЗ",
        },
        {
          code: "1.3",
          category: "Пропаганда терроризма",
          description: "Положительная оценка террористической деятельности.",
          law: "ФЗ №35-ФЗ",
        },
      ],
      confidence: 0.9,
    },
    user_name: "ConcernedCitizen",
  },
  {
    _id: reviewIds.forrestGump1,
    movie_id: "8h9i0j1k-2l3m-4n5o-6p7q-8r9s0t1u2v3w", // Forrest Gump
    user_id: uuidv4(),
    title: "Heartwarming story",
    review_text:
      "This movie always makes me cry. It's a beautiful story about love, perseverance, and the human spirit. Tom Hanks delivers an incredible performance as Forrest, and the way the character interacts with historical events is both entertaining and touching.",
    rating: 5,
    status: "rejected",
    created_at: new Date(2023, 7, 20).toISOString(),
    auto_moderation_result: {
      status: "approved",
      tags: ["positive", "emotional"],
      issues: [],
      confidence: 0.87,
    },
    rejection_reason: "Review contains spoilers for a key plot point.",
    moderation_at: new Date(2023, 7, 21).toISOString(),
    moderator_id: uuidv4(),
    user_name: "EmotionalViewer",
  },
]

export const mockAIModeration: { [key: string]: AIModeration } = {
  "7g8h9i0j-1k2l-3m4n-5o6p-7q8r9s0t1u2v": {
    status: "rejected",
    tags: ["legal", "risky", "potentially_illegal"],
    issues: [
      {
        code: "1.1",
        category: "Противодействие экстремизму",
        description: "Призывы к формированию негативного отношения к определенным группам людей.",
        law: "ФЗ №114-ФЗ",
      },
      {
        code: "1.3",
        category: "Пропаганда терроризма",
        description: "Положительная оценка террористической деятельности.",
        law: "ФЗ №35-ФЗ",
      },
    ],
    confidence: 0.9,
  },
}

