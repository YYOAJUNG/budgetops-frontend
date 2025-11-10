'use client';

import { useState } from 'react';
import { X, Zap, Check, Loader2 } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PurchaseTokenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPurchase?: (packageId: string, amount: number, price: number) => void;
  isLoading?: boolean;
}

interface TokenPackage {
  id: string;
  amount: number;
  price: number;
  bonus?: number;
  popular?: boolean;
}

const TOKEN_PACKAGES: TokenPackage[] = [
  {
    id: 'small',
    amount: 100,
    price: 5000,
  },
  {
    id: 'medium',
    amount: 500,
    price: 20000,
    bonus: 50,
    popular: true,
  },
  {
    id: 'large',
    amount: 1000,
    price: 35000,
    bonus: 150,
  },
];

export function PurchaseTokenDialog({
  open,
  onOpenChange,
  onPurchase,
  isLoading = false,
}: PurchaseTokenDialogProps) {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  const handlePurchase = () => {
    const pkg = TOKEN_PACKAGES.find((p) => p.id === selectedPackage);
    if (pkg) {
      // 백엔드는 기본 토큰 수량만 검증 (보너스 제외)
      onPurchase?.(pkg.id, pkg.amount, pkg.price);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0">
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-10 w-10 text-amber-600 animate-spin" />
              <p className="text-sm font-medium text-gray-700">토큰 구매 중...</p>
            </div>
          </div>
        )}
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">토큰 구매</h2>
            <p className="text-gray-600 mt-1">필요한 토큰 패키지를 선택하세요</p>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* 본문 */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {TOKEN_PACKAGES.map((pkg) => (
              <button
                key={pkg.id}
                onClick={() => setSelectedPackage(pkg.id)}
                className={cn(
                  'relative p-6 border-2 rounded-lg transition-all hover:border-amber-300 hover:shadow-md',
                  selectedPackage === pkg.id
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-gray-200 bg-white'
                )}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="px-3 py-1 bg-amber-500 text-white text-xs font-semibold rounded-full">
                      인기
                    </span>
                  </div>
                )}
                {selectedPackage === pkg.id && (
                  <div className="absolute top-3 right-3">
                    <Check className="h-5 w-5 text-amber-600" />
                  </div>
                )}
                <div className="flex flex-col items-center gap-3">
                  <Zap
                    className={cn(
                      'h-12 w-12',
                      selectedPackage === pkg.id ? 'text-amber-600' : 'text-gray-400'
                    )}
                  />
                  <div className="text-center">
                    <p className="text-3xl font-bold text-gray-900">{pkg.amount}</p>
                    <div className="h-5 mt-1">
                      {pkg.bonus && (
                        <p className="text-sm text-amber-600 font-medium">+{pkg.bonus} 보너스</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-xl font-semibold text-gray-900">
                      ₩{pkg.price.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      토큰당 ₩{Math.round(pkg.price / (pkg.amount + (pkg.bonus || 0)))}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* 안내 메시지 */}
          <div className="flex items-start gap-2 p-4 bg-gray-50 rounded-lg border border-gray-200 mb-6">
            <div className="w-5 h-5 rounded-full border-2 border-gray-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs text-gray-600">i</span>
            </div>
            <div className="text-sm text-gray-600">
              <p className="font-medium mb-1">토큰 사용 안내</p>
              <ul className="space-y-1 text-xs">
                <li>• 구매한 토큰은 즉시 계정에 추가됩니다</li>
                <li>• 토큰은 월간 할당량과 별도로 사용됩니다</li>
                <li>• 구매한 토큰은 만료되지 않습니다</li>
              </ul>
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex gap-3">
            <Button
              onClick={() => onOpenChange(false)}
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
