/* eslint-disable */
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { RenderModerationComment, ReviewColumns, StatusBadge } from "./components";
import { useFormatDate, useReviews } from "./hooks";
import { Review, ReviewStatus } from "./types";

const DEMO_MOVIE_ID = "11111111-1111-1111-1111-111111111111";

// Пример отзыва с комментарием модератора для демонстрации
const demoReviewWithModeratorComment: Review = {
  _id: "5bcea503-041d-48d5-af73-d8a7dedd3e2c",
  movie_id: DEMO_MOVIE_ID,
  user_id: "67577aac-e2a2-4531-b674-a893c8294f34",
  user_name: "DemoUser",
  title: "Отличный фильм!",
  review_text: "Я считаю туда надо было отправить фронтендера, потому что это профессия хуже говновоза",
  rating: 0,
  status: "rejected" as ReviewStatus,
  moderator_comment: "{\"status\": \"rejected\", \"tags\": [\"legal\", \"risky\"], \"issues\": [{\"code\": \"2282.nan.undefined\", \"category\": \"Призывы к ненависти к фронтендерам\", \"description\": \"Унижение профессии фронтендера\", \"law\": \"ст. 2282.nan.undefined JSTS\"}], \"confidence\": 1}",
  created_at: "2025-03-17T15:11:29.578000",
  auto_moderation_processed: true
};

/**
 * Главная страница приложения модерации отзывов
 */
