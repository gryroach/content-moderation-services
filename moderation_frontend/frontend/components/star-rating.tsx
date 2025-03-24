"use client"

import { StarIcon } from "lucide-react";
import { useState } from 'react';

export interface StarRatingProps {
  rating?: number;  // Переименовываем value в rating для соответствия с использованием
  onRatingChange?: (value: number) => void;  // Переименовываем onChange в onRatingChange
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  readOnly?: boolean;
  id?: string;
}

export const StarRating = ({
  rating = 0,  // Переименовываем value в rating
  onRatingChange,  // Переименовываем onChange в onRatingChange
  max = 5,
  size = 'md',
  readOnly = false,
  id: propId
}: StarRatingProps) => {
  const [hoveredValue, setHoveredValue] = useState<number>(0)
  
  // Генерируем детерминированный ID на основе параметров компонента
  // вместо случайного ID, чтобы избежать проблем с гидратацией
  const generateStableId = (max: number, size: string, readOnly: boolean) => {
    return `star-rating-${max}-${size}-${readOnly ? 'readonly' : 'editable'}`;
  }
  
  // Используем переданный извне ID или генерируем стабильный
  const id = propId || generateStableId(max, size, readOnly);
  
  const stars = Array.from({ length: max }, (_, i) => i + 1)
  
  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4'
      case 'lg':
        return 'w-6 h-6'
      default:
        return 'w-5 h-5'
    }
  }
  
  const handleStarClick = (starValue: number) => {
    if (readOnly) return
    onRatingChange?.(starValue)  // Используем переименованный колбэк
  }
  
  const handleStarHover = (starValue: number) => {
    if (readOnly) return
    setHoveredValue(starValue)
  }
  
  const handleMouseLeave = () => {
    if (readOnly) return
    setHoveredValue(0)
  }
  
  const labelText = rating === 1  // Используем переименованный prop
    ? '1 star' 
    : rating > 1  // Используем переименованный prop
      ? `${rating} stars`  // Используем переименованный prop
      : 'No rating'
  
  const labelId = `${id}-label`
  const descId = `${id}-desc`
  
  return (
    <div 
      className="inline-flex items-center" 
      onMouseLeave={handleMouseLeave}
      role="group"
      aria-labelledby={labelId}
      aria-describedby={descId}
    >
      <span className="sr-only" id={labelId}>Rating</span>
      <span className="sr-only" id={descId}>
        {labelText}
      </span>
      
      {stars.map((starValue) => {
        const isFilled = 
          (hoveredValue > 0 ? hoveredValue >= starValue : rating >= starValue)  // Используем переименованный prop
        
        return (
          <button
            key={`${id}-star-${starValue}`}
            type="button"
            className={`focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring ${
              readOnly ? 'cursor-default' : 'cursor-pointer'
            } p-0.5`}
            onMouseEnter={() => handleStarHover(starValue)}
            onClick={() => handleStarClick(starValue)}
            aria-label={`${starValue} star${starValue !== 1 ? 's' : ''}`}
            disabled={readOnly}
          >
            <StarIcon
              className={`${getSizeClass()} ${
                isFilled
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-transparent text-muted-foreground'
              }`}
            />
          </button>
        )
      })}
    </div>
  )
}

// Также экспортируем компонент по умолчанию для обратной совместимости
export default StarRating

