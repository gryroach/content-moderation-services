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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { submitReview } from "@/lib/api";
import { CreateReviewData } from "@/types/api";
import { Star } from "lucide-react";
import { useState } from "react";

interface CreateReviewFormProps {
  movieId: string;
  onSuccess?: () => void;
}

// Примеры нелегальных комментариев из документации
const illegalComments = [
  "Фильм очень хорошо показывает в чем на самом деле различия между нациями. Я бы показывал его всему молодому поколению, что бы с детства прививать правильное мышление и отношение ко всем странам бывшего СНГ, кто они есть на самом деле и где их место.",
  "Чайлдфри должно существовать, этот фильм показывает почему",
  "Я считаю туда надо было отправить фронтендера, потому что это профессия хуже говновоза",
  "Фильм показывает для чего нужен терроризм (польза) - что бы отрезвлять власть!"
];

// Примеры легальных комментариев
const legalComments = [
  "Фильм мне очень понравился! Отличная режиссура, сценарий и игра актеров. Буду рекомендовать его всем своим друзьям.",
  "Хороший фильм, интересный сюжет и приятные визуальные эффекты. Можно посмотреть в выходной день.",
  "Фильм раскрывает интересные темы и заставляет задуматься. Актеры отлично справились со своими ролями."
];

// Примеры сомнительных комментариев
const questionableComments = [
  "Джей и Молчаливый Боб сраные клоуны и отстой. Живи они в реальности, я бы отмудохал их за то, что такие идиоты.",
  "Драть Джея и Молчаливого Боба. Драть их долго кверху жопой.",
];

// Названия для рецензий
const reviewTitles = [
  "Мои впечатления о фильме",
  "Что я думаю об этом фильме",
  "Моя оценка",
  "Стоит ли смотреть?",
  "Рецензия на фильм",
  "Отличный фильм!",
  "Неоднозначный фильм",
  "Мое мнение"
];

export function CreateReviewForm({ movieId, onSuccess }: CreateReviewFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);
  const [error, setError] = useState<string | null>(null);
  const [templateType, setTemplateType] = useState<string | undefined>(undefined);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!title.trim()) {
      setError("Пожалуйста, введите заголовок рецензии");
      return;
    }
    
    if (!reviewText.trim()) {
      setError("Пожалуйста, введите текст рецензии");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const reviewData: CreateReviewData = {
        movie_id: movieId,
        title: title.trim(),
        review_text: reviewText.trim(),
        rating
      };
      
      const result = await submitReview(reviewData);
      
      if (result) {
        setTitle("");
        setReviewText("");
        setRating(5);
        setTemplateType(undefined);
        setIsOpen(false);
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setError("Не удалось отправить рецензию. Пожалуйста, попробуйте еще раз.");
      }
    } catch (err) {
      console.error("Ошибка при отправке рецензии:", err);
      setError("Произошла ошибка при отправке рецензии. Пожалуйста, попробуйте еще раз.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleTemplateChange = (value: string) => {
    setTemplateType(value);
    
    let randomComment = "";
    let randomTitle = reviewTitles[Math.floor(Math.random() * reviewTitles.length)];
    let randomRating = Math.floor(Math.random() * 10) + 1;
    
    switch(value) {
      case "legal":
        randomComment = legalComments[Math.floor(Math.random() * legalComments.length)];
        randomRating = Math.floor(Math.random() * 5) + 6; // От 6 до 10
        break;
      case "illegal":
        randomComment = illegalComments[Math.floor(Math.random() * illegalComments.length)];
        randomRating = Math.floor(Math.random() * 5) + 1; // От 1 до 5
        break;
      case "questionable":
        randomComment = questionableComments[Math.floor(Math.random() * questionableComments.length)];
        randomRating = Math.floor(Math.random() * 4) + 4; // От 4 до 7
        break;
      default:
        return; // Если выбрано "своё", ничего не меняем
    }
    
    setReviewText(randomComment);
    setTitle(randomTitle);
    setRating(randomRating);
  };
  
  const StarRating = () => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
          <Star
            key={star}
            className={`h-6 w-6 cursor-pointer ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
            onClick={() => setRating(star)}
          />
        ))}
      </div>
    );
  };
  
  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Написать рецензию
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Новая рецензия</DialogTitle>
            <DialogDescription>
              Поделитесь своим мнением о фильме. Рецензия будет направлена на модерацию.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="template">Выберите шаблон комментария</Label>
              <Select 
                onValueChange={handleTemplateChange} 
                value={templateType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Свой комментарий" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">Свой комментарий</SelectItem>
                  <SelectItem value="legal">Легальный комментарий</SelectItem>
                  <SelectItem value="illegal">Нелегальный комментарий</SelectItem>
                  <SelectItem value="questionable">Сомнительный комментарий</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="title">Заголовок</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Введите заголовок рецензии"
                disabled={isSubmitting}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="review-text">Текст рецензии</Label>
              <Textarea
                id="review-text"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Поделитесь своими впечатлениями о фильме"
                rows={6}
                disabled={isSubmitting}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="rating">Оценка: {rating}/10</Label>
              <div className="py-2">
                <StarRating />
              </div>
            </div>
            
            {error && (
              <div className="p-3 text-sm bg-red-50 border border-red-200 text-red-700 rounded-md">
                {error}
              </div>
            )}
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
              >
                Отмена
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Отправка..." : "Отправить рецензию"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
} 