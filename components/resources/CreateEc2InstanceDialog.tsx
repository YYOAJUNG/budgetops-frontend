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
import { AlertCircle, Loader2, Server, Cpu, Key, Shield, Network, MapPin, Info } from 'lucide-react';

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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Server className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-slate-900">
                EC2 인스턴스 생성
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-600 mt-1">
                리전: <span className="font-medium text-slate-900">{account.defaultRegion}</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-6 space-y-6">
          {/* 필수 항목 섹션 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <Info className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-semibold text-slate-900">필수 항목</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Server className="h-4 w-4 text-slate-500" />
                  인스턴스 이름 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="예: my-web-server"
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instanceType" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-slate-500" />
                  인스턴스 타입 <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.instanceType}
                  onValueChange={(value) => setFormData({ ...formData, instanceType: value })}
                >
                  <SelectTrigger id="instanceType" className="h-10">
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageId" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Server className="h-4 w-4 text-slate-500" />
                AMI ID <span className="text-red-500">*</span>
              </Label>
              <Input
                id="imageId"
                value={formData.imageId}
                onChange={(e) => setFormData({ ...formData, imageId: e.target.value })}
                placeholder="예: ami-0c55b159cbfafe1f0"
                className="h-10"
              />
              {COMMON_AMIS[account.defaultRegion] && (
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                  <Info className="h-3 w-3" />
                  기본값: <span className="font-mono">{COMMON_AMIS[account.defaultRegion]}</span> (Amazon Linux 2)
                </p>
              )}
            </div>
          </div>

          {/* 선택 항목 섹션 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <Info className="h-4 w-4 text-slate-500" />
              <h3 className="text-sm font-semibold text-slate-700">선택 항목</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="keyPairName" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Key className="h-4 w-4 text-slate-500" />
                  키 페어 이름
                </Label>
                <Input
                  id="keyPairName"
                  value={formData.keyPairName}
                  onChange={(e) => setFormData({ ...formData, keyPairName: e.target.value })}
                  placeholder="예: my-key-pair"
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="securityGroupId" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-slate-500" />
                  보안 그룹 ID
                </Label>
                <Input
                  id="securityGroupId"
                  value={formData.securityGroupId}
                  onChange={(e) => setFormData({ ...formData, securityGroupId: e.target.value })}
                  placeholder="예: sg-12345678"
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subnetId" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Network className="h-4 w-4 text-slate-500" />
                  서브넷 ID
                </Label>
                <Input
                  id="subnetId"
                  value={formData.subnetId}
                  onChange={(e) => setFormData({ ...formData, subnetId: e.target.value })}
                  placeholder="예: subnet-12345678"
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="availabilityZone" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-500" />
                  가용 영역
                </Label>
                <Input
                  id="availabilityZone"
                  value={formData.availabilityZone}
                  onChange={(e) => setFormData({ ...formData, availabilityZone: e.target.value })}
                  placeholder="예: ap-northeast-2a"
                  className="h-10"
                />
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-900">오류 발생</p>
                <p className="text-sm text-red-700 mt-1">{errorMsg}</p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="min-w-[100px]"
            >
              취소
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="min-w-[140px] bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  생성 중...
                </>
              ) : (
                <>
                  <Server className="mr-2 h-4 w-4" />
                  인스턴스 생성
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

