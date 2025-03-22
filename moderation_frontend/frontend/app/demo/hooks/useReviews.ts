import { getReviews as fetchReviewsFromApi } from '@/lib/api';
import { mockReviews } from '@/lib/mock-data';
import type { Review as ApiReview } from '@/types/api';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Review, ReviewStatus } from '../types';

// Тест для кино
const DEMO_MOVIE_ID = "11111111-1111-1111-1111-111111111111";

// Функция для конвертации типа Review из API в локальный тип Review
const convertApiReviewToLocal = (apiReview: ApiReview): Review => {
  return {
    _id: apiReview._id,
    movie_id: apiReview.movie_id,
    user_id: apiReview.user_id,
    user_name: apiReview.user_name || 'Аноним', // Обрабатываем случай, когда имя пользователя не задано
    title: apiReview.title,
    review_text: apiReview.review_text,
    rating: apiReview.rating,
    status: apiReview.status as ReviewStatus,
    created_at: apiReview.created_at,
    updated_at: apiReview.moderation_at ?? undefined,
    auto_moderation_result: apiReview.auto_moderation_result ? 
      (typeof apiReview.auto_moderation_result === 'string' 
        ? apiReview.auto_moderation_result 
        : JSON.stringify(apiReview.auto_moderation_result)) : undefined,
    // Сохраняем модераторский комментарий в исходном виде (строка или JSON)
    moderator_comment: (apiReview as any).moderation_comment || undefined,
    rejection_reason: apiReview.rejection_reason ?? undefined,
    auto_moderation_processed: !!apiReview.auto_moderation_result
  };
};

// Функция для преобразования мок данных в локальный формат
const getMockReviews = (movieId: string): Review[] => {
  // Фильтруем мок-данные по ID фильма
  const filteredMockReviews = mockReviews.filter(review => review.movie_id === movieId);
  
  // Преобразуем в локальный формат
  return filteredMockReviews.map(review => ({
    _id: review._id,
    movie_id: review.movie_id,
    user_id: review.user_id,
    user_name: review.user_name || 'Аноним',
    title: review.title,
    review_text: review.review_text,
    rating: review.rating,
    status: review.status as ReviewStatus,
    created_at: review.created_at,
    updated_at: review.moderation_at ?? undefined,
    auto_moderation_result: review.auto_moderation_result ? 
      (typeof review.auto_moderation_result === 'string' 
        ? review.auto_moderation_result 
        : JSON.stringify(review.auto_moderation_result)) : undefined,
    // Добавляем модераторский комментарий с поддержкой JSON-строк
    moderator_comment: (review as any).moderation_comment || undefined,
    rejection_reason: review.rejection_reason ?? undefined,
    auto_moderation_processed: !!review.auto_moderation_result
  }));
};

// Типизированная функция для API-запроса
const getReviews = async (params: { movie_id: string }): Promise<Review[]> => {
  try {
    console.log('Запрос к API: GET /api/reviews', params);
    
    try {
      // Сначала пробуем получить данные через API
      const apiReviews = await fetchReviewsFromApi({ movie_id: params.movie_id });
      
      // Конвертируем полученные отзывы в локальный формат
      return apiReviews.map(convertApiReviewToLocal);
    } catch (apiError) {
      console.warn('Ошибка при получении данных через API, используем мок-данные:', apiError);
      
      // В случае ошибки используем мок-данные
      return getMockReviews(params.movie_id);
    }
  } catch (error) {
    console.error('Ошибка при получении отзывов:', error);
    throw error;
  }
};

