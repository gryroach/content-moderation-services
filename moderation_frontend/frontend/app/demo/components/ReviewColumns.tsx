import { Badge } from "@/components/ui/badge";
import React from "react";
import { Review, ReviewStatus } from "../types";
import { ReviewCard } from "./ReviewCard";

interface ReviewColumnsProps {
  reviews: Review[];
  isLoading: boolean;
  error: string | null;
  formatDate: (dateString: string) => string;
  getStatusBadge: (status: ReviewStatus) => React.ReactNode;
  handleModerateReview: (reviewId: string, status: ReviewStatus, comment?: string) => Promise<void>;
  setReviewToModerate: (review: Review) => void;
  setPendingReviewDialogOpen: (open: boolean) => void;
  setReviewToPending: (review: {id: string, title: string} | null) => void;
  handleDeleteReview?: (id: string) => Promise<boolean>;
}

/**
 * Компонент для отображения отзывов в трех колонках: одобренные, отклоненные, ожидающие
 */
export const ReviewColumns: React.FC<ReviewColumnsProps> = React.memo(({ 
  reviews, 
  isLoading, 
  error, 
  formatDate, 
  getStatusBadge,
  handleModerateReview,
  setReviewToModerate,
  setPendingReviewDialogOpen,
  setReviewToPending,
  handleDeleteReview
}) => {
  // Добавляем отладочное логирование
  console.log('ReviewColumns: получено отзывов', reviews?.length || 0);
  
  // Если отзывы еще загружаются, показываем индикатор загрузки
  if (isLoading) {
    console.log('ReviewColumns: состояние загрузки');
    return (
      <div className="text-center py-8 text-muted-foreground">
        Загрузка отзывов...
      </div>
    );
  }
  
  // Если возникла ошибка, показываем сообщение об ошибке
  if (error) {
    console.log('ReviewColumns: ошибка', error);
    return (
      <div className="text-center py-8 text-red-500">
        {error}
      </div>
    );
  }
  
  // Если нет отзывов, показываем сообщение
  if (!reviews || reviews.length === 0) {
    console.log('ReviewColumns: нет отзывов');
    return (
      <div className="text-center py-8 text-muted-foreground">
        Нет отзывов для модерации
      </div>
    );
  }
  
  // Функция модерации комментария
  const handleModerateComment = (reviewId: string, status: ReviewStatus, newComment?: string) => {
    console.log('ReviewColumns: попытка модерации комментария', { reviewId, status, newComment: !!newComment });
    handleModerateReview(reviewId, status, newComment);
  };
  
  // Фильтруем отзывы по статусам
  const pendingReviews = reviews.filter(review => review.status === "pending");
  const approvedReviews = reviews.filter(review => review.status === "approved");
  const rejectedReviews = reviews.filter(review => review.status === "rejected");
  
  console.log('ReviewColumns: отфильтровано отзывов', {
    pending: pendingReviews.length,
    approved: approvedReviews.length,
    rejected: rejectedReviews.length
  });
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
      {/* Одобренные отзывы */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium">Одобренные</h3>
          <Badge className="bg-green-500/10 text-green-500 border-green-500/20">{approvedReviews.length}</Badge>
        </div>
        {approvedReviews.length > 0 ? (
          <div className="space-y-4">
            {approvedReviews.map((review) => (
              <ReviewCard
                key={review._id}
                review={review}
                onModerate={setReviewToModerate}
                handleStatusChange={(id, status) => handleModerateReview(id, status)}
                setPendingReviewDialogOpen={setPendingReviewDialogOpen}
                setReviewToPending={setReviewToPending}
                formatDate={formatDate}
                getStatusBadge={getStatusBadge}
                handleDeleteReview={handleDeleteReview}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground bg-muted/20 rounded-md">
            Отзывов нет
          </div>
        )}
      </div>
      
      {/* Отклоненные отзывы */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium">Отклоненные</h3>
          <Badge className="bg-red-500/10 text-red-500 border-red-500/20">{rejectedReviews.length}</Badge>
        </div>
        {rejectedReviews.length > 0 ? (
          <div className="space-y-4">
            {rejectedReviews.map((review) => (
              <ReviewCard
                key={review._id}
                review={review}
                onModerate={setReviewToModerate}
                handleStatusChange={(id, status) => handleModerateReview(id, status)}
                setPendingReviewDialogOpen={setPendingReviewDialogOpen}
                setReviewToPending={setReviewToPending}
                formatDate={formatDate}
                getStatusBadge={getStatusBadge}
                handleDeleteReview={handleDeleteReview}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground bg-muted/20 rounded-md">
            Отзывов нет
          </div>
        )}
      </div>
      
      {/* Ожидающие модерации отзывы */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium">Ожидают модерации</h3>
          <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">{pendingReviews.length}</Badge>
        </div>
        {pendingReviews.length > 0 ? (
          <div className="space-y-4">
            {pendingReviews.map((review) => (
              <ReviewCard
                key={review._id}
                review={review}
                onModerate={setReviewToModerate}
                handleStatusChange={(id, status) => handleModerateReview(id, status)}
                setPendingReviewDialogOpen={setPendingReviewDialogOpen}
                setReviewToPending={setReviewToPending}
                formatDate={formatDate}
                getStatusBadge={getStatusBadge}
                handleDeleteReview={handleDeleteReview}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground bg-muted/20 rounded-md">
            Отзывов нет
          </div>
        )}
      </div>
    </div>
  );
}); 