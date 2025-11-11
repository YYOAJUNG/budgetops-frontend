'use client';

import { useState, ReactNode } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface AddCloudAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName?: string;
  onSuccess?: () => void;
}

type CloudProvider = 'AWS' | 'GCP' | 'Azure';

interface ProviderOption {
  id: CloudProvider;
  name: string;
  logo: ReactNode;
}

interface CredentialForm {
  accountName: string;
  // AWS
  accessKeyId?: string;
  secretAccessKey?: string;
  region?: string;
  // GCP
  projectId?: string;
  serviceAccountKey?: string;
  // Azure
  subscriptionId?: string;
  tenantId?: string;
  clientId?: string;
  clientSecret?: string;
}

export function AddCloudAccountDialog({ open, onOpenChange, userName = '사용자', onSuccess }: AddCloudAccountDialogProps) {
  const [step, setStep] = useState<'select' | 'credentials'>('select');
  const [selectedProvider, setSelectedProvider] = useState<CloudProvider | null>(null);
  const [credentials, setCredentials] = useState<CredentialForm>({
    accountName: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  async function submitAws() {
    const { createAwsAccount } = await import('@/lib/api/aws');
    const payload = {
      name: credentials.accountName,
      defaultRegion: credentials.region || 'ap-northeast-2',
      accessKeyId: credentials.accessKeyId || '',
      secretAccessKey: credentials.secretAccessKey || '',
    };
    const resp = await createAwsAccount(payload);
    return resp;
  }

  const providers: ProviderOption[] = [
    {
      id: 'AWS' as CloudProvider,
      name: 'Amazon Web Services',
      logo: (
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Amazon_Web_Services_Logo.svg/1024px-Amazon_Web_Services_Logo.svg.png"
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
          src="https://media.licdn.com/dms/image/v2/D4D12AQGfCXrXtM974A/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1711743896544?e=2147483647&v=beta&t=KhpXKzuoiv2wJyVVNP9WZ4msnz6tVVCJnWNtHSLwFJw"
          alt="GCP"
          className="w-24 h-24 object-contain"
        />
      ),
    },
  ];

  const handleNext = () => {
    if (selectedProvider) {
      setStep('credentials');
    }
  };

  const handleBack = () => {
    setStep('select');
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      setErrorMsg(null);
      setSuccessMsg(null);
      if (selectedProvider === 'AWS') {
        await submitAws();
        setSuccessMsg('AWS 계정이 성공적으로 연동되었습니다.');
        // 성공 후 콜백 호출 (다이얼로그 닫기 전에)
        if (onSuccess) {
          await onSuccess();
        }
        // 약간의 지연 후 다이얼로그 닫기 (데이터 갱신 시간 확보)
        setTimeout(() => {
          onOpenChange(false);
          setStep('select');
          setSelectedProvider(null);
          setCredentials({ accountName: '' });
        }, 500);
      } else {
        // GCP/Azure는 추후 구현
        setErrorMsg('현재는 AWS 계정 연동만 지원합니다.');
        setIsSubmitting(false);
        return;
      }
    } catch (error: any) {
      console.error('AWS 계정 연동 오류:', error);
      // 백엔드에서 반환한 에러 메시지 추출
      let errorMessage = '계정 연동 중 오류가 발생했습니다. 입력 정보를 확인하세요.';
      
      if (error?.response?.data) {
        const errorData = error.response.data;
        // 백엔드 에러 응답 형식에 따라 메시지 추출
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      } else if (error?.response?.status === 400) {
        // 400 Bad Request인 경우 백엔드 메시지 확인
        const errorData = error?.response?.data;
        if (errorData?.message) {
          errorMessage = errorData.message;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      setErrorMsg(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCredentialsValid = () => {
    if (!credentials.accountName) return false;
    
    if (selectedProvider === 'AWS') {
      return credentials.accessKeyId && credentials.secretAccessKey;
    } else if (selectedProvider === 'GCP') {
      return credentials.projectId;
    } else if (selectedProvider === 'Azure') {
      return credentials.subscriptionId && credentials.tenantId && 
             credentials.clientId && credentials.clientSecret;
    }
    return false;
  };

  const renderCredentialsForm = () => {
    if (selectedProvider === 'AWS') {
      return (
        <>
          <div className="space-y-4">
            <div>
              <Label htmlFor="accountName">계정 이름 *</Label>
              <Input
                id="accountName"
                placeholder="예: Production AWS"
                value={credentials.accountName}
                onChange={(e) => setCredentials({ ...credentials, accountName: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="accessKeyId">Access Key ID *</Label>
              <Input
                id="accessKeyId"
                placeholder="AKIAIOSFODNN7EXAMPLE"
                value={credentials.accessKeyId || ''}
                onChange={(e) => setCredentials({ ...credentials, accessKeyId: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="secretAccessKey">Secret Access Key *</Label>
              <Input
                id="secretAccessKey"
                type="password"
                placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                value={credentials.secretAccessKey || ''}
                onChange={(e) => setCredentials({ ...credentials, secretAccessKey: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="region">Region (선택사항)</Label>
              <Input
                id="region"
                placeholder="us-east-1"
                value={credentials.region || ''}
                onChange={(e) => setCredentials({ ...credentials, region: e.target.value })}
              />
            </div>
          </div>
        </>
      );
    } else if (selectedProvider === 'GCP') {
      return (
        <>
          <div className="space-y-4">
            <div>
              <Label htmlFor="accountName">계정 이름 *</Label>
              <Input
                id="accountName"
                placeholder="예: Staging GCP"
                value={credentials.accountName}
                onChange={(e) => setCredentials({ ...credentials, accountName: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="projectId">Project ID *</Label>
              <Input
                id="projectId"
                placeholder="my-project-123"
                value={credentials.projectId || ''}
                onChange={(e) => setCredentials({ ...credentials, projectId: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="serviceAccountKey">Service Account Key (선택사항)</Label>
              <textarea
                id="serviceAccountKey"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder='{"type": "service_account", "project_id": "..."}'
                value={credentials.serviceAccountKey || ''}
                onChange={(e) => setCredentials({ ...credentials, serviceAccountKey: e.target.value })}
              />
            </div>
          </div>
        </>
      );
    } else if (selectedProvider === 'Azure') {
      return (
        <>
          <div className="space-y-4">
            <div>
              <Label htmlFor="accountName">계정 이름 *</Label>
              <Input
                id="accountName"
                placeholder="예: Production Azure"
                value={credentials.accountName}
                onChange={(e) => setCredentials({ ...credentials, accountName: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="subscriptionId">Subscription ID *</Label>
              <Input
                id="subscriptionId"
                placeholder="12345678-1234-1234-1234-123456789012"
                value={credentials.subscriptionId || ''}
                onChange={(e) => setCredentials({ ...credentials, subscriptionId: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="tenantId">Tenant ID *</Label>
              <Input
                id="tenantId"
                placeholder="87654321-4321-4321-4321-210987654321"
                value={credentials.tenantId || ''}
                onChange={(e) => setCredentials({ ...credentials, tenantId: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="clientId">Client ID *</Label>
              <Input
                id="clientId"
                placeholder="11111111-1111-1111-1111-111111111111"
                value={credentials.clientId || ''}
                onChange={(e) => setCredentials({ ...credentials, clientId: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="clientSecret">Client Secret *</Label>
              <Input
                id="clientSecret"
                type="password"
                placeholder="your-client-secret"
                value={credentials.clientSecret || ''}
                onChange={(e) => setCredentials({ ...credentials, clientSecret: e.target.value })}
              />
            </div>
          </div>
        </>
      );
    }
    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">클라우드 계정 연동</h2>
            <p className="text-gray-600 mt-1">
              {step === 'select' 
                ? `${userName} 님의 퍼블릭 클라우드 계정을 연동하고 있어요.`
                : `${selectedProvider} 계정 자격 증명을 입력하세요.`
              }
            </p>
          </div>
          <button
            onClick={() => {
              onOpenChange(false);
              // 다이얼로그 닫을 때 상태 초기화
              setStep('select');
              setSelectedProvider(null);
              setCredentials({ accountName: '' });
            }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* 본문 */}
        <div className="p-6">
          {step === 'select' ? (
            <>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">클라우드 서비스 선택</h3>
              {errorMsg && <p className="mb-3 text-sm text-red-600">{errorMsg}</p>}
              {successMsg && <p className="mb-3 text-sm text-green-600">{successMsg}</p>}

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
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {selectedProvider} 자격 증명
              </h3>
              {errorMsg && <p className="mb-3 text-sm text-red-600">{errorMsg}</p>}
              {successMsg && <p className="mb-3 text-sm text-green-600">{successMsg}</p>}
              {renderCredentialsForm()}
            </>
          )}
        </div>

        {/* 하단 버튼 */}
        <div className="flex justify-between p-6 border-t border-gray-200">
          {step === 'credentials' && (
            <Button
              onClick={handleBack}
              variant="outline"
              className="border-gray-300 text-gray-700"
            >
              <ChevronLeft className="h-5 w-5 mr-1" />
              이전
            </Button>
          )}
          <div className="ml-auto">
            {step === 'select' ? (
              <Button
                onClick={handleNext}
                disabled={!selectedProvider}
                className={cn(
                  'bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg',
                  !selectedProvider && 'opacity-50 cursor-not-allowed'
                )}
              >
                다음
                <ChevronRight className="h-5 w-5 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!isCredentialsValid() || isSubmitting}
                className={cn(
                  'bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg',
                  (!isCredentialsValid() || isSubmitting) && 'opacity-50 cursor-not-allowed'
                )}
              >
                {isSubmitting ? '연동 중...' : '계정 연동'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