export default function DemoPage() {
  // Состояние для отзывов
  const { 
    reviews: allReviews, 
    loadingReviews, 
    error, 
    fetchReviews, 
    isRefreshing,
    handleModerateReview,
    updateReviewStatus,
    handleDeleteReview
  } = useReviews();
  
  // Состояние для диалогов и модерации
  const [reviewToModerate, setReviewToModerate] = useState<Review | null>(null);
  const [reviewToPending, setReviewToPending] = useState<{id: string, title: string} | null>(null);
  const [pendingReviewDialogOpen, setPendingReviewDialogOpen] = useState(false);
  const [moderatorComment, setModeratorComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Форматирование даты
  const { formatDate } = useFormatDate();
  
  useEffect(() => {
    if (reviewToModerate?.moderator_comment) {
      if (typeof reviewToModerate.moderator_comment === 'string') {
        setModeratorComment(reviewToModerate.moderator_comment);
      } else {
        // Если комментарий - объект, преобразуем его в JSON-строку
        setModeratorComment(JSON.stringify(reviewToModerate.moderator_comment, null, 2));
      }
    } else {
      setModeratorComment("");
    }
  }, [reviewToModerate]);
  
  // Функция для обработки подтверждения возврата отзыва на модерацию
  const handleConfirmReturnToPending = async () => {
    if (!reviewToPending) return;
    
    try {
      // Очищаем модераторский комментарий при возврате на модерацию
      await handleModerateReview(reviewToPending.id, 'pending');
      
      // Закрываем диалог после успешного обновления
      setPendingReviewDialogOpen(false);
      setReviewToPending(null);
    } catch (error) {
      console.error('Ошибка при возврате отзыва на модерацию:', error);
    }
  };
  
  // Функция для обработки формы модерации отзыва
  const handleSubmitModeration = async (status: ReviewStatus) => {
    if (!reviewToModerate) return;
    
    setIsSubmitting(true);
    
    try {
      await handleModerateReview(reviewToModerate._id, status, moderatorComment || undefined);
      
      // Сбрасываем форму модерации после успешного обновления
      setReviewToModerate(null);
      setModeratorComment("");
    } catch (error) {
      console.error('Ошибка при отправке модерации:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Функция для прямой модерации комментария
  const handleModerateComment = async (status: ReviewStatus, newComment?: string) => {
    if (!reviewToModerate) {
      console.error('Отзыв для модерации не найден');
      return;
    }
    
    try {
      // Если передан новый комментарий, используем его
      const commentContent = newComment !== undefined ? newComment : moderatorComment;
      
      const result = await updateReviewStatus(
        reviewToModerate._id, 
        status,
        commentContent
      );
      
      if (result) {
        // Закрываем диалог модерации отзыва
        setReviewToModerate(null);
        // Обновляем список отзывов
        fetchReviews(false);
      } else {
        console.error('Не удалось промодерировать комментарий');
        alert('Ошибка при обработке комментария. Пожалуйста, попробуйте еще раз.');
      }
    } catch (error) {
      console.error('Ошибка при модерации комментария:', error);
      alert('Произошла ошибка при модерации комментария. Пожалуйста, попробуйте еще раз.');
    }
  };
  
  return (
    <main className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Демо модерации контента</h1>
      
      {/* Секция отзывов */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Отзывы</h2>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => fetchReviews(true)}
            disabled={loadingReviews}
          >
            {loadingReviews ? (
              <>Загрузка...</>
            ) : isRefreshing ? (
              <>Обновление...</>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" /> Обновить
              </>
            )}
          </Button>
        </div>
        
        <Separator />
        
        {/* Отображение отзывов по категориям */}
        {console.log('Передаем в ReviewColumns отзывы:', allReviews?.length || 0)}
        <ReviewColumns
          reviews={allReviews || []}
          isLoading={loadingReviews}
          error={error}
          formatDate={formatDate}
          getStatusBadge={(status) => <StatusBadge status={status} />}
          handleModerateReview={handleModerateReview}
          setReviewToModerate={setReviewToModerate}
          setPendingReviewDialogOpen={setPendingReviewDialogOpen}
          setReviewToPending={setReviewToPending}
          handleDeleteReview={handleDeleteReview}
        />
      </div>
      
      {/* Диалог модерации отзыва */}
      <Dialog open={!!reviewToModerate} onOpenChange={(open) => !open && setReviewToModerate(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Модерация отзыва</DialogTitle>
            <DialogDescription>
              Просмотрите отзыв и примите решение о его публикации
            </DialogDescription>
          </DialogHeader>
          
          {reviewToModerate && (
            <div className="py-4 space-y-4">
              <div>
                <h3 className="font-medium text-lg">{reviewToModerate.title}</h3>
                <div className="text-sm text-muted-foreground">
                  {formatDate(reviewToModerate.created_at)} | Пользователь: {reviewToModerate.user_name}
                </div>
                <div className="text-sm text-muted-foreground">
                  ID рецензии: {reviewToModerate._id} | Статус: {reviewToModerate.status}
                </div>
                <div className="text-sm text-muted-foreground">
                  Автомодерация: {reviewToModerate.auto_moderation_processed ? 'Выполнена' : 'Не выполнена'} 
                  | Результат: {reviewToModerate.auto_moderation_result ? 'Есть' : 'Отсутствует'}
                </div>
              </div>
              
              <div className="whitespace-pre-line text-sm p-4 bg-muted rounded-md">
                {reviewToModerate.review_text}
              </div>
              
              {/* Результаты автомодерации */}
              {reviewToModerate.auto_moderation_result && (
                <div>
                  <div className="text-sm font-medium">Результат автомодерации:</div>
                  <RenderModerationComment 
                    comment={reviewToModerate.auto_moderation_result} 
                    showModerateButtons={false}
                  />
                </div>
              )}
              
              {/* Отображаем комментарий модератора, если есть */}
              {reviewToModerate.moderator_comment && (
                <div>
                  <div className="text-sm font-medium">Комментарий модератора:</div>
                  <RenderModerationComment 
                    comment={reviewToModerate.moderator_comment}
                    showModerateButtons={false}
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <label htmlFor="moderator-comment" className="text-sm font-medium">
                  Комментарий модератора:
                </label>
                <textarea
                  id="moderator-comment"
                  className="w-full h-24 p-2 border rounded-md"
                  value={moderatorComment}
                  onChange={(e) => setModeratorComment(e.target.value)}
                  placeholder="Укажите причину отклонения или другие замечания..."
                />
              </div>
            </div>
          )}
          
          <DialogFooter className="flex justify-between">
            <Button
              variant="destructive"
              onClick={() => handleSubmitModeration('rejected')}
              disabled={isSubmitting}
            >
              Отклонить
            </Button>
            <div className="space-x-2">
              <Button
                variant="outline"
                onClick={() => setReviewToModerate(null)}
                disabled={isSubmitting}
              >
                Отмена
              </Button>
              <Button 
                variant="warning" 
                onClick={() => handleSubmitModeration('pending')}
                disabled={isSubmitting}
                className="bg-yellow-500 hover:bg-yellow-600 text-white"
              >
                На проверку
              </Button>
              <Button
                variant="default"
                onClick={() => handleSubmitModeration('approved')}
                disabled={isSubmitting}
              >
                Одобрить
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Диалог подтверждения возврата на модерацию */}
      <Dialog open={pendingReviewDialogOpen} onOpenChange={setPendingReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Вернуть на модерацию</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите вернуть этот отзыв на модерацию?
            </DialogDescription>
          </DialogHeader>
          
          {reviewToPending && (
            <div className="py-4">
              <div className="flex items-center gap-2 p-3 bg-yellow-50 text-yellow-800 rounded-md">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="font-medium">Отзыв: {reviewToPending.title}</p>
                  <p className="text-sm">Будет возвращен в очередь на модерацию.</p>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPendingReviewDialogOpen(false)}
            >
              Отмена
            </Button>
            <Button
              variant="default"
              onClick={handleConfirmReturnToPending}
            >
              Подтвердить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
} 