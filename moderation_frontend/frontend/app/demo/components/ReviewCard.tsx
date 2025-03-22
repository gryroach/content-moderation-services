import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { AlertTriangle, Trash2 } from "lucide-react";
import { Review, ReviewStatus } from "../types";
import { RenderModerationComment } from "./ModerationComment";

interface ReviewCardProps {
  review: Review;
  onModerate: (review: Review) => void;
  isNew?: boolean;
  handleStatusChange?: (id: string, status: ReviewStatus) => void;
  setPendingReviewDialogOpen?: (open: boolean) => void;
  setReviewToPending?: (review: {id: string, title: string} | null) => void;
  formatDate: (dateString: string) => string;
  getStatusBadge: (status: ReviewStatus) => JSX.Element;
  handleDeleteReview?: (id: string) => Promise<boolean>;
}

/**
 * Компонент карточки отзыва
 * Отображает информацию об отзыве и кнопки для модерации
 */
export const ReviewCard = ({ 
  review, 
  onModerate, 
  isNew,
  handleStatusChange,
  setPendingReviewDialogOpen,
  setReviewToPending,
  formatDate,
  getStatusBadge,
  handleDeleteReview
}: ReviewCardProps) => {
  // Определяем, является ли отзыв обработанным
  const isProcessed = review.status === 'approved' || review.status === 'rejected';
  
  return (
    <Card 
      key={review._id}
      className={`relative ${isNew ? 'border-green-400 shadow-md animate-pulse' : ''}`}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold">{review.title}</h3>
            <div className="text-xs text-muted-foreground mt-1">
              {formatDate(review.created_at)} | Пользователь: {review.user_name}
            </div>
          </div>
          {getStatusBadge(review.status)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="whitespace-pre-line text-sm mb-4">
          {review.review_text.length > 200 
            ? `${review.review_text.slice(0, 200)}...` 
            : review.review_text}
        </div>
        
        {/* Отображаем результаты автомодерации */}
        {review.auto_moderation_result && (
          <div className="mt-3">
            <RenderModerationComment comment={review.auto_moderation_result} />
          </div>
        )}
        
        {review.status === 'rejected' && review.rejection_reason && (
          <div className="mt-2 text-xs bg-red-500/5 border border-red-500/20 p-2 rounded-md">
            <div className="font-medium text-red-500">Причина отклонения:</div>
            <div>{review.rejection_reason}</div>
          </div>
        )}
        
        {/* Отображаем комментарий модератора */}
        {review.moderator_comment && (
          <div className="mt-3">
            <RenderModerationComment comment={review.moderator_comment} />
          </div>
        )}
      </CardContent>
      <CardFooter>
        <div className="flex w-full justify-between">
          <div className="flex gap-2">
            <Button 
              variant="default" 
              size="sm" 
              onClick={() => onModerate(review)}
            >
              Модерировать
            </Button>
            
            {/* Кнопка удаления рецензии */}
            {handleDeleteReview && (
              <Button
                variant="destructive"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteReview(review._id);
                }}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" /> Удалить
              </Button>
            )}
          </div>
          
          {/* Кнопка быстрого возврата на модерацию для обработанных отзывов */}
          {isProcessed && handleStatusChange && (
            <Button
              variant="outline"
              size="sm"
              className="border-yellow-400 text-yellow-600 hover:bg-yellow-50"
              onClick={(e) => {
                e.stopPropagation();
                // Проверяем наличие функций для диалога подтверждения
                if (setPendingReviewDialogOpen && setReviewToPending) {
                  setReviewToPending({
                    id: review._id,
                    title: review.title
                  });
                  setPendingReviewDialogOpen(true);
                } else if (handleStatusChange) {
                  // Используем стандартное окно подтверждения, если диалог не доступен
                  if (confirm(`Вернуть отзыв "${review.title}" на модерацию?`)) {
                    handleStatusChange(review._id, 'pending');
                  }
                }
              }}
            >
              <AlertTriangle className="h-3 w-3 mr-1" /> В ожидание
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}; 