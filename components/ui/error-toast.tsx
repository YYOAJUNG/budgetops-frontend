'use client';

import { useEffect, useState } from 'react';
import { X, AlertCircle, Wifi, Shield, AlertTriangle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { ErrorInfo } from '@/store/error';

interface ErrorToastProps {
  error: ErrorInfo;
  onDismiss: (id: string) => void;
}

const getErrorIcon = (type: ErrorInfo['type']) => {
  switch (type) {
    case 'api':
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    case 'network':
      return <Wifi className="h-5 w-5 text-orange-500" />;
    case 'validation':
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    case 'auth':
      return <Shield className="h-5 w-5 text-red-500" />;
    default:
      return <Info className="h-5 w-5 text-blue-500" />;
  }
};

const getErrorStyles = (type: ErrorInfo['type']) => {
  switch (type) {
    case 'api':
      return {
        border: 'border-red-200',
        bg: 'bg-red-50',
        title: 'text-red-800',
        message: 'text-red-700',
      };
    case 'network':
      return {
        border: 'border-orange-200',
        bg: 'bg-orange-50',
        title: 'text-orange-800',
        message: 'text-orange-700',
      };
    case 'validation':
      return {
        border: 'border-yellow-200',
        bg: 'bg-yellow-50',
        title: 'text-yellow-800',
        message: 'text-yellow-700',
      };
    case 'auth':
      return {
        border: 'border-red-200',
        bg: 'bg-red-50',
        title: 'text-red-800',
        message: 'text-red-700',
      };
    default:
      return {
        border: 'border-blue-200',
        bg: 'bg-blue-50',
        title: 'text-blue-800',
        message: 'text-blue-700',
      };
  }
};

export function ErrorToast({ error, onDismiss }: ErrorToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const styles = getErrorStyles(error.type);

  useEffect(() => {
    // 애니메이션을 위한 지연
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!error.autoClose) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - (100 / (error.autoCloseDelay! / 100));
        if (newProgress <= 0) {
          onDismiss(error.id);
          return 0;
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [error.autoClose, error.autoCloseDelay, error.id, onDismiss]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => onDismiss(error.id), 300);
  };

  return (
    <div
      className={cn(
        'transform transition-all duration-300 ease-in-out',
        isVisible
          ? 'translate-x-0 opacity-100 scale-100'
          : 'translate-x-full opacity-0 scale-95'
      )}
    >
      <Card className={cn(
        'w-96 shadow-lg border-l-4',
        styles.border,
        styles.bg
      )}>
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            {getErrorIcon(error.type)}
            
            <div className="flex-1 min-w-0">
              <h4 className={cn('font-semibold text-sm', styles.title)}>
                {error.title}
              </h4>
              <p className={cn('text-sm mt-1', styles.message)}>
                {error.message}
              </p>
              
              {error.details && (
                <details className="mt-2">
                  <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-800">
                    자세히 보기
                  </summary>
                  <p className="text-xs text-gray-600 mt-1 pl-2 border-l-2 border-gray-300">
                    {error.details}
                  </p>
                </details>
              )}
              
              {error.action && (
                <div className="mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={error.action.onClick}
                    className="text-xs h-7 px-3"
                  >
                    {error.action.label}
                  </Button>
                </div>
              )}
            </div>
            
            {error.dismissible && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="h-6 w-6 p-0 hover:bg-gray-200"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          {error.autoClose && (
            <div className="mt-3 h-1 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gray-400 transition-all duration-100 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
