import { useCallback, useState } from 'react';

/**
 * Хук для форматирования даты с учётом часового пояса
 * @param defaultOffset Смещение часового пояса по умолчанию (в часах)
 * @returns Объект с функцией форматирования даты и функцией изменения часового пояса
 */
export const useFormatDate = (defaultOffset = 3) => {
  const [timeZoneOffset, setTimeZoneOffset] = useState<number>(defaultOffset);
  
  /**
   * Форматирует дату с учётом часового пояса
   * @param dateString Строка с датой
   * @returns Отформатированная строка
   */
  const formatDate = useCallback((dateString: string) => {
    if (!dateString) return "";
    
    const date = new Date(dateString);
    
    // Получаем локальное смещение в минутах
    const localOffset = date.getTimezoneOffset();
    
    // Применяем пользовательское смещение (в часах)
    const userOffset = timeZoneOffset;
    
    // Создаем новую дату с применением смещения
    const adjustedDate = new Date(date.getTime() + (localOffset * 60 * 1000) + (userOffset * 60 * 60 * 1000));
    
    return adjustedDate.toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }) + ` (UTC${userOffset >= 0 ? '+' : ''}${userOffset})`;
  }, [timeZoneOffset]);
  
  return { formatDate, timeZoneOffset, setTimeZoneOffset };
}; 