'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Loader2, ExternalLink } from 'lucide-react';
import type { AccountFormData, CloudProvider } from '@/types/accounts';
import { getProviderConfig } from '@/lib/config/providers';

interface AccountFormProps {
  provider: CloudProvider;
  onSubmit: (data: AccountFormData) => Promise<void>;
  isLoading?: boolean;
}

export function AccountForm({ provider, onSubmit, isLoading = false }: AccountFormProps) {
  const config = getProviderConfig(provider);
  const [formData, setFormData] = useState<Partial<AccountFormData>>({
    provider,
    name: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!config) {
    return <div>Provider configuration not found</div>;
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = '계정 이름은 필수입니다';
    }

    config.requiredFields.forEach(field => {
      if (!formData[field as keyof AccountFormData]?.trim()) {
        newErrors[field] = '이 필드는 필수입니다';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      await onSubmit(formData as AccountFormData);
    }
  };

  const isFormValid = () => {
    if (!formData.name?.trim()) return false;
    return config.requiredFields.every(field => 
      formData[field as keyof AccountFormData]?.trim()
    );
  };

  const handleOAuth = () => {
    if (config.oauthUrl) {
      // OAuth 플로우 시작 (스텁)
      console.log(`Starting OAuth flow for ${provider}`);
      alert(`${provider} OAuth 연동을 시작합니다. (스텁)`);
    }
  };

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
    <Card>
      <CardHeader>
        <CardTitle>{config.displayName} 계정 연동</CardTitle>
        <CardDescription>
          {config.displayName} 계정을 연결하여 비용 데이터를 수집합니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 계정 이름 */}
          <div className="space-y-2">
            <Label htmlFor="name">계정 이름 *</Label>
            <Input
              id="name"
              placeholder={getFieldPlaceholder('name')}
              value={formData.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* 필수 필드들 */}
          {config.requiredFields.map((field) => (
            <div key={field} className="space-y-2">
              <Label htmlFor={field}>{getFieldLabel(field)} *</Label>
              <Input
                id={field}
                type={field.includes('secret') || field.includes('Secret') ? 'password' : 'text'}
                placeholder={getFieldPlaceholder(field)}
                value={formData[field as keyof AccountFormData] || ''}
                onChange={(e) => handleInputChange(field, e.target.value)}
                aria-invalid={!!errors[field]}
              />
              {errors[field] && (
                <p className="text-sm text-red-600">{errors[field]}</p>
              )}
            </div>
          ))}

          {/* 선택적 필드들 */}
          {config.optionalFields.map((field) => (
            <div key={field} className="space-y-2">
              <Label htmlFor={field}>{getFieldLabel(field)}</Label>
              <Input
                id={field}
                type={field.includes('secret') || field.includes('Secret') ? 'password' : 'text'}
                placeholder={getFieldPlaceholder(field)}
                value={formData[field as keyof AccountFormData] || ''}
                onChange={(e) => handleInputChange(field, e.target.value)}
              />
            </div>
          ))}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={!isFormValid() || isLoading}
          >
            {isLoading ? (
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
              className="w-full"
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
