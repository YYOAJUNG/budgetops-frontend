'use client';

import { useState, ReactNode } from 'react';
import { X, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AddCloudAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName?: string;
}

type CloudProvider = 'AWS' | 'GCP' | 'Azure';

interface ProviderOption {
  id: CloudProvider;
  name: string;
  logo: ReactNode;
}

export function AddCloudAccountDialog({ open, onOpenChange, userName = '사용자' }: AddCloudAccountDialogProps) {
  const [selectedProvider, setSelectedProvider] = useState<CloudProvider | null>(null);

  const providers: ProviderOption[] = [
    {
      id: 'AWS' as CloudProvider,
      name: 'Amazon Web Services',
      logo: (
        <img
          src="https://blog.kakaocdn.net/dna/bHtI0M/btrlXwcnV06/AAAAAAAAAAAAAAAAAAAAAAZeZ2xLFHF6EuB7ZsymLFrqydE24S0HvnrrYq6xZb4T/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1761922799&allow_ip=&allow_referer=&signature=%2BqZecBZgEEEji%2BtxE07jfvLgA0o%3D"
          alt="AWS"
          className="w-24 h-24 object-contain"
        />
      ),
    },
    {
      id: 'GCP' as CloudProvider,
      name: 'Google Cloud Platform',
      logo: (
        <img
          src="https://img.icons8.com/?size=1200&id=WHRLQdbEXQ16&format=jpg"
          alt="GCP"
          className="w-24 h-24 object-contain"
        />
      ),
    },
  ];

  const handleNext = () => {
    if (selectedProvider) {
      // TODO: 다음 단계로 진행 (자격증명 입력)
      console.log('Selected provider:', selectedProvider);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">클라우드 계정 연동</h2>
            <p className="text-gray-600 mt-1">
              {userName} 님의 퍼블릭 클라우드 계정을 연동하고 있어요.
            </p>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* 본문 */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">클라우드 서비스 선택</h3>

          <div className="grid grid-cols-2 gap-4 mb-6">
            {providers.map((provider) => (
              <button
                key={provider.id}
                onClick={() => setSelectedProvider(provider.id)}
                className={cn(
                  'p-8 border-2 rounded-lg transition-all hover:border-blue-300 hover:shadow-md',
                  selectedProvider === provider.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white'
                )}
              >
                <div className="flex flex-col items-center gap-4">
                  <div>{provider.logo}</div>
                  <p className="font-medium text-gray-900">{provider.name}</p>
                </div>
              </button>
            ))}
          </div>

          {/* 도움말 */}
          <div className="flex items-start gap-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="w-5 h-5 rounded-full border-2 border-gray-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs text-gray-600">?</span>
            </div>
            <p className="text-sm text-gray-600">
              원하는 클라우드 서비스가 없으신가요?{' '}
              <a href="#" className="text-blue-600 hover:underline">
                BudgetOps에게 알려 주세요.
              </a>
            </p>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <Button
            onClick={handleNext}
            disabled={!selectedProvider}
            className={cn(
              'bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg',
              !selectedProvider && 'opacity-50 cursor-not-allowed'
            )}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
