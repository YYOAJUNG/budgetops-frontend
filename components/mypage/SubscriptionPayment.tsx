'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CreditCard, CheckCircle, Calendar, Download, Receipt, Plus, Zap, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import {
  getCurrentSubscription,
  getPaymentMethod,
  getPaymentHistory,
  type Subscription,
} from '@/lib/api/subscription';
import { SUBSCRIPTION_PLANS, PAYMENT_STATUS_CONFIG } from '@/constants/mypage';
import { type SubscriptionPlan } from '@/types/mypage';
import { PurchaseTokenDialog } from './PurchaseTokenDialog';

// 상수
const DEFAULT_TOKEN_VALUES = {
  current: 80,
  max: 100,
  resetDate: '2025.11.01',
} as const;

// 헬퍼 함수
const formatNextPaymentDate = (date: string | undefined) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatPrice = (price: number | null | undefined) => {
  if (price === null || price === undefined) return '문의';
  return `월 ${price.toLocaleString()}원`;
};

// 서브 컴포넌트: 현재 구독 카드
function CurrentSubscriptionCard({
  subscription,
  onChangePlan,
}: {
  subscription: Subscription | undefined;
  onChangePlan: () => void;
}) {
  return (
    <Card className="mb-8 border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-blue-600" />
          <span>현재 구독</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {subscription?.planName || '로딩 중...'}
            </h3>
            <p className="text-gray-600">{formatPrice(subscription?.price)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 mb-1">다음 결제일</p>
            <p className="font-semibold text-gray-900">
              {formatNextPaymentDate(subscription?.nextPaymentDate)}
            </p>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Button
            variant="outline"
            className="border-gray-300 text-gray-700"
            onClick={onChangePlan}
          >
            플랜 변경
          </Button>
          <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
            구독 취소
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// 서브 컴포넌트: 토큰 현황 카드
function TokenStatusCard({
  currentTokens,
  maxTokens,
  tokenResetDate,
  isPro,
  onPurchaseClick,
}: {
  currentTokens: number;
  maxTokens: number;
  tokenResetDate: string;
  isPro: boolean;
  onPurchaseClick?: () => void;
}) {
  const tokenPercentage = useMemo(
    () => (currentTokens / maxTokens) * 100,
    [currentTokens, maxTokens]
  );

  return (
    <Card className="mb-8 border-amber-200 bg-amber-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-600" />
            <span>토큰 현황</span>
          </CardTitle>
          <span className="text-sm text-gray-600">{tokenResetDate} 리셋</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-2 mb-1">
              <h3 className="text-2xl font-bold text-gray-900">{currentTokens}</h3>
              <span className="text-gray-600">/ {maxTokens}</span>
            </div>
            <div className="w-64 bg-gray-200 rounded-full h-2 overflow-hidden mt-2">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${tokenPercentage}%` }}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Button
              onClick={onPurchaseClick}
              disabled={!isPro}
              className={cn(
                isPro
                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              )}
            >
              토큰 추가 구매
            </Button>
            {!isPro && (
              <p className="text-xs text-gray-600 text-center">
                Pro 플랜으로 업그레이드 후 이용 가능
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// 서브 컴포넌트: 플랜 카드
function PlanCard({ plan, isCurrentPlan }: { plan: SubscriptionPlan; isCurrentPlan: boolean }) {
  const buttonClass = cn(
    'w-full',
    isCurrentPlan
      ? 'bg-gray-100 text-gray-600 cursor-not-allowed'
      : plan.popular
      ? 'bg-blue-600 hover:bg-blue-700 text-white'
      : 'bg-gray-900 hover:bg-gray-800 text-white'
  );

  const getButtonText = () => {
    if (isCurrentPlan) return '현재 플랜';
    return plan.price !== null ? '플랜 선택' : '영업팀 문의';
  };

  return (
    <Card
      className={cn(
        'relative flex flex-col',
        plan.popular ? 'border-blue-500 shadow-lg' : 'border-gray-200'
      )}
    >
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-blue-600 text-white">인기</Badge>
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-xl">{plan.name}</CardTitle>
        <div className="mt-4">
          {plan.price !== null ? (
            <>
              <span className="text-3xl font-bold">₩{plan.price.toLocaleString()}</span>
              <span className="text-gray-600">/{plan.period}</span>
            </>
          ) : (
            <span className="text-3xl font-bold">{plan.period}</span>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col flex-1">
        <ul className="space-y-3 mb-6 flex-1">
          {plan.features.map((feature: string, index: number) => (
            <li key={index} className="flex items-start gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>
        <Button className={buttonClass} disabled={isCurrentPlan}>
          {getButtonText()}
        </Button>
      </CardContent>
    </Card>
  );
}

// 서브 컴포넌트: 플랜 변경 Dialog
function PlanChangeDialog({
  open,
  onOpenChange,
  currentPlanId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlanId?: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] p-0">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">플랜 변경</h2>
            <p className="text-gray-600 mt-1">원하시는 플랜을 선택해주세요</p>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SUBSCRIPTION_PLANS.map((plan) => (
              <PlanCard key={plan.id} plan={plan} isCurrentPlan={currentPlanId === plan.id} />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// 메인 컴포넌트
export function SubscriptionPayment() {
  const [showPlans, setShowPlans] = useState(false);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);

  const { data: subscription } = useQuery({
    queryKey: ['currentSubscription'],
    queryFn: getCurrentSubscription,
  });

  const { data: paymentMethod } = useQuery({
    queryKey: ['paymentMethod'],
    queryFn: getPaymentMethod,
  });

  const { data: paymentHistory } = useQuery({
    queryKey: ['paymentHistory'],
    queryFn: getPaymentHistory,
  });

  // 토큰 정보 (임시 데이터, 나중에 API로 교체)
  const tokenInfo = useMemo(
    () => ({
      current: subscription?.currentTokens ?? DEFAULT_TOKEN_VALUES.current,
      max: subscription?.maxTokens ?? DEFAULT_TOKEN_VALUES.max,
      resetDate: subscription?.tokenResetDate ?? DEFAULT_TOKEN_VALUES.resetDate,
      isPro: subscription?.planId === 'pro',
    }),
    [subscription]
  );

  const handleTokenPurchase = () => {
    if (tokenInfo.isPro) {
      // Pro 플랜 - 토큰 구매 다이얼로그 표시
      setShowPurchaseDialog(true);
    }
    // Free 플랜일 때는 버튼이 disabled이므로 이 함수가 호출되지 않음
  };

  const handlePurchase = (packageId: string, amount: number, price: number) => {
    // TODO: 실제 토큰 구매 API 호출
    // await purchaseTokens({ packageId, amount, price });
    // API 호출 후 구독 정보 refetch
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">구독 및 결제</h2>
        <p className="text-gray-600 mt-1">요금제와 결제 정보를 관리하세요</p>
      </div>

      <CurrentSubscriptionCard subscription={subscription} onChangePlan={() => setShowPlans(true)} />

      <TokenStatusCard
        currentTokens={tokenInfo.current}
        maxTokens={tokenInfo.max}
        tokenResetDate={tokenInfo.resetDate}
        isPro={tokenInfo.isPro}
        onPurchaseClick={handleTokenPurchase}
      />

      <PlanChangeDialog
        open={showPlans}
        onOpenChange={setShowPlans}
        currentPlanId={subscription?.planId}
      />

      <PurchaseTokenDialog
        open={showPurchaseDialog}
        onOpenChange={setShowPurchaseDialog}
        onPurchase={handlePurchase}
      />

      {/* 결제 수단 */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">결제 수단</h3>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {paymentMethod?.brand || '카드'} •••• {paymentMethod?.last4 || '****'}
                  </p>
                  <p className="text-sm text-gray-600">
                    만료: {paymentMethod?.expiryMonth || '--'}/{paymentMethod?.expiryYear || '--'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="border-gray-300 text-gray-700">
                  변경
                </Button>
                <Button variant="outline" className="border-gray-300 text-gray-700">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 결제 내역 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">결제 내역</h3>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {paymentHistory && paymentHistory.length > 0 ? (
                paymentHistory.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between py-3 border-b last:border-b-0 border-gray-100"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Receipt className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{payment.id}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="h-3 w-3 text-gray-500" />
                          <p className="text-sm text-gray-600">{payment.date}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          ₩{payment.amount.toLocaleString()}
                        </p>
                        <Badge
                          variant="outline"
                          className={PAYMENT_STATUS_CONFIG[payment.status].color}
                        >
                          {PAYMENT_STATUS_CONFIG[payment.status].label}
                        </Badge>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-300 text-gray-700"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">결제 내역이 없습니다</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
