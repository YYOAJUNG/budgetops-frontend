'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/auth';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p>대시보드로 이동 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">BudgetOps</CardTitle>
          <CardDescription>Multi-Cloud Cost Management Platform</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            AWS, GCP, Azure, NCP의 비용을 한 곳에서 관리하고 최적화하세요.
          </p>
          <div className="flex flex-col gap-2">
            <Link href="/login">
              <Button className="w-full" size="lg">
                로그인
              </Button>
            </Link>
            <Link href="/onboarding">
              <Button className="w-full" variant="outline" size="lg">
                시작하기
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

