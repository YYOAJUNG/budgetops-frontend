import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type StatusType = 'CONNECTED' | 'PENDING' | 'ERROR' | 'DISCONNECTED';

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusConfig = {
  CONNECTED: {
    label: '연결됨',
    variant: 'default' as const,
    icon: CheckCircle,
    className: 'bg-green-100 text-green-800 border-green-200',
  },
  PENDING: {
    label: '대기중',
    variant: 'secondary' as const,
    icon: Clock,
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  ERROR: {
    label: '오류',
    variant: 'destructive' as const,
    icon: XCircle,
    className: 'bg-red-100 text-red-800 border-red-200',
  },
  DISCONNECTED: {
    label: '연결 끊김',
    variant: 'outline' as const,
    icon: AlertCircle,
    className: 'bg-gray-100 text-gray-800 border-gray-200',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge 
      variant={config.variant}
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium',
        config.className,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}
