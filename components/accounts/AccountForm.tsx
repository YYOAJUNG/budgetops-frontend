'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ErrorBanner } from '@/components/ui/error-banner';
import { SuccessToast } from '@/components/ui/success-toast';
import { Loader2, ExternalLink } from 'lucide-react';
import type { AccountFormData, CloudProvider } from '@/types/accounts';
import { getProviderConfig } from '@/lib/config/providers';
import { useAccountLinking } from '@/hooks/useAccountLinking';
import { useFormValidation } from '@/hooks/useFormValidation';
import { showApiError } from '@/store/error';
import { logApiError } from '@/lib/error-logger';

interface AccountFormProps {
  provider: CloudProvider;
  onAccountLinked?: (account: any) => void;
}

export function AccountForm({ provider, onAccountLinked }: AccountFormProps) {
  const config = getProviderConfig(provider);
  const { linkingState, linkAccount, resetLinkingState } = useAccountLinking();
  const firstErrorFieldRef = useRef<HTMLInputElement>(null);

  // 폼 유효성 검사 설정
  const validationRules = {
    name: {
      required: true,
      message: '계정 이름은 필수입니다',
    },
    ...config.requiredFields.reduce((rules, field) => {
      rules[field] = {
        required: true,
        message: `${getFieldLabel(field)}은(는) 필수입니다`,
      };
      return rules;
    }, {} as Record<string, any>),
  };

  const {
    values: formData,
    errors,
    handleChange,
    handleBlur,
    handleSubmit,
    isValid,
    setFieldError,
  } = useFormValidation(
    {
      provider,
      name: '',
      ...config.requiredFields.reduce((fields, field) => {
        fields[field] = '';
        return fields;
      }, {} as Record<string, string>),
    },
    validationRules
  );

  if (!config) {
    return <div>Provider configuration not found</div>;
  }

  const onSubmit = async (values: typeof formData) => {
    try {
      resetLinkingState();
      await linkAccount(values as AccountFormData);
    } catch (error) {
      const errorMessage = '계정 연결 중 오류가 발생했습니다.';
      showApiError(errorMessage);
      logApiError(errorMessage, { 
        provider, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  };

  const handleOAuth = () => {
    if (config.oauthUrl) {
      // OAuth 플로우 시작 (스텁)
      console.log(`Starting OAuth flow for ${provider}`);
      alert(`${provider} OAuth 연동을 시작합니다. (스텁)`);
    }
  };

  // 성공 시 처리
  useEffect(() => {
    if (linkingState.status === 'success' && linkingState.pendingAccount && onAccountLinked) {
      onAccountLinked(linkingState.pendingAccount);
      // 폼 초기화
      setFormData({
        provider,
        name: '',
      });
      setErrors({});
    }
  }, [linkingState.status, linkingState.pendingAccount, onAccountLinked, provider]);

  // 실패 시 첫 번째 에러 필드로 포커스 이동
  useEffect(() => {
    if (linkingState.status === 'error' && firstErrorFieldRef.current) {
      firstErrorFieldRef.current.focus();
    }
  }, [linkingState.status]);

  const getFieldLabel = (field: string): string => {
    const labels: Record<string, string> = {
      name: '계정 이름',
      accessKeyId: 'Access Key ID',
      secretAccessKey: 'Secret Access Key',
      projectId: 'Project ID',
      serviceAccountKey: 'Service Account Key',
      subscriptionId: 'Subscription ID',
      clientId: 'Client ID',
      clientSecret: 'Client Secret',
      tenantId: 'Tenant ID',
      accessKey: 'Access Key',
      secretKey: 'Secret Key',
      region: 'Region',
    };
    return labels[field] || field;
  };

  const getFieldPlaceholder = (field: string): string => {
    const placeholders: Record<string, string> = {
      name: '예: Production AWS Account',
      accessKeyId: 'AKIA...',
      secretAccessKey: 'wJalrXUtn...',
      projectId: 'my-gcp-project-123',
      serviceAccountKey: 'JSON 키 내용 또는 파일 경로',
      subscriptionId: '12345678-1234-1234-1234-123456789012',
      clientId: '12345678-1234-1234-1234-123456789012',
      clientSecret: 'your-client-secret',
      tenantId: '12345678-1234-1234-1234-123456789012',
      accessKey: 'your-access-key',
      secretKey: 'your-secret-key',
      region: 'ap-northeast-2',
    };
    return placeholders[field] || `Enter ${field}`;
  };

  return (
    <Card className="shadow-lg border-0 bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold text-gray-900">{config.displayName} 계정 연동</CardTitle>
        <CardDescription className="text-gray-600">
          {config.displayName} 계정을 연결하여 비용 데이터를 수집합니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 에러 배너 */}
        {linkingState.status === 'error' && linkingState.error && (
          <ErrorBanner
            error={linkingState.error}
            onDismiss={resetLinkingState}
            aria-live="polite"
          />
        )}

        {/* 성공 토스트 */}
        {linkingState.status === 'success' && (
          <SuccessToast
            message={`${provider} 계정이 성공적으로 연결되었습니다!`}
            onDismiss={resetLinkingState}
            aria-live="polite"
          />
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* 계정 이름 */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">계정 이름 *</Label>
            <Input
              id="name"
              name="name"
              placeholder={getFieldPlaceholder('name')}
              value={formData.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              aria-invalid={!!errors.name}
              className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* 필수 필드들 */}
          {config.requiredFields.map((field) => (
            <div key={field} className="space-y-2">
              <Label htmlFor={field} className="text-sm font-medium text-gray-700">{getFieldLabel(field)} *</Label>
              <Input
                id={field}
                name={field}
                type={field.includes('secret') || field.includes('Secret') ? 'password' : 'text'}
                placeholder={getFieldPlaceholder(field)}
                value={formData[field as keyof AccountFormData] || ''}
                onChange={(e) => handleChange(field, e.target.value)}
                onBlur={() => handleBlur(field)}
                aria-invalid={!!errors[field]}
                className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
              {errors[field] && (
                <p className="text-sm text-red-600">{errors[field]}</p>
              )}
            </div>
          ))}

          {/* 선택적 필드들 */}
          {config.optionalFields.map((field) => (
            <div key={field} className="space-y-2">
              <Label htmlFor={field} className="text-sm font-medium text-gray-700">{getFieldLabel(field)}</Label>
              <Input
                id={field}
                name={field}
                type={field.includes('secret') || field.includes('Secret') ? 'password' : 'text'}
                placeholder={getFieldPlaceholder(field)}
                value={formData[field as keyof AccountFormData] || ''}
                onChange={(e) => handleChange(field, e.target.value)}
                onBlur={() => handleBlur(field)}
                className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          ))}

          <Button 
            type="submit" 
            className="w-full h-11 bg-[#eef2f9] hover:bg-[#e2e8f0] text-slate-600 font-medium border border-slate-200 hover:border-slate-300" 
            disabled={!isValid || linkingState.status === 'loading'}
          >
            {linkingState.status === 'loading' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                연동 중...
              </>
            ) : (
              '계정 연동'
            )}
          </Button>
        </form>

        {/* OAuth 옵션 */}
        {config.supportsOAuth && (
          <>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  또는
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-11 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
              onClick={handleOAuth}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              OAuth로 연동
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
