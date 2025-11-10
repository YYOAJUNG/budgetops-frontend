'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createEc2Instance, CreateEc2InstanceRequest, AwsAccount } from '@/lib/api/aws';
import { AlertCircle, Loader2 } from 'lucide-react';

interface CreateEc2InstanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountId: number;
  account: AwsAccount;
  onSuccess?: () => void;
}

const COMMON_AMIS: Record<string, string> = {
  'us-east-1': 'ami-0c55b159cbfafe1f0', // Amazon Linux 2 (예시)
  'ap-northeast-2': 'ami-0c9c942bd7bf113a2', // Amazon Linux 2 (예시)
};

const INSTANCE_TYPES = [
  { value: 't3.micro', label: 't3.micro (1 vCPU, 1 GB RAM)' },
  { value: 't3.small', label: 't3.small (2 vCPU, 2 GB RAM)' },
  { value: 't3.medium', label: 't3.medium (2 vCPU, 4 GB RAM)' },
  { value: 't3.large', label: 't3.large (2 vCPU, 8 GB RAM)' },
];

export function CreateEc2InstanceDialog({
  open,
  onOpenChange,
  accountId,
  account,
  onSuccess,
}: CreateEc2InstanceDialogProps) {
  const [formData, setFormData] = useState<CreateEc2InstanceRequest>({
    name: '',
    instanceType: 't3.micro',
    imageId: COMMON_AMIS[account.defaultRegion] || '',
    keyPairName: '',
    securityGroupId: '',
    subnetId: '',
    availabilityZone: '',
    userData: '',
    minCount: 1,
    maxCount: 1,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!formData.name || !formData.instanceType || !formData.imageId) {
      setErrorMsg('필수 항목을 모두 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await createEc2Instance(accountId, formData, account.defaultRegion);
      if (onSuccess) {
        await onSuccess();
      }
      onOpenChange(false);
      // 폼 초기화
      setFormData({
        name: '',
        instanceType: 't3.micro',
        imageId: COMMON_AMIS[account.defaultRegion] || '',
        keyPairName: '',
        securityGroupId: '',
        subnetId: '',
        availabilityZone: '',
        userData: '',
        minCount: 1,
        maxCount: 1,
      });
    } catch (error: any) {
      console.error('EC2 인스턴스 생성 오류:', error);
      let errorMessage = '인스턴스 생성 중 오류가 발생했습니다.';
      if (error?.response?.data) {
        const errorData = error.response.data;
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }
      setErrorMsg(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>EC2 인스턴스 생성</DialogTitle>
          <DialogDescription>
            새로운 EC2 인스턴스를 생성합니다. 리전: {account.defaultRegion}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">인스턴스 이름 *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="예: my-web-server"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instanceType">인스턴스 타입 *</Label>
            <Select
              value={formData.instanceType}
              onValueChange={(value) => setFormData({ ...formData, instanceType: value })}
            >
              <SelectTrigger id="instanceType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INSTANCE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageId">AMI ID *</Label>
            <Input
              id="imageId"
              value={formData.imageId}
              onChange={(e) => setFormData({ ...formData, imageId: e.target.value })}
              placeholder="예: ami-0c55b159cbfafe1f0"
            />
            <p className="text-xs text-slate-500">
              {COMMON_AMIS[account.defaultRegion]
                ? `기본값: ${COMMON_AMIS[account.defaultRegion]} (Amazon Linux 2)`
                : 'AMI ID를 입력해주세요.'}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="keyPairName">키 페어 이름 (선택사항)</Label>
            <Input
              id="keyPairName"
              value={formData.keyPairName}
              onChange={(e) => setFormData({ ...formData, keyPairName: e.target.value })}
              placeholder="예: my-key-pair"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="securityGroupId">보안 그룹 ID (선택사항)</Label>
            <Input
              id="securityGroupId"
              value={formData.securityGroupId}
              onChange={(e) => setFormData({ ...formData, securityGroupId: e.target.value })}
              placeholder="예: sg-12345678"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subnetId">서브넷 ID (선택사항)</Label>
            <Input
              id="subnetId"
              value={formData.subnetId}
              onChange={(e) => setFormData({ ...formData, subnetId: e.target.value })}
              placeholder="예: subnet-12345678"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="availabilityZone">가용 영역 (선택사항)</Label>
            <Input
              id="availabilityZone"
              value={formData.availabilityZone}
              onChange={(e) => setFormData({ ...formData, availabilityZone: e.target.value })}
              placeholder="예: ap-northeast-2a"
            />
          </div>

          {errorMsg && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{errorMsg}</p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              취소
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  생성 중...
                </>
              ) : (
                '인스턴스 생성'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

