'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/auth';
import { useFormValidation } from '@/hooks/useFormValidation';
import { showAuthError } from '@/store/error';
import { logAuthError } from '@/lib/error-logger';
import { AlertCircle, Loader2 } from 'lucide-react';

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuthStore();

  const {
    values,
    errors,
    handleChange,
    handleBlur,
    handleSubmit,
    isValid,
  } = useFormValidation(
    { email: 'admin@budgetops.com', password: 'password' },
    {
      email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: '올바른 이메일 형식을 입력해주세요.',
      },
      password: {
        required: true,
        minLength: 6,
        message: '비밀번호는 최소 6자 이상이어야 합니다.',
      },
    }
  );

  const onSubmit = async (formValues: typeof values) => {
    setIsLoading(true);

    try {
      // 시뮬레이션된 로그인 (실제로는 API 호출)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 더미 로그인 로직
      if (formValues.email === 'admin@budgetops.com' && formValues.password === 'password') {
        login({
          id: '1',
          email: 'admin@budgetops.com',
          name: '관리자',
          role: 'admin'
        });
        router.push('/dashboard');
      } else {
        const errorMessage = '이메일 또는 비밀번호가 올바르지 않습니다.';
        showAuthError(errorMessage);
        logAuthError(errorMessage, { email: formValues.email });
      }
    } catch (error) {
      const errorMessage = '로그인 중 오류가 발생했습니다.';
      showAuthError(errorMessage);
      logAuthError(errorMessage, { error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* 로고 및 제목 */}
        <div className="text-center">
          <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
            <div className="mx-auto h-16 w-16 rounded-full bg-[#eef2f9] border border-slate-200 flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-slate-600">B</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">BudgetOps</h1>
            <p className="mt-2 text-sm text-gray-600">Multi-Cloud Cost Management Platform</p>
          </Link>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-semibold text-center">로그인</CardTitle>
            <CardDescription className="text-center text-gray-600">
              계정에 로그인하여 시작하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">이메일</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@budgetops.com"
                  value={values.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">비밀번호</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="password"
                  value={values.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password}</p>
                )}
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-11 bg-[#eef2f9] hover:bg-[#e2e8f0] text-slate-600 font-medium border border-slate-200 hover:border-slate-300" 
                disabled={isLoading || !isValid}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    로그인 중...
                  </>
                ) : (
                  '로그인'
                )}
              </Button>
            </form>
            
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-600 text-center mb-2 font-medium">테스트 계정</p>
              <div className="text-xs text-gray-500 space-y-1">
                <p><span className="font-medium">이메일:</span> admin@budgetops.com</p>
                <p><span className="font-medium">비밀번호:</span> password</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
