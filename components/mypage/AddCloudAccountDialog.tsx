'use client';

import { useState, ReactNode, useRef, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, ChevronRight, ChevronLeft, ExternalLink, CheckCircle2, Upload, Loader2, RefreshCw } from 'lucide-react';
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
  const [step, setStep] = useState<'select' | 'form' | 'gcp-credentials' | 'gcp-billing'>('select');
  const [name, setName] = useState('');
  const [defaultRegion, setDefaultRegion] = useState('ap-northeast-2');
  const [accessKeyId, setAccessKeyId] = useState('');
  const [secretAccessKey, setSecretAccessKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // GCP 관련 상태
  const [serviceAccountId, setServiceAccountId] = useState('');
  const [jsonFile, setJsonFile] = useState<File | null>(null);
  const [jsonFileName, setJsonFileName] = useState('');
  const [billingAccountId, setBillingAccountId] = useState('');
  const [connectionTestStatus, setConnectionTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [connectionTestMessage, setConnectionTestMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
    } else if (selectedProvider === 'GCP') {
      setStep('gcp-credentials');
    }
  };

  const handleGcpNext = () => {
    if (step === 'gcp-credentials') {
      setStep('gcp-billing');
      // 단계 변경 시 연결 테스트 상태 리셋
      setConnectionTestStatus('idle');
      setConnectionTestMessage('');
    }
  };

  const handleGcpBack = () => {
    if (step === 'gcp-billing') {
      setStep('gcp-credentials');
    } else if (step === 'gcp-credentials') {
      setStep('select');
      setSelectedProvider(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        setJsonFile(file);
        setJsonFileName(file.name);
        setConnectionTestStatus('idle');
        setConnectionTestMessage('');
      } else {
        setError('JSON 파일만 업로드할 수 있습니다.');
      }
    }
  };

  const handleConnectionTest = async () => {
    // 단계별 필수 필드 검증
    if (step === 'gcp-credentials') {
      if (!serviceAccountId || !jsonFile) {
        setConnectionTestStatus('error');
        setConnectionTestMessage('서비스 계정 ID와 JSON 파일을 모두 입력해 주세요.');
        return;
      }
    } else if (step === 'gcp-billing') {
      if (!billingAccountId) {
        setConnectionTestStatus('error');
        setConnectionTestMessage('결제 계정 ID를 입력해 주세요.');
        return;
      }
    }

    setConnectionTestStatus('testing');
    setConnectionTestMessage('');
    setError(null);

    try {
      // TODO: 실제 연결 테스트 API 호출
      // 임시로 2초 대기 후 성공으로 처리
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (step === 'gcp-credentials') {
        setConnectionTestStatus('success');
        setConnectionTestMessage('테스트에 성공했어요. 다음 단계로 넘어가세요.');
      } else if (step === 'gcp-billing') {
        setConnectionTestStatus('success');
        setConnectionTestMessage('테스트에 성공하여 GCP 계정 연동이 완료됐어요.');
      }
    } catch (e: any) {
      setConnectionTestStatus('error');
      setConnectionTestMessage('테스트에 실패했어요. 입력한 정보를 다시 확인해 주세요.');
    }
  };

  const handleGcpComplete = async () => {
    if (connectionTestStatus !== 'success') {
      setError('연결 테스트를 먼저 완료해 주세요.');
      return;
    }

    try {
      // TODO: GCP 계정 연동 API 호출
      // await createGcpAccount({ serviceAccountId, jsonFile, billingAccountId });
      
      onOpenChange(false);
      // reset
      setSelectedProvider(null);
      setStep('select');
      setServiceAccountId('');
      setJsonFile(null);
      setJsonFileName('');
      setBillingAccountId('');
      setConnectionTestStatus('idle');
      setConnectionTestMessage('');
    } catch (e: any) {
      const apiMsg = e?.response?.data?.message;
      setError(apiMsg || '계정 등록 중 오류가 발생했습니다.');
    }
  };

  // 모달이 닫힐 때 상태 리셋
  useEffect(() => {
    if (!open) {
      setSelectedProvider(null);
      setStep('select');
      setName('');
      setDefaultRegion('ap-northeast-2');
      setAccessKeyId('');
      setSecretAccessKey('');
      setServiceAccountId('');
      setJsonFile(null);
      setJsonFileName('');
      setBillingAccountId('');
      setConnectionTestStatus('idle');
      setConnectionTestMessage('');
      setError(null);
    }
  }, [open]);

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
      // reset
      setSelectedProvider(null);
      setStep('select');
      setName('');
      setDefaultRegion('ap-northeast-2');
      setAccessKeyId('');
      setSecretAccessKey('');
    } catch (e: any) {
      const apiMsg = e?.response?.data?.message;
      setError(apiMsg || '계정 등록 중 오류가 발생했습니다.');
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
              {selectedProvider === 'AWS' 
                ? `${userName} 님의 AWS 계정을 연동하고 있어요.`
                : selectedProvider === 'GCP' 
                ? `${userName} 님의 GCP 계정을 연동하고 있어요.`
                : `${userName} 님의 퍼블릭 클라우드 계정을 연동하고 있어요.`}
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
                  <Input id="accessKeyId" value={accessKeyId} onChange={(e) => setAccessKeyId(e.target.value)} placeholder="AKIA..." />
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

          {/* GCP 서비스 계정 생성 및 JSON 업로드 단계 */}
          {step === 'gcp-credentials' && selectedProvider === 'GCP' && (
            <div className="space-y-6">
              {/* 1. 서비스 계정 생성 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">1. 서비스 계정 생성</h3>
                <p className="text-sm text-gray-600 mb-4">
                  GCP 콘솔에서 연동하려는 프로젝트의 서비스 계정을 생성한 뒤 서비스 계정 ID를 입력해 주세요.
                </p>
                <div className="mb-4">
                  <Label htmlFor="serviceAccountId">서비스 계정 ID</Label>
                  <Input
                    id="serviceAccountId"
                    value={serviceAccountId}
                    onChange={(e) => setServiceAccountId(e.target.value)}
                    placeholder="example-service-account@project-name-12345.iam.gserviceaccount.com"
                    className="mt-1"
                  />
                </div>
                <p className="text-sm text-gray-600 mb-2">아래 4개의 역할을 부여해 주세요.</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {['기본 > 뷰어', '모니터링 > 모니터링 뷰어', 'BigQuery > BigQuery 데이터 뷰어', 'BigQuery > BigQuery 작업 사용자'].map((role) => (
                    <span
                      key={role}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 border border-gray-300 rounded-md"
                    >
                      {role}
                    </span>
                  ))}
                </div>
                <a
                  href="https://console.cloud.google.com/iam-admin/serviceaccounts"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 hover:underline"
                >
                  GCP 콘솔 &gt; 서비스 계정 탭 열기
                  <ExternalLink className="ml-1 h-4 w-4" />
                </a>
              </div>

              {/* 2. 서비스 계정 JSON 키 업로드 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">2. 서비스 계정 JSON 키 업로드</h3>
                <p className="text-sm text-gray-600 mb-4">
                  생성한 서비스 계정의 키 탭으로 이동하여 키를 추가해 주세요. 키 유형은 JSON으로 선택해 주세요.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    'border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors',
                    jsonFile
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                  )}
                >
                  {jsonFile ? (
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="text-sm font-medium">JSON 파일 업로드됨</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-600">
                      <Upload className="h-8 w-8" />
                      <span className="text-sm">JSON 파일 업로드</span>
                    </div>
                  )}
                </div>
                {jsonFileName && (
                  <p className="text-xs text-gray-500 mt-2">{jsonFileName}</p>
                )}
              </div>

              {/* 연결 테스트 */}
              <div className="flex items-center gap-4">
                <Button
                  onClick={handleConnectionTest}
                  disabled={connectionTestStatus === 'testing' || !serviceAccountId || !jsonFile}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {connectionTestStatus === 'testing' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      테스트 중...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      연결 테스트
                    </>
                  )}
                </Button>
                {connectionTestStatus === 'success' && (
                  <p className="text-sm text-green-600">{connectionTestMessage}</p>
                )}
                {connectionTestStatus === 'error' && (
                  <p className="text-sm text-red-600">{connectionTestMessage}</p>
                )}
              </div>

              {error && (
                <div className="text-sm text-red-600">{error}</div>
              )}
            </div>
          )}

          {/* GCP 결제 설정 단계 */}
          {step === 'gcp-billing' && selectedProvider === 'GCP' && (
            <div className="space-y-6">
              {/* 3. 결제 내보내기 설정 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">3. 결제 내보내기 설정</h3>
                <p className="text-sm text-gray-600 mb-4">
                  비용 데이터를 가져오기 위해 BigQuery 내보내기 탭에서{' '}
                  <span className="underline">자세한 사용량 비용 설정 수정</span>을 눌러 주세요.
                  앞에서 선택한 프로젝트와 동일한 프로젝트를 선택하고, 새 데이터 세트{' '}
                  <span className="underline font-mono">billing_export_dataset</span>을 만들어 주세요.
                </p>
                <a
                  href="https://console.cloud.google.com/billing/export"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 hover:underline"
                >
                  GCP 콘솔 &gt; 결제 내보내기 탭 열기
                  <ExternalLink className="ml-1 h-4 w-4" />
                </a>
              </div>

              {/* 4. 결제 계정 설정 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">4. 결제 계정 설정</h3>
                <p className="text-sm text-gray-600 mb-4">
                  결제 계정 관리 탭으로 이동하여 계정 ID를 입력해 주세요.
                </p>
                <div className="mb-4">
                  <Label htmlFor="billingAccountId">결제 계정 ID</Label>
                  <Input
                    id="billingAccountId"
                    value={billingAccountId}
                    onChange={(e) => setBillingAccountId(e.target.value)}
                    placeholder="EXAMPL-123456-ABC123"
                    className="mt-1"
                  />
                </div>
                <a
                  href="https://console.cloud.google.com/billing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 hover:underline"
                >
                  GCP 콘솔 &gt; 결제 계정 관리 탭 열기
                  <ExternalLink className="ml-1 h-4 w-4" />
                </a>
              </div>

              {/* 연결 테스트 */}
              <div className="flex items-center gap-4">
                <Button
                  onClick={handleConnectionTest}
                  disabled={connectionTestStatus === 'testing' || !billingAccountId}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {connectionTestStatus === 'testing' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      테스트 중...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      연결 테스트
                    </>
                  )}
                </Button>
                {connectionTestStatus === 'success' && (
                  <p className="text-sm text-green-600">{connectionTestMessage}</p>
                )}
                {connectionTestStatus === 'error' && (
                  <p className="text-sm text-red-600">{connectionTestMessage}</p>
                )}
              </div>

              {error && (
                <div className="text-sm text-red-600">{error}</div>
              )}
            </div>
          )}
        </div>

        {/* 하단 버튼 */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
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
          ) : step === 'gcp-credentials' ? (
            <>
              <Button
                variant="outline"
                onClick={handleGcpBack}
                className="px-4"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
              </Button>
              <Button
                onClick={handleGcpNext}
                disabled={connectionTestStatus !== 'success'}
                className={cn(
                  'bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg',
                  connectionTestStatus !== 'success' && 'opacity-50 cursor-not-allowed'
                )}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </>
          ) : step === 'gcp-billing' ? (
            <>
              <Button
                variant="outline"
                onClick={handleGcpBack}
                className="px-4"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
              </Button>
              <Button
                onClick={handleGcpComplete}
                disabled={connectionTestStatus !== 'success'}
                className={cn(
                  'bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg',
                  connectionTestStatus !== 'success' && 'opacity-50 cursor-not-allowed'
                )}
              >
                완료
              </Button>
            </>
          ) : (
            <div className="flex-1 flex justify-end">
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
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
