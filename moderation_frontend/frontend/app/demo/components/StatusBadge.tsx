import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { ReviewStatus } from "../types";

/**
 * Компонент для отображения статуса отзыва в виде цветного значка с иконкой
 */
export const StatusBadge = ({ status }: { status: ReviewStatus }) => {
  switch (status) {
    case 'approved':
      return (
        <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
          <CheckCircle className="h-3 w-3 mr-1" /> Одобрен
        </Badge>
      );
    case 'rejected':
      return (
        <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
          <XCircle className="h-3 w-3 mr-1" /> Отклонен
        </Badge>
      );
    default:
      return (
        <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
          <AlertTriangle className="h-3 w-3 mr-1" /> На проверке
        </Badge>
      );
  }
}; 