'use client';

import { useState } from 'react';
import { X, Zap, Check, Loader2 } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PurchaseQuestionUnitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPurchase?: (packageId: string, amount: number, price: number) => void;
  isLoading?: boolean;
}

interface QuestionUnitPackage {
  id: string;
  amount: number;
  price: number;
  bonus?: number;
  popular?: boolean;
}

const QUESTION_UNIT_PACKAGES: QuestionUnitPackage[] = [
  { id: 'small', amount: 10000, price: 4000 },
  { id: 'medium', amount: 20000, price: 6000, popular: true },
  { id: 'large', amount: 50000, price: 10000 },
];

const USAGE_INFO = [
  '구매한 토큰은 즉시 계정에 추가됩니다',
  '토큰은 월간 할당량과 별도로 사용됩니다',
  '구매한 토큰은 만료되지 않습니다',
];

// 토큰 숫자를 읽기 쉬운 형태로 변환 (예: 100000 -> "100k")
function formatTokenAmount(amount: number): string {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(amount % 1000000 === 0 ? 0 : 1)}m`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}k`;
  }
  return amount.toString();
}

// 서브 컴포넌트: 로딩 오버레이
function LoadingOverlay() {
  return (
    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-10 w-10 text-amber-600 animate-spin" />
        <p className="text-sm font-medium text-gray-700">토큰 구매 중...</p>
      </div>
    </div>
  );
}

// 서브 컴포넌트: 다이얼로그 헤더
function DialogHeader({ onClose, disabled }: { onClose: () => void; disabled: boolean }) {
  return (
    <div className="flex items-center justify-between p-6 border-b border-gray-200">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">토큰 구매</h2>
        <p className="text-gray-600 mt-1">필요한 토큰 패키지를 선택하세요</p>
      </div>
      <button
        onClick={onClose}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        disabled={disabled}
        aria-label="닫기"
      >
        <X className="h-5 w-5 text-gray-500" />
      </button>
    </div>
  );
}

// 서브 컴포넌트: 패키지 카드
function PackageCard({
  pkg,
  isSelected,
  onSelect,
}: {
  pkg: QuestionUnitPackage;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  const unitPrice = Math.round((pkg.price / pkg.amount) * 1000);

  return (
    <button
      onClick={() => onSelect(pkg.id)}
      className={cn(
        'relative p-3 sm:p-6 border-2 rounded-lg transition-all hover:border-amber-300 hover:shadow-md',
        isSelected ? 'border-amber-500 bg-amber-50' : 'border-gray-200 bg-white'
      )}
    >
      {pkg.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="px-3 py-1 bg-amber-500 text-white text-xs font-semibold rounded-full">
            인기
          </span>
        </div>
      )}
      {isSelected && (
        <div className="absolute top-3 right-3">
          <Check className="h-5 w-5 text-amber-600" />
        </div>
      )}
      <div className="flex flex-col items-center gap-2 sm:gap-3">
        <Zap
          className={cn(
            'h-8 w-8 sm:h-12 sm:w-12',
            isSelected ? 'text-amber-600' : 'text-gray-400'
          )}
        />
        <div className="text-center">
          <p className="text-xl sm:text-3xl font-bold text-gray-900">{formatTokenAmount(pkg.amount)}</p>
          <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">토큰</p>
        </div>
        <div className="mt-1 sm:mt-2">
          <p className="text-sm sm:text-xl font-semibold text-gray-900">
            ₩{pkg.price.toLocaleString()}
          </p>
          <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">
            1k당 ₩{unitPrice}
          </p>
        </div>
      </div>
    </button>
  );
}

// 서브 컴포넌트: 사용 안내
function UsageInfo() {
  return (
    <div className="flex items-start gap-2 p-4 bg-gray-50 rounded-lg border border-gray-200 mb-6">
      <div className="w-5 h-5 rounded-full border-2 border-gray-400 flex items-center justify-center flex-shrink-0 mt-0.5">
        <span className="text-xs text-gray-600">i</span>
      </div>
      <div className="text-sm text-gray-600">
        <p className="font-medium mb-1">토큰 사용 안내</p>
        <ul className="space-y-1 text-xs">
          {USAGE_INFO.map((info, index) => (
            <li key={index}>• {info}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// 메인 컴포넌트
export function PurchaseQuestionUnitDialog({
  open,
  onOpenChange,
  onPurchase,
  isLoading = false,
}: PurchaseQuestionUnitDialogProps) {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  const handlePurchase = () => {
    const pkg = QUESTION_UNIT_PACKAGES.find((p) => p.id === selectedPackage);
    if (pkg) {
      onPurchase?.(pkg.id, pkg.amount, pkg.price);
    }
  };

  const handleClose = () => onOpenChange(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[600px] p-0">
        {isLoading && <LoadingOverlay />}

        <DialogHeader onClose={handleClose} disabled={isLoading} />

        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
            {QUESTION_UNIT_PACKAGES.map((pkg) => (
              <PackageCard
                key={pkg.id}
                pkg={pkg}
                isSelected={selectedPackage === pkg.id}
                onSelect={setSelectedPackage}
              />
            ))}
          </div>

          <UsageInfo />

          <div className="flex gap-3">
            <Button
              onClick={handleClose}
              variant="outline"
              className="flex-1 border-gray-300 text-gray-700"
              disabled={isLoading}
            >
              취소
            </Button>
            <Button
              onClick={handlePurchase}
              disabled={!selectedPackage || isLoading}
              className={cn(
                'flex-1 bg-amber-500 hover:bg-amber-600 text-white',
                (!selectedPackage || isLoading) && 'opacity-50 cursor-not-allowed'
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  구매 중...
                </>
              ) : (
                '구매하기'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
