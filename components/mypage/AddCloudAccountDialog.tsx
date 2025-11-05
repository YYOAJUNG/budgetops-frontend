'use client';

import { useState, ReactNode } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createAwsAccount } from '@/lib/api/aws';

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
  const [step, setStep] = useState<'select' | 'form'>('select');
  const [name, setName] = useState('');
  const [defaultRegion, setDefaultRegion] = useState('ap-northeast-2');
  const [accessKeyId, setAccessKeyId] = useState('');
  const [secretAccessKey, setSecretAccessKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: createAwsAccount,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['awsAccounts'] });
    }
  });

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
    if (selectedProvider === 'AWS') {
      setStep('form');
    }
  };

  const validate = (): string | null => {
    if (!name.trim()) return 'name은 필수입니다.';
    if (!defaultRegion.trim()) return 'defaultRegion은 필수입니다.';
    if (!/^[A-Z0-9]{16,24}$/.test(accessKeyId)) return 'accessKeyId 형식이 올바르지 않습니다.';
    if (secretAccessKey.length < 32 || secretAccessKey.length > 128) return 'secretAccessKey 길이가 올바르지 않습니다.';
    return null;
  };

  const handleSubmit = async () => {
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }
    setError(null);
    try {
      await mutateAsync({ name, defaultRegion, accessKeyId, secretAccessKey });
      onOpenChange(false);
      // reset state
      setSelectedProvider(null);
      setStep('select');
      setName('');
      setDefaultRegion('ap-northeast-2');
      setAccessKeyId('');
      setSecretAccessKey('');
    } catch (e: any) {
      const apiMsg = e?.response?.data?.message;
      const plainMsg = typeof e?.message === 'string' ? e.message : undefined;
      setError(apiMsg || plainMsg || '계정 등록 중 오류가 발생했습니다.');
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
          {step === 'select' && (
            <>
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
              <div className="flex items-start gap-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="w-5 h-5 rounded-full border-2 border-gray-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-gray-600">?</span>
                </div>
                <p className="text-sm text-gray-600">
                  원하는 클라우드 서비스가 없으신가요?{' '}
                  <a href="#" className="text-blue-600 hover:underline">BudgetOps에게 알려 주세요.</a>
                </p>
              </div>
            </>
          )}

          {step === 'form' && selectedProvider === 'AWS' && (
            <>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">AWS 자격 증명 입력</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">이름</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="team-prod" />
                </div>
                <div>
                  <Label htmlFor="region">기본 리전</Label>
                  <Input id="region" value={defaultRegion} onChange={(e) => setDefaultRegion(e.target.value)} placeholder="ap-northeast-2" />
                </div>
                <div>
                  <Label htmlFor="accessKeyId">Access Key ID</Label>
                  <Input id="accessKeyId" value={accessKeyId} onChange={(e) => setAccessKeyId(e.target.value)} placeholder="AKIA1234567890ABCD" />
                </div>
                <div>
                  <Label htmlFor="secretAccessKey">Secret Access Key</Label>
                  <Input id="secretAccessKey" type="password" value={secretAccessKey} onChange={(e) => setSecretAccessKey(e.target.value)} placeholder="wJalrXUt..." />
                </div>
                {error && (
                  <div className="text-sm text-red-600">{error}</div>
                )}
              </div>
            </>
          )}
        </div>

        {/* 하단 버튼 */}
        <div className="flex justify-end gap-2 p-6 border-t border-gray-200">
          {step === 'form' ? (
            <>
              <Button
                variant="outline"
                onClick={() => setStep('select')}
                className="px-4"
              >
                이전
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
              >
                {isPending ? '등록 중...' : '등록'}
              </Button>
            </>
          ) : (
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
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
