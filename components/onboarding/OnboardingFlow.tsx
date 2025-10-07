'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { CheckCircle, ArrowRight } from 'lucide-react';

export function OnboardingFlow() {
  const [step, setStep] = useState(1);
  const [tenantName, setTenantName] = useState('');
  const router = useRouter();

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else {
      router.push('/accounts');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">BudgetOps 설정</CardTitle>
          <CardDescription>단계 {step}/2</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tenant">프로젝트/테넌트 이름</Label>
                <Input
                  id="tenant"
                  placeholder="예: 메인 프로젝트"
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleNext} 
                disabled={!tenantName.trim()}
                className="w-full"
              >
                다음 단계
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span>테넌트가 생성되었습니다</span>
              </div>
              <p className="text-sm text-muted-foreground">
                이제 클라우드 계정을 연결하여 비용 데이터를 수집할 수 있습니다.
              </p>
              <Button onClick={handleNext} className="w-full">
                계정 연결하기
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
