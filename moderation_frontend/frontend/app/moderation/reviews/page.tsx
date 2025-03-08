"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useModerationAuth } from "@/contexts/moderation-auth-context"
import type { ReviewDB } from "@/types/moderation-api"
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowUpDown,
  Search,
  Calendar,
  Filter,
  Tag,
  Scale,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import ReviewCard from "@/components/moderation/review-card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { useSafeApi } from "@/hooks/use-safe-api"
import { safeAccess, safeToArray } from "@/lib/error-handling"
import { ModerationStatus } from "@/types/moderation-api"
import { parseAutoModerationResult } from "@/lib/moderation-api"
import { useToast } from "@/components/ui/use-toast"

export default function ModerationReviewsPage() {
  const [page, setPage] = useState(1)
  const { isAuthenticated } = useModerationAuth()
  const router = useRouter()
  const [retryCount, setRetryCount] = useState(0)
  const [lastError, setLastError] = useState<Error | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "relevance">("newest")
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "approved" | "rejected">("all")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedLaws, setSelectedLaws] = useState<string[]>([])
  const [localReviews, setLocalReviews] = useState<ReviewDB[]>([])
  const { toast } = useToast()

  // Use our safe API hook to fetch reviews with retry tracking
  const {
    data: reviewsData,
    isLoading,
    error,
    refetch,
  } = useSafeApi<{ pagination: { page: number; has_next: boolean }; data: ReviewDB[] }>(
    `/review/reviews?page=${page}&size=50`, // Увеличим размер страницы, чтобы получить больше данных для фильтрации
    { pagination: { page, has_next: false }, data: [] },
    [page, retryCount], // Add retryCount to dependencies to force refetch on manual retry
  )

  // Safely access the data
  const allReviews = safeToArray<ReviewDB>(safeAccess(reviewsData, "data", []))
  const currentPage = safeAccess<number, number>(reviewsData?.pagination || {}, "page", page)
  const hasNextPage = safeAccess<boolean, boolean>(reviewsData?.pagination || {}, "has_next", false)

  // Обновляем локальное состояние при получении новых данных
  useEffect(() => {
    if (allReviews.length > 0) {
      setLocalReviews(allReviews)
    }
  }, [allReviews])

  // Track errors for manual retry
  useEffect(() => {
    if (error) {
      setLastError(error)
    }
  }, [error])

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/moderation/login")
    }
  }, [isAuthenticated, router])

  // Извлекаем все уникальные теги и законы из рецензий
  const { uniqueTags, uniqueLaws } = useMemo(() => {
    const tags = new Set<string>()
    const laws = new Set<string>()

    localReviews.forEach((review) => {
      const moderationResult = parseAutoModerationResult(review.auto_moderation_result)
      if (moderationResult) {
        // Добавляем теги
        moderationResult.tags.forEach((tag) => {
          if (tag) tags.add(tag)
        })

        // Добавляем законы
        moderationResult.issues.forEach((issue) => {
          if (issue.law) laws.add(issue.law)
        })
      }
    })

    return {
      uniqueTags: Array.from(tags).sort(),
      uniqueLaws: Array.from(laws).sort(),
    }
  }, [localReviews])

  // Фильтрация и сортировка рецензий
  const filteredAndSortedReviews = useMemo(() => {
    // Сначала фильтруем по статусу
    let filtered = localReviews
    if (activeTab !== "all") {
      filtered = filtered.filter((review) => review.moderation_status === activeTab)
    }

    // Затем фильтруем по поисковому запросу
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (review) =>
          review.review_title?.toLowerCase().includes(query) ||
          review.review_text?.toLowerCase().includes(query) ||
          review.user_id?.toLowerCase().includes(query) ||
          review.movie_id?.toLowerCase().includes(query),
      )
    }

    // Фильтруем по выбранным тегам
    if (selectedTags.length > 0) {
      filtered = filtered.filter((review) => {
        const moderationResult = parseAutoModerationResult(review.auto_moderation_result)
        if (!moderationResult) return false

        // Проверяем, содержит ли рецензия хотя бы один из выбранных тегов
        return selectedTags.some((tag) => moderationResult.tags.includes(tag))
      })
    }

    // Фильтруем по выбранным законам
    if (selectedLaws.length > 0) {
      filtered = filtered.filter((review) => {
        const moderationResult = parseAutoModerationResult(review.auto_moderation_result)
        if (!moderationResult || !moderationResult.issues) return false

        // Проверяем, содержит ли рецензия хотя бы один из выбранных законов
        return selectedLaws.some((law) => moderationResult.issues.some((issue) => issue.law === law))
      })
    }

    // Сортируем результаты
    return filtered.sort((a, b) => {
      switch (sortOrder) {
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case "relevance":
          // Для "relevance" сначала показываем pending, затем approved, затем rejected
          const statusOrder = { pending: 0, approved: 1, rejected: 2 }
          const statusA = statusOrder[a.moderation_status as keyof typeof statusOrder] || 3
          const statusB = statusOrder[b.moderation_status as keyof typeof statusOrder] || 3
          if (statusA !== statusB) return statusA - statusB
          // Если статусы одинаковые, сортируем по дате (новые сверху)
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        default:
          return 0
      }
    })
  }, [localReviews, activeTab, searchQuery, sortOrder, selectedTags, selectedLaws])

  // Вычисляем количество рецензий по статусам
  const reviewCounts = useMemo(() => {
    const counts = {
      all: localReviews.length,
      pending: 0,
      approved: 0,
      rejected: 0,
      todayAll: 0,
      todayPending: 0,
      todayApproved: 0,
      todayRejected: 0,
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    localReviews.forEach((review) => {
      // Подсчет по статусам
      if (review.moderation_status === ModerationStatus.PENDING) counts.pending++
      else if (review.moderation_status === ModerationStatus.APPROVED) counts.approved++
      else if (review.moderation_status === ModerationStatus.REJECTED) counts.rejected++

      // Проверяем, создана ли рецензия сегодня
      const createdAt = new Date(review.created_at)
      if (createdAt >= today) {
        counts.todayAll++
        if (review.moderation_status === ModerationStatus.PENDING) counts.todayPending++
        else if (review.moderation_status === ModerationStatus.APPROVED) counts.todayApproved++
        else if (review.moderation_status === ModerationStatus.REJECTED) counts.todayRejected++
      }
    })

    return counts
  }, [localReviews])

  // Обработчик изменения статуса рецензии
  const handleModerationComplete = useCallback(() => {
    // Показываем уведомление
    toast({
      title: "Status updated",
      description: "The review status has been successfully updated",
      duration: 3000,
    })

    // Обновляем данные с сервера
    refetch()
  }, [refetch, toast])

  const handleNextPage = () => {
    if (hasNextPage) {
      setPage((prevPage) => prevPage + 1)
    }
  }

  const handlePrevPage = () => {
    if (page > 1) {
      setPage((prevPage) => prevPage - 1)
    }
  }

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1)
  }

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const toggleLaw = (law: string) => {
    setSelectedLaws((prev) => (prev.includes(law) ? prev.filter((l) => l !== law) : [...prev, law]))
  }

  const clearFilters = () => {
    setSelectedTags([])
    setSelectedLaws([])
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Review Moderation</h1>
          <p className="text-muted-foreground">Review and moderate user-generated content</p>
        </div>
      </div>

      {lastError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <span>{lastError.message}</span>
            <Button variant="outline" size="sm" onClick={handleRetry} className="self-start">
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search reviews..."
            className="pl-8 w-full md:w-[300px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Today: {reviewCounts.todayAll}</span>
          </div>

          {/* Фильтр по тегам */}
          {uniqueTags.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className={selectedTags.length > 0 ? "border-primary" : ""}>
                  <Tag className="h-4 w-4 mr-2" />
                  Tags {selectedTags.length > 0 && `(${selectedTags.length})`}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {uniqueTags.map((tag) => (
                  <DropdownMenuCheckboxItem
                    key={tag}
                    checked={selectedTags.includes(tag)}
                    onCheckedChange={() => toggleTag(tag)}
                  >
                    {tag.replace(/_/g, " ")}
                  </DropdownMenuCheckboxItem>
                ))}
                {selectedTags.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <div className="p-2">
                      <Button variant="ghost" size="sm" className="w-full" onClick={() => setSelectedTags([])}>
                        Clear tag filters
                      </Button>
                    </div>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Фильтр по законам */}
          {uniqueLaws.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className={selectedLaws.length > 0 ? "border-primary" : ""}>
                  <Scale className="h-4 w-4 mr-2" />
                  Laws {selectedLaws.length > 0 && `(${selectedLaws.length})`}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {uniqueLaws.map((law) => (
                  <DropdownMenuCheckboxItem
                    key={law}
                    checked={selectedLaws.includes(law)}
                    onCheckedChange={() => toggleLaw(law)}
                  >
                    {law}
                  </DropdownMenuCheckboxItem>
                ))}
                {selectedLaws.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <div className="p-2">
                      <Button variant="ghost" size="sm" className="w-full" onClick={() => setSelectedLaws([])}>
                        Clear law filters
                      </Button>
                    </div>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Сортировка */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="ml-auto">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                Sort: {sortOrder.charAt(0).toUpperCase() + sortOrder.slice(1)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuRadioGroup value={sortOrder} onValueChange={(value) => setSortOrder(value as any)}>
                <DropdownMenuRadioItem value="newest">Newest First</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="oldest">Oldest First</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="relevance">By Relevance</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Кнопка сброса всех фильтров */}
          {(selectedTags.length > 0 || selectedLaws.length > 0) && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <Filter className="h-4 w-4 mr-2" />
              Clear All Filters
            </Button>
          )}
        </div>
      </div>

      {/* Активные фильтры */}
      {(selectedTags.length > 0 || selectedLaws.length > 0) && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {selectedTags.map((tag) => (
            <Badge key={`tag-${tag}`} variant="secondary" className="flex items-center gap-1">
              <Tag className="h-3 w-3" />
              {tag.replace(/_/g, " ")}
              <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1" onClick={() => toggleTag(tag)}>
                ×
              </Button>
            </Badge>
          ))}
          {selectedLaws.map((law) => (
            <Badge key={`law-${law}`} variant="secondary" className="flex items-center gap-1">
              <Scale className="h-3 w-3" />
              {law}
              <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1" onClick={() => toggleLaw(law)}>
                ×
              </Button>
            </Badge>
          ))}
        </div>
      )}

      <Tabs defaultValue="all" value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="all" className="relative">
            All
            <Badge className="ml-1 bg-secondary text-secondary-foreground">{reviewCounts.all}</Badge>
            {reviewCounts.todayAll > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
                {reviewCounts.todayAll}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="pending" className="relative">
            <AlertTriangle className="h-4 w-4 mr-1" />
            Pending
            <Badge className="ml-1 bg-secondary text-secondary-foreground">{reviewCounts.pending}</Badge>
            {reviewCounts.todayPending > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
                {reviewCounts.todayPending}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved" className="relative">
            <CheckCircle className="h-4 w-4 mr-1" />
            Approved
            <Badge className="ml-1 bg-secondary text-secondary-foreground">{reviewCounts.approved}</Badge>
            {reviewCounts.todayApproved > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
                {reviewCounts.todayApproved}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="rejected" className="relative">
            <XCircle className="h-4 w-4 mr-1" />
            Rejected
            <Badge className="ml-1 bg-secondary text-secondary-foreground">{reviewCounts.rejected}</Badge>
            {reviewCounts.todayRejected > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
                {reviewCounts.todayRejected}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {renderReviewList()}
        </TabsContent>
        <TabsContent value="pending" className="space-y-4">
          {renderReviewList()}
        </TabsContent>
        <TabsContent value="approved" className="space-y-4">
          {renderReviewList()}
        </TabsContent>
        <TabsContent value="rejected" className="space-y-4">
          {renderReviewList()}
        </TabsContent>
      </Tabs>
    </div>
  )

  function renderReviewList() {
    if (isLoading) {
      return Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-32 w-full" />
        </div>
      ))
    }

    if (filteredAndSortedReviews.length === 0) {
      return (
        <div className="text-center py-12 border rounded-lg bg-muted/30">
          <h3 className="text-lg font-medium">No reviews found</h3>
          <p className="text-muted-foreground mt-2">
            {selectedTags.length > 0 || selectedLaws.length > 0
              ? "Try adjusting your filters"
              : searchQuery
                ? "Try adjusting your search query"
                : activeTab !== "all"
                  ? `No ${activeTab} reviews available`
                  : "No reviews available"}
          </p>
          {(selectedTags.length > 0 || selectedLaws.length > 0) && (
            <Button variant="outline" size="sm" className="mt-4" onClick={clearFilters}>
              Clear All Filters
            </Button>
          )}
        </div>
      )
    }

    return (
      <>
        <div className="space-y-4">
          {filteredAndSortedReviews.map((review) => (
            <ReviewCard
              key={review.id || `review-${Math.random()}`}
              review={review}
              onModerationComplete={handleModerationComplete}
            />
          ))}
        </div>

        {/* Pagination controls */}
        {allReviews.length > 0 && hasNextPage && (
          <div className="flex justify-between items-center pt-4">
            <Button variant="outline" onClick={handlePrevPage} disabled={page <= 1 || isLoading}>
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">Page {currentPage}</span>
            <Button variant="outline" onClick={handleNextPage} disabled={!hasNextPage || isLoading}>
              Next
            </Button>
          </div>
        )}
      </>
    )
  }
}
