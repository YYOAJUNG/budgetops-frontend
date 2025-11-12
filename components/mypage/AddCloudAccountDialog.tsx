'use client';

import { useState, ReactNode, useRef } from 'react';
import { X, ChevronRight, ChevronLeft, ExternalLink, FileText, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { testGcpIntegration, saveGcpIntegration } from '@/lib/api/gcp';
import { createAwsAccount } from '@/lib/api/aws';
import { createAzureAccount } from '@/lib/api/azure';

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
  serviceAccountId?: string;
  jsonKeyFile?: File | null;
  jsonKeyFileName?: string;
  jsonKeyContent?: string; // JSON 파일 내용 (문자열)
  billingAccountId?: string;
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
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    {
      id: 'Azure' as CloudProvider,
      name: 'Microsoft Azure',
      logo: (
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Microsoft_Azure.svg/2048px-Microsoft_Azure.svg.png"
          alt="Azure"
          className="w-24 h-24 object-contain"
        />
      ),
    },
  ];

  const handleNext = () => {
    if (step === 'select' && selectedProvider) {
      setStep('credentials');
    }
  };

  const handleBack = () => {
    if (step === 'credentials') {
      setStep('select');
      setTestResult(null);
    }
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
      } else if (selectedProvider === 'Azure') {
        const payload = {
          name: credentials.accountName.trim(),
          subscriptionId: credentials.subscriptionId?.trim() || '',
          tenantId: credentials.tenantId?.trim() || '',
          clientId: credentials.clientId?.trim() || '',
          clientSecret: credentials.clientSecret || '',
        };

        if (!payload.name || !payload.subscriptionId || !payload.tenantId || !payload.clientId || !payload.clientSecret) {
          setErrorMsg('필수 입력 항목을 모두 채워주세요.');
          return;
        }

        await createAzureAccount(payload);
        setSuccessMsg('Azure 계정이 성공적으로 연동되었습니다.');
        if (onSuccess) {
          await onSuccess();
        }
        setTimeout(() => {
          onOpenChange(false);
          setStep('select');
          setSelectedProvider(null);
          setCredentials({ accountName: '' });
        }, 500);
      } else if (selectedProvider === 'GCP') {
        // GCP 계정 저장 API 호출
        if (!credentials.serviceAccountId?.trim() || !credentials.jsonKeyContent || !credentials.billingAccountId?.trim()) {
          setTestResult({
            success: false,
            message: '서비스 계정 ID, JSON 키 파일, 결제 계정 ID를 모두 입력해 주세요.',
          });
          return;
        }

        const saveResult = await saveGcpIntegration({
          serviceAccountId: credentials.serviceAccountId.trim(),
          serviceAccountKeyJson: credentials.jsonKeyContent,
          billingAccountId: credentials.billingAccountId.trim(),
        });

        if (saveResult.ok) {
          // 성공 시 다이얼로그 닫기
          onOpenChange(false);
          
          // 상태 초기화
          setStep('select');
          setSelectedProvider(null);
          setCredentials({ accountName: '' });
          setTestResult(null);
          
          // 페이지 새로고침 또는 목록 업데이트 (필요시)
          if (typeof window !== 'undefined') {
            window.location.reload();
          }
        } else {
          // 저장 실패
          setTestResult({
            success: false,
            message: saveResult.message || '계정 저장에 실패했어요.',
          });
        }
      } else {
        // Azure는 추후 구현
        setErrorMsg('현재는 AWS, GCP 계정 연동만 지원합니다.');
        setIsSubmitting(false);
        return;
      }
    } catch (error: any) {
      console.error('계정 연동 오류:', error);
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // JSON 파일을 문자열로 읽기 (파싱하지 않고 원본 그대로)
        const content = await file.text();
        setCredentials({
          ...credentials,
          jsonKeyFile: file,
          jsonKeyFileName: file.name,
          jsonKeyContent: content,
        });
        setTestResult(null);
      } catch (error) {
        console.error('파일 읽기 실패:', error);
        setTestResult({
          success: false,
          message: '파일을 읽을 수 없습니다. 다시 시도해 주세요.',
        });
      }
    }
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setTestResult(null);

    try {
      if (selectedProvider === 'GCP') {
        // GCP 통합 테스트 API 호출
        if (!credentials.serviceAccountId?.trim() || !credentials.jsonKeyContent) {
          setTestResult({
            success: false,
            message: '서비스 계정 ID와 JSON 키 파일을 모두 입력해 주세요.',
          });
          return;
        }

        if (!credentials.billingAccountId?.trim()) {
          setTestResult({
            success: false,
            message: '결제 계정 ID를 입력해 주세요.',
          });
          return;
        }

        const testResult = await testGcpIntegration({
          serviceAccountId: credentials.serviceAccountId.trim(),
          serviceAccountKeyJson: credentials.jsonKeyContent,
          billingAccountId: credentials.billingAccountId.trim(),
        });

        // 테스트 결과 처리
        if (testResult.ok) {
          // 서비스 계정과 결제 계정 모두 성공
          let message = '테스트에 성공하여 GCP 계정 연동이 완료됐어요.';
          
          // 누락된 권한이 있는 경우 메시지 추가
          if (testResult.serviceAccount.missingRoles.length > 0) {
            message += `\n다만 다음 권한이 누락되었습니다: ${testResult.serviceAccount.missingRoles.join(', ')}`;
          }

          setTestResult({
            success: true,
            message,
          });
        } else {
          // 테스트 실패
          const messages: string[] = [];
          
          if (!testResult.serviceAccount.ok) {
            messages.push('서비스 계정 테스트가 실패했습니다.');
          }
          
          if (!testResult.billing.ok) {
            messages.push('결제 계정 테스트가 실패했습니다.');
          }

          setTestResult({
            success: false,
            message: messages.join(' '),
          });
        }
      } else {
        // AWS, Azure 등의 테스트 로직 (향후 구현)
        const isSuccess = false;
        setTestResult({
          success: isSuccess,
          message: isSuccess 
            ? '테스트에 성공했어요.'
            : '테스트에 실패했어요. 입력한 정보를 다시 확인해 주세요.',
        });
      }
    } catch (error: any) {
      console.error('연결 테스트 실패:', error);
      
      let errorMessage = '서비스 계정 테스트가 실패했습니다.';
      
      // 서비스 계정 중복 체크
      if (error.response?.data?.message) {
        const message = error.response.data.message;
        if (message.includes('이미 등록된 서비스 계정') || message.includes('이미 연동')) {
          errorMessage = '동일한 서비스 계정이 이미 연동되어 있습니다.';
        }
        // 400 에러나 다른 에러는 이미 기본 메시지로 처리됨
      } else if (error.response?.status === 400) {
        // 400 Bad Request는 서비스 계정 테스트 실패로 간주
        errorMessage = '서비스 계정 테스트가 실패했습니다.';
      } else if (error.message && !error.message.includes('status code')) {
        // status code 메시지가 아닌 경우에만 사용
        errorMessage = error.message;
      }

      setTestResult({
        success: false,
        message: errorMessage,
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const isCredentialsValid = () => {
    if (!credentials.accountName?.trim()) return false;
    
    if (selectedProvider === 'AWS') {
      return !!(credentials.accessKeyId?.trim() && credentials.secretAccessKey?.trim());
    } else if (selectedProvider === 'Azure') {
      return !!(
        credentials.subscriptionId?.trim() && 
        credentials.tenantId?.trim() && 
        credentials.clientId?.trim() && 
        credentials.clientSecret?.trim()
      );
    } else if (selectedProvider === 'GCP') {
      return !!(
        credentials.serviceAccountId?.trim() &&
        credentials.jsonKeyContent && // JSON 파일 내용이 있어야 함
        credentials.billingAccountId?.trim() // 결제 계정 ID는 필수
      );
    }
    return false;
  };

  const needsConnectionTest = () => {
    // 연결 테스트가 필요한 CSP 목록
    return selectedProvider === 'GCP';
  };

  const renderCredentialsForm = () => {
    if (selectedProvider === 'AWS') {
      return (
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
      );
    } else if (selectedProvider === 'Azure') {
      return (
        <div className="space-y-4">
          <div>
            <Label htmlFor="accountName">계정 이름 *</Label>
            <Input
              id="accountName"
              placeholder="예: Production Azure(원하는 이름)"
              value={credentials.accountName}
              onChange={(e) => setCredentials({ ...credentials, accountName: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="subscriptionId">구독 ID *</Label>
            <Input
              id="subscriptionId"
              placeholder="12345678-1234-1234-1234-123456789012"
              value={credentials.subscriptionId || ''}
              onChange={(e) => setCredentials({ ...credentials, subscriptionId: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="tenantId">테넌트 ID *</Label>
            <Input
              id="tenantId"
              placeholder="87654321-4321-4321-4321-210987654321"
              value={credentials.tenantId || ''}
              onChange={(e) => setCredentials({ ...credentials, tenantId: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="clientId">클라이언트 ID *</Label>
            <Input
              id="clientId"
              placeholder="11111111-1111-1111-1111-111111111111"
              value={credentials.clientId || ''}
              onChange={(e) => setCredentials({ ...credentials, clientId: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="clientSecret">Client 값 *</Label>
            <Input
              id="clientSecret"
              type="password"
              placeholder="agk**~**_12AB34CEWFDKLGOELS****"
              value={credentials.clientSecret || ''}
              onChange={(e) => setCredentials({ ...credentials, clientSecret: e.target.value })}
            />
          </div>
        </div>
      );
    } else if (selectedProvider === 'GCP') {
      return (
        <div className="space-y-6">
          {/* 계정 이름 */}
          <div>
            <Label htmlFor="accountName">계정 이름 *</Label>
            <Input
              id="accountName"
              placeholder="예: Production GCP"
              value={credentials.accountName}
              onChange={(e) => setCredentials({ ...credentials, accountName: e.target.value })}
            />
          </div>

          {/* Step 1: 서비스 계정 생성 */}
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">1. 서비스 계정 생성</h3>
            <p className="text-sm text-gray-600 mb-4">
              GCP 콘솔에서 연동하려는 프로젝트의 서비스 계정을 생성한 뒤 서비스 계정 ID를 입력해 주세요.
            </p>
            <div className="space-y-2">
              <Label htmlFor="serviceAccountId">서비스 계정 ID</Label>
              <Input
                id="serviceAccountId"
                placeholder="example-service-account@project-name-12345.iam.gserviceaccount.com"
                value={credentials.serviceAccountId || ''}
                onChange={(e) => setCredentials({ ...credentials, serviceAccountId: e.target.value })}
              />
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-3">아래 4개의 역할을 부여해 주세요.</p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>기본 &gt; 뷰어</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>모니터링 &gt; 모니터링 뷰어</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>BigQuery &gt; BigQuery 데이터 뷰어</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>BigQuery &gt; BigQuery 작업 사용자</span>
              </li>
            </ul>
          </div>

          <div>
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

          {/* Step 2: 서비스 계정 JSON 키 업로드 */}
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">2. 서비스 계정 JSON 키 업로드</h3>
            <p className="text-sm text-gray-600 mb-4">
              생성한 서비스 계정의 키 탭으로 이동하여 키를 추가해 주세요. 키 유형은 JSON으로 선택해 주세요.
            </p>
            
            <div className="space-y-4">
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {credentials.jsonKeyFile ? 'JSON 파일 업로드됨' : 'JSON 파일 업로드'}
                </Button>
                {credentials.jsonKeyFileName && (
                  <p className="text-xs text-gray-500 mt-2">{credentials.jsonKeyFileName}</p>
                )}
              </div>
            </div>
          </div>

          {/* Step 3: 결제 내보내기 설정 */}
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">3. 결제 내보내기 설정</h3>
            <p className="text-sm text-gray-600 mb-4">
              비용 데이터를 가져오기 위해 BigQuery 내보내기 탭에서 자세한 사용량 비용 설정 수정을 눌러 주세요.
            </p>
            <p className="text-sm text-gray-600 mb-4">
              앞에서 선택한 프로젝트와 동일한 프로젝트를 선택하고, 새 데이터 세트 <code className="bg-gray-100 px-1 rounded">billing_export_dataset</code> 을 만들어 주세요.
            </p>
            
            <div>
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
          </div>

          {/* Step 4: 결제 계정 설정 */}
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">4. 결제 계정 설정</h3>
            <p className="text-sm text-gray-600 mb-4">
              결제 계정 관리 탭으로 이동하여 계정 ID를 입력해 주세요.
            </p>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="billingAccountId">결제 계정 ID</Label>
                <Input
                  id="billingAccountId"
                  placeholder="EXAMPL-123456-ABC123"
                  value={credentials.billingAccountId || ''}
                  onChange={(e) => setCredentials({ ...credentials, billingAccountId: e.target.value })}
                />
              </div>

              <div>
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
            </div>
          </div>

          {/* 연결 테스트 */}
          <div className="pt-6 border-t border-gray-200">
            <div className="space-y-4">
              <Button
                type="button"
                onClick={handleTestConnection}
                disabled={!isCredentialsValid() || isTestingConnection}
                className={cn(
                  'bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg',
                  (!isCredentialsValid() || isTestingConnection) && 'opacity-50 cursor-not-allowed'
                )}
              >
                {isTestingConnection ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    테스트 중...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    연결 테스트
                  </>
                )}
              </Button>
              {testResult && (
                <div className={cn(
                  'flex items-start gap-2 text-sm p-3 rounded-lg',
                  testResult.success 
                    ? 'bg-green-50 text-green-800 border border-green-200' 
                    : 'bg-red-50 text-red-800 border border-red-200'
                )}>
                  {testResult.success ? (
                    <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  ) : null}
                  <span className="whitespace-pre-line">{testResult.message}</span>
                </div>
              )}
            </div>
          </div>
        </div>
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
              setTestResult(null);
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
              <ChevronLeft className="h-5 w-5" />
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
            ) : needsConnectionTest() ? (
              <Button
                onClick={handleSubmit}
                disabled={!testResult || !testResult.success || isSubmitting}
                className={cn(
                  'bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg',
                  (!testResult || !testResult.success || isSubmitting) && 'opacity-50 cursor-not-allowed'
                )}
              >
                {isSubmitting ? '연동 중...' : '연동 완료'}
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
