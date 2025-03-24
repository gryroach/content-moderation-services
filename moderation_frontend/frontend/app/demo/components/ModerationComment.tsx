import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Bot, CheckCircle, Clock, PenSquare, Save, User, XCircle } from "lucide-react";
import { useState } from "react";
import { ModerationComment as ModerationCommentType, ReviewStatus } from "../types";

interface RenderModerationCommentProps {
  comment: string | object | ModerationCommentType;
  onModerate?: (status: ReviewStatus, newComment?: string) => void;
  showModerateButtons?: boolean;
}

/**
 * Компонент для отображения комментариев модератора
 * Может обрабатывать комментарии в формате JSON и обычные текстовые комментарии
 */
export const RenderModerationComment = ({ 
  comment, 
  onModerate, 
  showModerateButtons = false 
}: RenderModerationCommentProps) => {
  // Состояние для режима редактирования
  const [isEditing, setIsEditing] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [newStatus, setNewStatus] = useState<ReviewStatus>("pending");
  
  // Отладочное логирование для диагностики проблем
  console.log('RenderModerationComment получил комментарий:', typeof comment, comment);

  // Безопасный парсинг JSON
  const safeParseJSON = (str: string) => {
    try {
      return JSON.parse(str);
    } catch (e) {
      console.warn('Ошибка при парсинге JSON комментария:', e);
      return null;
    }
  };

  let text: string | undefined;
  let parsedData: any;
  let isAI = false;
  
  // Определяем тип комментария с дополнительными проверками
  if (typeof comment === 'object' && comment !== null) {
    // Если это уже объект, проверяем, содержит ли он поля, характерные для AI-комментария
    if ('status' in comment || 'confidence' in comment || 
        'issues' in comment || 'tags' in comment) {
      // Это AI-комментарий
      isAI = true;
      parsedData = comment;
      text = 'message' in comment ? comment.message as string : 
             ('issues' in comment && Array.isArray(comment.issues)) 
               ? comment.issues.map((i: any) => i.description || i.text || i).join(', ') 
               : '';
    } else if ('parsedData' in comment) {
      // Уже обработанный результат
      const typedComment = comment as { text?: string, parsedData: any, isAI: boolean };
      text = typedComment.text;
      parsedData = typedComment.parsedData;
      isAI = typedComment.isAI;
    } else {
      // Обычный объект, не AI-комментарий
      isAI = false;
      parsedData = comment;
      text = JSON.stringify(comment, null, 2);
    }
  } else if (typeof comment === 'string') {
    // Если комментарий пустой или undefined, сразу показываем сообщение по умолчанию
    if (!comment || comment.trim() === '') {
      isAI = false;
      parsedData = null;
      text = 'Нет комментария';
    } else {
      console.log('Строковый комментарий:', comment);
      
      // Пробуем парсить как JSON только если похоже на JSON
      let isJsonLike = false;
      try {
        isJsonLike = (comment.trim().startsWith('{') && comment.trim().endsWith('}')) || 
                    (comment.trim().startsWith('[') && comment.trim().endsWith(']'));
      } catch (e) {
        isJsonLike = false;
      }
      
      if (isJsonLike) {
        try {
          const parsedObj = JSON.parse(comment);
          
          // Проверяем, имеет ли распарсенный объект структуру AI-комментария
          if (parsedObj && typeof parsedObj === 'object' && 
              ('status' in parsedObj || 'confidence' in parsedObj || 
               'issues' in parsedObj || 'tags' in parsedObj)) {
            isAI = true;
            parsedData = parsedObj;
            text = parsedObj.message || 
                  (parsedObj.issues && Array.isArray(parsedObj.issues)
                    ? parsedObj.issues.map((i: any) => i.description || i.text || i).join(', ') 
                    : comment);
          } else {
            // Обычный JSON, но не AI-комментарий
            isAI = false;
            parsedData = parsedObj;
            text = JSON.stringify(parsedObj, null, 2);
          }
        } catch (e) {
          // Не удалось распарсить как JSON - используем как обычный текст
          console.warn('Ошибка при парсинге JSON комментария:', e);
          isAI = false;
          parsedData = null;
          text = comment;
        }
      } else {
        // Обычная строка, не JSON
        isAI = false;
        parsedData = null;
        text = comment;
      }
    }
  } else {
    // Другие типы данных
    isAI = false;
    parsedData = null;
    text = comment ? String(comment) : 'Нет комментария';
  }

  console.log('После обработки:', { isAI, parsedHasData: !!parsedData, textLength: text?.length || 0 });

  // Функции для модерации комментария
  const handleApprove = () => {
    onModerate && onModerate('approved');
  };

  const handleReject = () => {
    onModerate && onModerate('rejected');
  };
  
  // Добавляем функцию для отправки на проверку
  const handlePending = () => {
    onModerate && onModerate('pending');
  };
  
  // Функция для начала редактирования
  const handleStartEditing = () => {
    setNewComment(text || "");
    setNewStatus(parsedData?.status || "pending");
    setIsEditing(true);
  };
  
  // Функция для сохранения изменений
  const handleSaveChanges = () => {
    onModerate && onModerate(newStatus, newComment);
    setIsEditing(false);
  };
  
  // Функция для отмены редактирования
  const handleCancelEditing = () => {
    setIsEditing(false);
  };

  // Если пользователь редактирует комментарий
  if (isEditing && showModerateButtons) {
    return (
      <div className="text-sm rounded-md border p-3 bg-slate-500/10">
        <div className="w-full space-y-3">
          <div className="flex justify-between items-center">
            <div className="font-semibold text-slate-700 text-sm">Редактирование комментария</div>
          </div>
          
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Введите комментарий модератора"
            className="w-full min-h-[100px] text-sm"
          />
          
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Статус модерации:</Label>
            <RadioGroup 
              value={newStatus} 
              onValueChange={(value) => setNewStatus(value as ReviewStatus)}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="approved" id="approved" />
                <Label htmlFor="approved" className="text-xs font-normal text-green-600">Одобрено</Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="rejected" id="rejected" />
                <Label htmlFor="rejected" className="text-xs font-normal text-red-600">Отклонено</Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="pending" id="pending" />
                <Label htmlFor="pending" className="text-xs font-normal text-yellow-600">На проверке</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={handleCancelEditing}
            >
              Отмена
            </Button>
            <Button 
              size="sm" 
              onClick={handleSaveChanges}
              className="flex items-center"
            >
              <Save className="h-3 w-3 mr-1" />
              Сохранить
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Если это обычный текстовый комментарий или не удалось корректно обработать данные
  if (!parsedData && !isAI) {
    // Обычный текст комментария (не AI)
    return (
      <div className="text-sm rounded-md border p-3 bg-blue-500/10">
        <div className="flex items-start gap-2">
          <User className="h-4 w-4 text-blue-600 mt-0.5" />
          <div className="w-full">
            <div className="flex justify-between items-center">
              <div className="font-semibold text-blue-600 text-xs mb-1">Комментарий модератора:</div>
              {showModerateButtons && !isEditing && (
                <Button 
                  size="sm" 
                  variant="outline"
                  className="h-6 flex items-center text-xs border-blue-200 hover:bg-blue-50 px-2"
                  onClick={handleStartEditing}
                >
                  <PenSquare className="h-3 w-3 mr-1" />
                  Изменить
                </Button>
              )}
            </div>
            <div className="whitespace-pre-line">{text || 'Нет комментария'}</div>
            
            {/* Кнопки модерации */}
            {showModerateButtons && onModerate && !isEditing && (
              <div className="mt-3 flex justify-end space-x-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex items-center text-green-600 border-green-200 hover:bg-green-50"
                  onClick={handleApprove}
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Одобрить
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex items-center text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                  onClick={handlePending}
                >
                  <Clock className="h-3 w-3 mr-1" />
                  На проверку
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex items-center text-red-600 border-red-200 hover:bg-red-50"
                  onClick={handleReject}
                >
                  <XCircle className="h-3 w-3 mr-1" />
                  Отклонить
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Для AI-комментариев или комментариев в формате JSON
  const renderAITags = () => {
    // Если есть теги, отображаем их
    if (parsedData?.tags && Array.isArray(parsedData.tags)) {
      return (
        <div className="flex flex-wrap gap-1 mt-2">
          {parsedData.tags.map((tag: string, index: number) => (
            <Badge key={index} variant="outline" className={cn("text-xs", "bg-slate-500/10")}>
              {tag}
            </Badge>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderIssues = () => {
    // Если есть проблемы, отображаем их
    if (parsedData?.issues && Array.isArray(parsedData.issues)) {
      return (
        <div className="space-y-2 mt-3">
          {parsedData.issues.map((issue: any, index: number) => (
            <div key={index} className="text-xs bg-red-500/10 border border-red-500/20 p-2 rounded-sm">
              <div className="font-medium text-red-700">{issue.category || 'Проблема'}</div>
              <div className="text-slate-700">{issue.description || issue.text || JSON.stringify(issue)}</div>
              {issue.law && <div className="text-slate-500 mt-1">{issue.law}</div>}
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderConfidence = () => {
    // Если есть уровень уверенности, отображаем его
    if (parsedData?.confidence !== undefined) {
      const confidence = typeof parsedData.confidence === 'string' 
        ? parseFloat(parsedData.confidence) 
        : parsedData.confidence;
      
      const confidencePercent = isNaN(confidence) ? 0 : Math.round(confidence * 100);
      
      return (
        <div className="mt-2 flex items-center gap-1">
          <div className="text-xs text-slate-500">Уверенность:</div>
          <div className="text-xs font-medium">
            {confidencePercent}%
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="text-sm rounded-md border p-3 bg-purple-500/10">
      <div className="flex items-start gap-2">
        <Bot className="h-4 w-4 text-purple-600 mt-0.5" />
        <div className="w-full">
          <div className="flex justify-between items-center">
            <div className="font-semibold text-purple-600 text-xs mb-1">Результат автомодерации:</div>
            {showModerateButtons && !isEditing && (
              <Button 
                size="sm" 
                variant="outline"
                className="h-6 flex items-center text-xs border-purple-200 hover:bg-purple-50 px-2"
                onClick={handleStartEditing}
              >
                <PenSquare className="h-3 w-3 mr-1" />
                Изменить
              </Button>
            )}
          </div>
          
          {/* Статус модерации */}
          {parsedData?.status && (
            <div className="mb-2">
              <Badge 
                variant="outline"
                className={cn(
                  parsedData.status === 'approved' ? 'bg-green-500/10 text-green-600' : 
                  parsedData.status === 'rejected' ? 'bg-red-500/10 text-red-600' : 
                  'bg-yellow-500/10 text-yellow-600'
                )}
              >
                {parsedData.status === 'approved' ? 'Одобрено' : 
                 parsedData.status === 'rejected' ? 'Отклонено' : 'На проверке'}
              </Badge>
            </div>
          )}
          
          {/* Текст комментария */}
          {text && <div className="whitespace-pre-line">{text}</div>}
          
          {/* Теги */}
          {renderAITags()}
          
          {/* Проблемы */}
          {renderIssues()}
          
          {/* Уровень уверенности */}
          {renderConfidence()}
          
          {/* Кнопки модерации */}
          {showModerateButtons && onModerate && !isEditing && (
            <div className="mt-3 flex justify-end space-x-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="flex items-center text-green-600 border-green-200 hover:bg-green-50"
                onClick={handleApprove}
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Одобрить
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="flex items-center text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                onClick={handlePending}
              >
                <Clock className="h-3 w-3 mr-1" />
                На проверку
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="flex items-center text-red-600 border-red-200 hover:bg-red-50"
                onClick={handleReject}
              >
                <XCircle className="h-3 w-3 mr-1" />
                Отклонить
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 