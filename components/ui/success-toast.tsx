'use client';

import { CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SuccessToastProps {
  message: string;
  onDismiss?: () => void;
  className?: string;
  'aria-live'?: 'polite' | 'assertive' | 'off';
}

export function SuccessToast({ 
  message, 
  onDismiss, 
  className,
  'aria-live': ariaLive = 'polite'
}: SuccessToastProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg shadow-lg',
        className
      )}
      role="alert"
      aria-live={ariaLive}
    >
      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <h4 className="text-sm font-medium text-green-800 mb-1">
          연동 완료
        </h4>
        <p className="text-sm text-green-700">{message}</p>
      </div>
      {onDismiss && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className="h-6 w-6 p-0 text-green-600 hover:text-green-800 hover:bg-green-100"
          aria-label="성공 메시지 닫기"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
