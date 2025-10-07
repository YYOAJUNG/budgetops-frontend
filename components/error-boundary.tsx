'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { showError } from '@/store/error';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
    
    // 오류를 전역 상태에 추가
    showError({
      type: 'general',
      title: '예상치 못한 오류가 발생했습니다',
      message: error.message || '알 수 없는 오류가 발생했습니다.',
      details: errorInfo.componentStack,
      action: {
        label: '새로고침',
        onClick: () => window.location.reload(),
      },
    });

    // 개발 환경에서 콘솔에 오류 로깅
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <Card className="w-full max-w-md shadow-lg border-0 bg-white">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900">
                오류가 발생했습니다
              </CardTitle>
              <CardDescription className="text-gray-600">
                예상치 못한 문제가 발생했습니다. 잠시 후 다시 시도해주세요.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {this.state.error && (
                <div className="p-3 bg-gray-100 rounded-lg">
                  <p className="text-sm text-gray-700 font-mono">
                    {this.state.error.message}
                  </p>
                </div>
              )}
              
              <div className="flex flex-col space-y-2">
                <Button
                  onClick={this.handleRetry}
                  className="w-full bg-[#eef2f9] hover:bg-[#e2e8f0] text-slate-600 font-medium border border-slate-200 hover:border-slate-300"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  다시 시도
                </Button>
                
                <Button
                  variant="outline"
                  onClick={this.handleGoHome}
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                >
                  <Home className="mr-2 h-4 w-4" />
                  홈으로 이동
                </Button>
              </div>
              
              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <details className="mt-4">
                  <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-800">
                    개발자 정보
                  </summary>
                  <pre className="text-xs text-gray-600 mt-2 p-2 bg-gray-100 rounded overflow-auto max-h-32">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
