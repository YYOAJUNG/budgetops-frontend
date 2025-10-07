'use client';

import { AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ErrorBannerProps {
  error: string;
  onDismiss?: () => void;
  className?: string;
  'aria-live'?: 'polite' | 'assertive' | 'off';
}

export function ErrorBanner({ 
  error, 
  onDismiss, 
  className,
  'aria-live': ariaLive = 'polite'
}: ErrorBannerProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg',
        className
      )}
      role="alert"
      aria-live={ariaLive}
    >
      <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <h4 className="text-sm font-medium text-red-800 mb-1">
          계정 연동 실패
        </h4>
        <p className="text-sm text-red-700">{error}</p>
      </div>
      {onDismiss && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className="h-6 w-6 p-0 text-red-600 hover:text-red-800 hover:bg-red-100"
          aria-label="오류 메시지 닫기"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
