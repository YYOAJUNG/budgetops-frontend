'use client';

import { useState } from 'react';
import { CreditCard, CheckCircle, Calendar, Download, Receipt, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PaymentHistory {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  invoiceUrl: string;
}

const mockPaymentHistory: PaymentHistory[] = [
  {
    id: 'INV-2024-10',
    date: '2024-10-01',
    amount: 4900,
    status: 'paid',
    invoiceUrl: '#',
  },
  {
    id: 'INV-2024-09',
    date: '2024-09-01',
    amount: 4900,
    status: 'paid',
    invoiceUrl: '#',
  },
  {
    id: 'INV-2024-08',
    date: '2024-08-01',
    amount: 4900,
    status: 'paid',
    invoiceUrl: '#',
  },
];

const plans = [
  {
    id: 'free',
    name: '무료',
    price: 0,
    period: '월',
    features: [
      '클라우드 계정 1개',
      '월 100만원 이하 비용 추적',
      '기본 리포트',
      '이메일 지원',
    ],
  },
  {
    id: 'pro',
    name: '프로',
    price: 4900,
    period: '월',
    popular: true,
    features: [
      '무제한 클라우드 계정',
      '무제한 비용 추적',
      '고급 분석 및 리포트',
      '이상징후 탐지',
      '비용 예측',
      '최적화 권장사항',
      '우선 지원',
    ],
  },
  {
    id: 'enterprise',
    name: '엔터프라이즈',
    price: null,
    period: '문의',
    features: [
      '프로 플랜의 모든 기능',
      '전담 계정 관리자',
      '맞춤형 대시보드',
      'SSO 통합',
      '온프레미스 배포 옵션',
      'SLA 보장',
      '24/7 전화 지원',
    ],
  },
];

export function SubscriptionPayment() {
  const [currentPlan] = useState('pro');

  const statusConfig = {
    paid: {
      label: '결제 완료',
      color: 'bg-green-50 text-green-700 border-green-200',
    },
    pending: {
      label: '대기 중',
      color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    },
    failed: {
      label: '실패',
      color: 'bg-red-50 text-red-700 border-red-200',
    },
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">구독 및 결제</h2>
        <p className="text-gray-600 mt-1">요금제와 결제 정보를 관리하세요</p>
      </div>

      {/* 현재 구독 정보 */}
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
              <h3 className="text-2xl font-bold text-gray-900 mb-1">프로 플랜</h3>
              <p className="text-gray-600">월 49,000원</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-1">다음 결제일</p>
              <p className="font-semibold text-gray-900">2024년 11월 1일</p>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button variant="outline" className="border-gray-300 text-gray-700">
              플랜 변경
            </Button>
            <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
              구독 취소
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 사용 가능한 플랜 */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">사용 가능한 플랜</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative ${
                plan.popular ? 'border-blue-500 shadow-lg' : 'border-gray-200'
              }`}
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
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full ${
                    currentPlan === plan.id
                      ? 'bg-gray-100 text-gray-600 cursor-not-allowed'
                      : plan.popular
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-900 hover:bg-gray-800 text-white'
                  }`}
                  disabled={currentPlan === plan.id}
                >
                  {currentPlan === plan.id
                    ? '현재 플랜'
                    : plan.price !== null
                    ? '플랜 선택'
                    : '영업팀 문의'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

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
                  <p className="font-medium text-gray-900">Visa •••• 1234</p>
                  <p className="text-sm text-gray-600">만료: 12/25</p>
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
              {mockPaymentHistory.map((payment) => (
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
                        className={statusConfig[payment.status].color}
                      >
                        {statusConfig[payment.status].label}
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
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