export const useReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Ref для отслеживания последней позиции прокрутки
  const lastScrollPositionRef = useRef<number>(0);
  // Ref для ссылки на интервал обновления
  const updateIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Ref для кеширования сырого ответа
  const rawResponseCacheRef = useRef<string | null>(null);

  // Функция для загрузки отзывов
  const fetchReviews = useCallback(async (showLoading = true) => {
    // Если уже идет загрузка и нам не нужно показывать спиннер, пропускаем повторный запрос
    if (loadingReviews && !showLoading) {
      console.log('Пропускаем повторный запрос, так как загрузка уже идет');
      return;
    }

    // Если нужно показать спиннер, включаем индикатор загрузки
    if (showLoading) {
      setLoadingReviews(true);
      console.log('Состояние загрузки установлено в true');
    } else {
      setIsRefreshing(true);
      console.log('Состояние обновления установлено в true');
    }

    try {
      // Сохраняем текущую позицию прокрутки перед запросом
      lastScrollPositionRef.current = window.scrollY;

      console.log('Выполняем запрос к API с ID фильма:', DEMO_MOVIE_ID);
      
      // Получаем данные с помощью функции API
      const result = await getReviews({ movie_id: DEMO_MOVIE_ID });
      
      if (result && Array.isArray(result)) {
        console.log('Количество отзывов получено:', result.length);
        
        // Сравниваем сырой ответ JSON с предыдущим кешем сырого ответа
        const currentResponseJSON = JSON.stringify(result);
        const previousResponseJSON = rawResponseCacheRef.current;
        
        // Если кеш ещё не инициализирован или есть реальные изменения на уровне сырых данных
        if (!previousResponseJSON || previousResponseJSON !== currentResponseJSON) {
          console.log('Обнаружены реальные изменения в данных API, обновляем кеш и состояние');
          
          // Обновляем кеш сырого ответа
          rawResponseCacheRef.current = currentResponseJSON;
          
          // Создаем карту существующих отзывов для сохранения локальных изменений
          const existingReviewsMap = new Map(reviews.map(review => [review._id, review]));
          
          // Обрабатываем новые отзывы, сохраняя локальные изменения при необходимости
          const processedResults = result.map(newReview => {
            const existingReview = existingReviewsMap.get(newReview._id);
            
            // Если отзыв уже существует и был изменен локально, сохраняем локальные изменения
            if (existingReview) {
              // Проверяем, изменился ли статус на сервере
              if (existingReview.status !== newReview.status) {
                // Статус на сервере изменился, но мы сохраняем локальные версии комментария модератора
                return {
                  ...newReview,
                  moderator_comment: existingReview.moderator_comment || newReview.moderator_comment,
                  rejection_reason: existingReview.rejection_reason || newReview.rejection_reason,
                };
              } else {
                // Отзыв не изменился на сервере, сохраняем локальные изменения модерации
                return {
                  ...newReview,
                  moderator_comment: existingReview.moderator_comment || newReview.moderator_comment,
                  rejection_reason: existingReview.rejection_reason || newReview.rejection_reason,
                  status: existingReview.status
                };
              }
            }
            
            // Для новых отзывов - используем данные с сервера без изменений
            return newReview;
          });
          
          // Применяем обновление к стейту с новыми обработанными отзывами
          setReviews(processedResults);
        } else {
          console.log('Данные API не изменились, пропускаем обновление состояния');
        }
      } else {
        console.warn('Результат запроса getReviews не является массивом или пуст');
        setError('Не удалось загрузить отзывы. Пожалуйста, попробуйте позже.');
      }
    } catch (error) {
      console.error('Ошибка при загрузке отзывов:', error);
      setError('Не удалось загрузить отзывы. Пожалуйста, попробуйте позже.');
    } finally {
      // Важно: всегда сбрасываем состояние загрузки, даже при ошибке
      if (showLoading) {
        setLoadingReviews(false);
        console.log('Состояние загрузки сброшено в false');
      } else {
        setIsRefreshing(false);
        console.log('Состояние обновления сброшено в false');
      }
      
      // Восстанавливаем позицию прокрутки
      if (lastScrollPositionRef.current) {
        window.scrollTo({
          top: lastScrollPositionRef.current,
          behavior: 'auto'
        });
      }
    }
  }, [loadingReviews, reviews]);

  // Функция для обновления статуса отзыва
  const updateReviewStatus = useCallback(async (
    reviewId: string, 
    status: ReviewStatus, 
    comment?: string
  ): Promise<boolean> => {
    try {
      console.log(`Обновление статуса отзыва: ${reviewId} на ${status}`);
      
      // Форматируем комментарий модератора если он есть
      const formattedComment = comment ? JSON.stringify({ 
        message: comment,
        status 
      }) : undefined;
      
      // Используем функцию из lib/api.ts для обновления статуса
      const result = await import('@/lib/api').then(api => api.updateReviewStatus(reviewId, {
        status,
        rejection_reason: status === 'rejected' ? comment : undefined,
        moderator_comment: formattedComment
      }));
      
      if (result && result._id) {
        console.log('Ответ API после обновления статуса:', result);
        return true;
      }
      
      throw new Error('Не удалось обновить статус отзыва');
    } catch (error) {
      console.error('Ошибка при обновлении статуса отзыва:', error);
      return false;
    }
  }, []);

  // Функция для модерации отзыва
  const handleModerateReview = useCallback(async (
    reviewId: string, 
    status: ReviewStatus, 
    comment?: string
  ) => {
    try {
      // Очищаем кеш сырого ответа, чтобы при следующем запросе состояние обновилось
      rawResponseCacheRef.current = null;
      
      // Находим существующий отзыв в стейте
      const existingReview = reviews.find(review => review._id === reviewId);
      if (!existingReview) return;
      
      // Создаем обновленный отзыв
      const updatedReview = {
        ...existingReview,
        status,
        moderator_comment: comment || existingReview.moderator_comment,
        rejection_reason: status === 'rejected' ? comment : undefined
      };
      
      // Обновляем список отзывов локально, чтобы UI сразу отреагировал
      setReviews(prev => prev.map(review => 
        review._id === reviewId ? updatedReview : review
      ));
      
      // Отправляем изменения на сервер
      const success = await updateReviewStatus(reviewId, status, comment);
      
      if (!success) {
        console.warn('Не удалось сохранить изменения на сервере');
        alert('Не удалось сохранить изменения статуса. Попробуйте еще раз.');
        
        // Если запрос не успешен, возвращаем предыдущее состояние отзыва
        setReviews(prev => prev.map(review => 
          review._id === reviewId ? existingReview : review
        ));
      }
    } catch (error) {
      console.error('Ошибка при модерации отзыва:', error);
    }
  }, [reviews, updateReviewStatus]);

  // Функция для удаления рецензии
  const handleDeleteReview = useCallback(async (reviewId: string): Promise<boolean> => {
    try {
      // Находим существующий отзыв в стейте
      const existingReview = reviews.find(review => review._id === reviewId);
      if (!existingReview) return false;
      
      // Проверяем, что пользователь действительно хочет удалить отзыв
      if (!confirm(`Вы действительно хотите удалить отзыв "${existingReview.title}"? Это действие невозможно отменить.`)) {
        return false;
      }
      
      // Очищаем кеш сырого ответа для обновления состояния при следующем запросе
      rawResponseCacheRef.current = null;
      
      // Импортируем функцию deleteReview динамически
      const { deleteReview } = await import('@/lib/api');
      
      // Вызываем API для удаления рецензии
      const success = await deleteReview(reviewId);
      
      if (success) {
        // Если удаление прошло успешно, обновляем локальный стейт
        setReviews(prev => prev.filter(review => review._id !== reviewId));
        return true;
      } else {
        console.warn('Не удалось удалить рецензию на сервере');
        alert('Не удалось удалить рецензию. Попробуйте еще раз.');
        return false;
      }
    } catch (error) {
      console.error('Ошибка при удалении рецензии:', error);
      alert('Произошла ошибка при удалении рецензии. Попробуйте еще раз.');
      return false;
    }
  }, [reviews]);

  // Эффект для настройки обновления отзывов по интервалу и при возврате на вкладку
  useEffect(() => {
    // Первоначальная загрузка
    fetchReviews();
    
    // Настраиваем автоматическое обновление
    updateIntervalRef.current = setInterval(() => {
      fetchReviews(false); // Фоновое обновление без индикатора загрузки
    }, 5000); // Обновляем раз в 5 секунд для более частого обновления
    
    // Добавляем обработчик для обновления при возврате на вкладку
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchReviews(false);
      }
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    // Очистка при размонтировании
    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchReviews]);

  // Сортировка и фильтрация отзывов
  const getFilteredReviews = useCallback((
    statusFilter = 'all', 
    dateFilter = 'all',
    sortOption = 'newest',
    searchQuery = '',
    confidenceFilter = 'all',
    tagFilter = 'all',
    lawFilter = 'all'
  ) => {
    return reviews.filter(review => {
      // Фильтр по статусу
      if (statusFilter !== 'all' && review.status !== statusFilter) {
        return false;
      }
      
      // Фильтр по дате
      const reviewDate = new Date(review.created_at);
      const now = new Date();
      
      if (dateFilter === 'last5min') {
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
        if (reviewDate < fiveMinutesAgo) return false;
      } else if (dateFilter === 'last1hour') {
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        if (reviewDate < oneHourAgo) return false;
      } else if (dateFilter === 'today') {
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);
        if (reviewDate < startOfDay) return false;
      }
      
      // Фильтр по поисковому запросу
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = review.title?.toLowerCase().includes(query) || false;
        const matchesText = review.review_text?.toLowerCase().includes(query) || false;
        const matchesUserName = review.user_name?.toLowerCase().includes(query) || false;
        
        if (!matchesTitle && !matchesText && !matchesUserName) {
          return false;
        }
      }
      
      // Фильтр по уверенности AI
      if (confidenceFilter !== 'all' && review.auto_moderation_result) {
        let autoModerationResult;
        
        // Парсим результат автомодерации, если он строка
        if (typeof review.auto_moderation_result === 'string') {
          try {
            autoModerationResult = JSON.parse(review.auto_moderation_result);
          } catch (e) {
            // Если не удалось распарсить, используем как есть
            autoModerationResult = review.auto_moderation_result;
          }
        } else {
          autoModerationResult = review.auto_moderation_result;
        }
        
        // Проверка уровня уверенности
        if (autoModerationResult && autoModerationResult.confidence !== undefined) {
          const confidence = autoModerationResult.confidence;
          
          if (confidenceFilter === 'high' && confidence < 0.7) return false;
          if (confidenceFilter === 'medium' && (confidence < 0.4 || confidence >= 0.7)) return false;
          if (confidenceFilter === 'low' && confidence >= 0.4) return false;
        } else {
          // Если нет данных об уверенности и выбран фильтр не "все", скрываем отзыв
          if (confidenceFilter !== 'all') return false;
        }
      } else if (confidenceFilter !== 'all' && !review.auto_moderation_result) {
        // Нет данных об автомодерации, но выбран фильтр не "все"
        return false;
      }
      
      return true;
    }).sort((a, b) => {
      // Сортировка по дате
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      
      return sortOption === 'newest' 
        ? dateB.getTime() - dateA.getTime() 
        : dateA.getTime() - dateB.getTime();
    });
  }, [reviews]);

  return {
    reviews,
    loadingReviews,
    isRefreshing,
    error,
    fetchReviews,
    handleModerateReview,
    getFilteredReviews,
    updateReviewStatus,
    handleDeleteReview,
    clearResponseCache: () => {
      rawResponseCacheRef.current = null;
    }
  };
}; 