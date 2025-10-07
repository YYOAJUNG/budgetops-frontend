interface ErrorLog {
  id: string;
  timestamp: number;
  type: 'api' | 'network' | 'validation' | 'auth' | 'general' | 'javascript';
  message: string;
  stack?: string;
  url?: string;
  userAgent?: string;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

class ErrorLogger {
  private logs: ErrorLog[] = [];
  private maxLogs = 100; // 최대 로그 개수
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupGlobalErrorHandlers();
  }

  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupGlobalErrorHandlers() {
    // JavaScript 오류 캐치
    window.addEventListener('error', (event) => {
      this.log({
        type: 'javascript',
        message: event.message,
        stack: event.error?.stack,
        url: event.filename,
        metadata: {
          line: event.lineno,
          column: event.colno,
        },
      });
    });

    // Promise rejection 캐치
    window.addEventListener('unhandledrejection', (event) => {
      this.log({
        type: 'javascript',
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        metadata: {
          reason: event.reason,
        },
      });
    });
  }

  log(error: Omit<ErrorLog, 'id' | 'timestamp' | 'sessionId'>) {
    const logEntry: ErrorLog = {
      ...error,
      id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    // 로그 저장
    this.logs.unshift(logEntry);
    
    // 최대 로그 개수 제한
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // 개발 환경에서 콘솔에 로깅
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 Error Logged: ${logEntry.type.toUpperCase()}`);
      console.error('Message:', logEntry.message);
      console.error('Timestamp:', new Date(logEntry.timestamp).toISOString());
      console.error('URL:', logEntry.url);
      if (logEntry.stack) {
        console.error('Stack:', logEntry.stack);
      }
      if (logEntry.metadata) {
        console.error('Metadata:', logEntry.metadata);
      }
      console.groupEnd();
    }

    // 프로덕션 환경에서는 외부 서비스로 전송
    if (process.env.NODE_ENV === 'production') {
      this.sendToExternalService(logEntry);
    }

    // 로컬 스토리지에 저장 (디버깅용)
    this.saveToLocalStorage();
  }

  private async sendToExternalService(log: ErrorLog) {
    try {
      // 실제 환경에서는 Sentry, LogRocket, 또는 자체 로깅 서비스로 전송
      // 예시: Sentry.captureException(new Error(log.message), { extra: log });
      
      // 현재는 콘솔에만 출력
      console.warn('Production error logging:', log);
    } catch (error) {
      console.error('Failed to send error to external service:', error);
    }
  }

  private saveToLocalStorage() {
    try {
      localStorage.setItem('budgetops-error-logs', JSON.stringify(this.logs.slice(0, 20)));
    } catch (error) {
      console.warn('Failed to save error logs to localStorage:', error);
    }
  }

  getLogs(): ErrorLog[] {
    return [...this.logs];
  }

  getLogsByType(type: ErrorLog['type']): ErrorLog[] {
    return this.logs.filter(log => log.type === type);
  }

  clearLogs() {
    this.logs = [];
    localStorage.removeItem('budgetops-error-logs');
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  setUserId(userId: string) {
    this.logs.forEach(log => {
      log.userId = userId;
    });
  }
}

// 싱글톤 인스턴스
export const errorLogger = new ErrorLogger();

// 편의 함수들
export const logError = (error: Omit<ErrorLog, 'id' | 'timestamp' | 'sessionId'>) => {
  errorLogger.log(error);
};

export const logApiError = (message: string, metadata?: Record<string, any>) => {
  logError({
    type: 'api',
    message,
    metadata,
  });
};

export const logNetworkError = (message: string, metadata?: Record<string, any>) => {
  logError({
    type: 'network',
    message,
    metadata,
  });
};

export const logValidationError = (message: string, field?: string) => {
  logError({
    type: 'validation',
    message,
    metadata: { field },
  });
};

export const logAuthError = (message: string, metadata?: Record<string, any>) => {
  logError({
    type: 'auth',
    message,
    metadata,
  });
};
