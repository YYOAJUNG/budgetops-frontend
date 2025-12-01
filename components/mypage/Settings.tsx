'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, Bell, Globe, Shield, Moon, Wallet, Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Toggle } from '@/components/ui/toggle';
import { SettingsState } from '@/types/mypage';
import { deleteCurrentUser } from '@/lib/api/user';
import { useAuthStore } from '@/store/auth';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn, formatCurrency } from '@/lib/utils';
import {
  getBudgetSettings,
  getBudgetUsage,
  updateBudgetSettings,
  type AccountBudgetUsage,
  type BudgetMode,
  type CloudProvider,
} from '@/lib/api/budget';
import { getSlackSettings, updateSlackSettings } from '@/lib/api/notifications';
import { getAwsAccounts } from '@/lib/api/aws';
import { getAzureAccounts } from '@/lib/api/azure';
import { getGcpAccounts } from '@/lib/api/gcp';
import { getNcpAccounts } from '@/lib/api/ncp';

// 모바일 반응형 관련 상수
const MOBILE_RESPONSIVE_TEXT = 'text-sm md:text-base';
const MOBILE_RESPONSIVE_BUTTON = 'w-full md:w-auto';
const MOBILE_HEADER_LAYOUT = 'flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4';
const MOBILE_TOGGLE_LAYOUT = 'flex items-center justify-between gap-4';

type AccountBudgetFormState = {
  provider: CloudProvider;
  accountId: number;
  accountName: string;
  enabled: boolean;
  monthlyBudgetLimit: number;
  alertThreshold: number;
};

const DEFAULT_THRESHOLD = 80;

const PROVIDER_BADGE_COLORS: Record<CloudProvider, string> = {
  AWS: 'bg-orange-50 text-orange-700 border-orange-200',
  AZURE: 'bg-blue-50 text-blue-700 border-blue-200',
  GCP: 'bg-green-50 text-green-700 border-green-200',
  NCP: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

export function Settings() {
  const [settings, setSettings] = useState<SettingsState>({
    notifications: {
      budgetAlerts: true,
      anomalyDetection: true,
      slackNotifications: true,
    },
    preferences: {
      language: 'ko',
      currency: 'KRW',
      timezone: 'Asia/Seoul',
      theme: 'light',
    },
    privacy: {
      dataSharing: false,
      analytics: true,
      twoFactorAuth: false,
    },
  });
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [budgetAmountInput, setBudgetAmountInput] = useState<string>('');
  const [alertThreshold, setAlertThreshold] = useState<number>(DEFAULT_THRESHOLD);
  const [budgetMode, setBudgetMode] = useState<BudgetMode>('CONSOLIDATED');
  const [accountBudgetsState, setAccountBudgetsState] = useState<Record<string, AccountBudgetFormState>>({});
  const [slackWebhookInput, setSlackWebhookInput] = useState('');
  const [slackEnabled, setSlackEnabled] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();
  const { logout } = useAuthStore();

  // 연동된 클라우드 계정 조회 (예산 섹션에서 계정별 예산 표시 여부 결정에 사용)
  const { data: awsAccounts } = useQuery({
    queryKey: ['awsAccounts'],
    queryFn: getAwsAccounts,
  });
  const { data: azureAccounts } = useQuery({
    queryKey: ['azureAccounts'],
    queryFn: getAzureAccounts,
  });
  const { data: gcpAccounts } = useQuery({
    queryKey: ['gcpAccounts'],
    queryFn: getGcpAccounts,
  });
  const { data: ncpAccounts } = useQuery({
    queryKey: ['ncpAccounts'],
    queryFn: getNcpAccounts,
  });

  const { data: budgetSettings, isLoading: isBudgetLoading } = useQuery({
    queryKey: ['budgetSettings'],
    queryFn: getBudgetSettings,
  });

  const { data: budgetUsage, isLoading: isBudgetUsageLoading } = useQuery({
    queryKey: ['budgetUsage'],
    queryFn: getBudgetUsage,
  });

  const { data: slackSettings, isLoading: isSlackSettingsLoading } = useQuery({
    queryKey: ['slackSettings'],
    queryFn: getSlackSettings,
  });

  useEffect(() => {
    if (!budgetSettings) {
      return;
    }
    setBudgetMode(budgetSettings.mode ?? 'CONSOLIDATED');
    setBudgetAmountInput(
      budgetSettings.monthlyBudgetLimit !== undefined && budgetSettings.monthlyBudgetLimit !== null
        ? String(budgetSettings.monthlyBudgetLimit)
        : ''
    );
    setAlertThreshold(budgetSettings.alertThreshold ?? DEFAULT_THRESHOLD);
  }, [budgetSettings]);

  useEffect(() => {
    if (!slackSettings) {
      return;
    }
    setSlackEnabled(Boolean(slackSettings.enabled));
    setSlackWebhookInput(slackSettings.webhookUrl ?? '');
  }, [slackSettings]);

  useEffect(() => {
    // 예산 사용량, 예산 설정, 또는 클라우드 계정 정보 중 아무 것도 준비되지 않았으면 먼저 대기
    if (
      !budgetUsage &&
      !(budgetSettings?.accountBudgets?.length) &&
      !awsAccounts &&
      !azureAccounts &&
      !gcpAccounts &&
      !ncpAccounts
    ) {
      return;
    }
    setAccountBudgetsState((prev) => {
      const next: Record<string, AccountBudgetFormState> = {};

      const registerAccount = (account: {
        provider: CloudProvider;
        accountId: number;
        accountName?: string | null;
        currentLimit: number;
        currentThreshold: number;
        enabled: boolean;
      }) => {
        const key = buildAccountKey(account.provider, account.accountId);
        const existing = prev[key];
        next[key] = existing
          ? {
              ...existing,
              accountName: account.accountName ?? existing.accountName,
            }
          : {
              provider: account.provider,
              accountId: account.accountId,
              accountName: account.accountName ?? `${account.provider} #${account.accountId}`,
              enabled: account.enabled,
              monthlyBudgetLimit: account.currentLimit,
              alertThreshold: account.currentThreshold,
            };
      };

      // 1) 예산 사용량 기반 계정 등록
      (budgetUsage?.accountUsages ?? []).forEach((usage) => {
        const matchedSetting = budgetSettings?.accountBudgets.find(
          (budget) => budget.provider === usage.provider && Number(budget.accountId) === usage.accountId
        );

        registerAccount({
          provider: usage.provider,
          accountId: usage.accountId,
          accountName: usage.accountName,
          currentLimit:
            matchedSetting?.monthlyBudgetLimit ??
            (usage.monthlyBudgetLimit !== undefined && usage.monthlyBudgetLimit !== null
              ? usage.monthlyBudgetLimit
              : 0),
          currentThreshold: matchedSetting?.alertThreshold ?? (budgetSettings?.alertThreshold ?? DEFAULT_THRESHOLD),
          enabled: Boolean(matchedSetting) || Boolean(usage.hasBudget),
        });
      });

      // 2) 저장된 계정별 예산 설정 기반 계정 등록
      (budgetSettings?.accountBudgets ?? []).forEach((setting) => {
        const key = buildAccountKey(setting.provider, setting.accountId);
        if (!next[key]) {
          next[key] = {
            provider: setting.provider,
            accountId: Number(setting.accountId),
            accountName: setting.accountName ?? `${setting.provider} #${setting.accountId}`,
            enabled: true,
            monthlyBudgetLimit: setting.monthlyBudgetLimit,
            alertThreshold: setting.alertThreshold ?? (budgetSettings?.alertThreshold ?? DEFAULT_THRESHOLD),
          };
        }
      });

      // 3) 예산/사용량에는 아직 없지만, 실제로 연동된 클라우드 계정도 목록에 포함
      const registerLinkedAccount = (
        provider: CloudProvider,
        accountId: number,
        accountName?: string | null,
        active: boolean = true
      ) => {
        if (!active) return;
        const key = buildAccountKey(provider, accountId);
        if (next[key]) return;
        next[key] = {
          provider,
          accountId,
          accountName: accountName ?? `${provider} #${accountId}`,
          enabled: false, // 기본값: 계정별 예산은 아직 비활성화
          monthlyBudgetLimit: 0,
          alertThreshold: budgetSettings?.alertThreshold ?? DEFAULT_THRESHOLD,
        };
      };

      (awsAccounts ?? []).forEach((acc) =>
        registerLinkedAccount('AWS', acc.id, acc.name, acc.active)
      );
      (azureAccounts ?? []).forEach((acc) =>
        registerLinkedAccount('AZURE', acc.id, acc.name, acc.active)
      );
      (gcpAccounts ?? []).forEach((acc) =>
        registerLinkedAccount('GCP', acc.id, acc.name ?? acc.serviceAccountName, true)
      );
      (ncpAccounts ?? []).forEach((acc) =>
        registerLinkedAccount('NCP', acc.id, acc.name, acc.active)
      );

      return next;
    });
  }, [budgetUsage, budgetSettings, awsAccounts, azureAccounts, gcpAccounts, ncpAccounts]);

  const budgetMutation = useMutation({
    mutationFn: updateBudgetSettings,
    onSuccess: async (data) => {
      queryClient.setQueryData(['budgetSettings'], data);
      await queryClient.invalidateQueries({ queryKey: ['budgetUsage'] });
      alert('예산 설정이 저장되었습니다.');
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        '예산 설정 저장 중 오류가 발생했습니다.';
      alert(message);
    },
  });

  const slackSettingsMutation = useMutation({
    mutationFn: updateSlackSettings,
    onSuccess: (data) => {
      setSlackEnabled(Boolean(data.enabled));
      setSlackWebhookInput(data.webhookUrl ?? '');
      alert('Slack 설정이 저장되었습니다.');
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Slack 설정 저장 중 오류가 발생했습니다.';
      alert(message);
    },
  });

  const budgetAmount = useMemo(() => {
    if (!budgetAmountInput) return 0;
    const parsed = Number(budgetAmountInput);
    return Number.isNaN(parsed) ? 0 : parsed;
  }, [budgetAmountInput]);

  const invalidAccounts = useMemo(
    () =>
      Object.values(accountBudgetsState).filter(
        (account) => account.enabled && (!account.monthlyBudgetLimit || account.monthlyBudgetLimit <= 0)
      ),
    [accountBudgetsState]
  );

  const accountUsageList = budgetUsage?.accountUsages ?? [];

  // 실제 연동된 클라우드 계정이 하나라도 있는지 여부
  const hasLinkedCloudAccounts =
    (awsAccounts?.length ?? 0) +
      (azureAccounts?.length ?? 0) +
      (gcpAccounts?.length ?? 0) +
      (ncpAccounts?.length ?? 0) >
    0;

  const combinedAccountList = useMemo(() => {
    const missingAccounts = Object.values(accountBudgetsState).filter(
      (state) => !accountUsageList.some((usage) => usage.provider === state.provider && usage.accountId === state.accountId)
    );

    const fallbackAccounts: AccountBudgetUsage[] = missingAccounts.map((state) => ({
      provider: state.provider,
      accountId: state.accountId,
      accountName: state.accountName,
      currentMonthCost: 0,
      monthlyBudgetLimit: state.monthlyBudgetLimit,
      alertThreshold: state.alertThreshold,
      usagePercentage: 0,
      thresholdReached: false,
      hasBudget: state.enabled,
    }));

    return [...accountUsageList, ...fallbackAccounts].sort((a, b) => {
      const providerDiff = a.provider.localeCompare(b.provider);
      if (providerDiff !== 0) {
        return providerDiff;
      }
      const nameA = a.accountName ?? '';
      const nameB = b.accountName ?? '';
      return nameA.localeCompare(nameB);
    });
  }, [accountBudgetsState, accountUsageList]);

  // 계정별 예산 탭에서 사용할 계정 존재 여부
  // - 예산/사용량 정보가 없어도, 계정이 한 개라도 연동되어 있으면 "계정 있음"으로 간주
  const hasAccounts = combinedAccountList.length > 0 || hasLinkedCloudAccounts;
  const isBudgetSectionLoading = isBudgetLoading || isBudgetUsageLoading;
  const isSlackSectionLoading = isSlackSettingsLoading || slackSettingsMutation.isPending;
  const consolidatedUsagePercentage = budgetUsage?.usagePercentage ?? 0;
  const globalThresholdReached = Boolean(budgetUsage?.thresholdReached);
  const totalMonthCost = budgetUsage?.currentMonthCost ?? 0;
  const budgetMonth = budgetUsage?.month;
  const budgetCurrency = budgetUsage?.currency ?? 'KRW';
  const isSaveDisabled = budgetMutation.isPending || isBudgetSectionLoading || invalidAccounts.length > 0;

  const handleToggle = (section: keyof SettingsState, key: string) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: !prev[section][key as keyof typeof prev[typeof section]],
      },
    }));
  };

  const handleSelectChange = (section: 'preferences', key: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  const handleSave = () => {
    // TODO: API 호출로 설정 저장
  };

  const handleDeleteAccount = async () => {
    if (isDeletingAccount) return;

    const confirmed = window.confirm(
      '정말로 회원 탈퇴를 진행하시겠습니까?\n모든 클라우드 연동 정보와 결제/빌링 데이터가 삭제되며 이 작업은 되돌릴 수 없습니다.'
    );
    if (!confirmed) return;

    setIsDeletingAccount(true);
    try {
      await deleteCurrentUser();
      await logout();
      alert('회원 탈퇴가 완료되었습니다. 지금까지 이용해 주셔서 감사합니다.');
      router.push('/');
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        '회원 탈퇴 처리 중 문제가 발생했습니다.';
      alert(message);
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const handleAccountToggle = (key: string, enabled: boolean) => {
    setAccountBudgetsState((prev) => {
      if (!prev[key]) {
        return prev;
      }
      return {
        ...prev,
        [key]: {
          ...prev[key],
          enabled,
        },
      };
    });
  };

  const handleAccountValueChange = (key: string, field: 'monthlyBudgetLimit' | 'alertThreshold', value: number) => {
    const sanitizedValue = Number.isNaN(value) ? 0 : value;
    setAccountBudgetsState((prev) => {
      if (!prev[key]) {
        return prev;
      }
      return {
        ...prev,
        [key]: {
          ...prev[key],
          [field]: sanitizedValue,
        },
      };
    });
  };

  const handleBudgetSave = () => {
    const parsedBudget = Number(budgetAmountInput);
    if (!budgetAmountInput || Number.isNaN(parsedBudget) || parsedBudget <= 0) {
      alert('예산 한도를 0보다 큰 값으로 입력해주세요.');
      return;
    }

    if (invalidAccounts.length > 0) {
      alert('활성화된 계정별 예산의 월 예산 값은 0보다 커야 합니다.');
      return;
    }

    budgetMutation.mutate({
      mode: budgetMode,
      monthlyBudgetLimit: Math.round(parsedBudget),
      alertThreshold,
      accountBudgets: Object.values(accountBudgetsState)
        .filter((account) => account.enabled && account.monthlyBudgetLimit > 0)
        .map((account) => ({
          provider: account.provider,
          accountId: account.accountId,
          monthlyBudgetLimit: Math.round(account.monthlyBudgetLimit),
          alertThreshold: account.alertThreshold,
        })),
    });
  };

  const handleSlackSave = () => {
    if (slackEnabled && !slackWebhookInput.trim()) {
      alert('Slack Webhook URL을 입력해주세요.');
      return;
    }

    slackSettingsMutation.mutate({
      enabled: slackEnabled,
      webhookUrl: slackEnabled ? slackWebhookInput.trim() : null,
    });
  };

  const renderAccountRow = (account: AccountBudgetUsage) => {
    const key = buildAccountKey(account.provider, account.accountId);
    const state = accountBudgetsState[key];
    const enabled = state?.enabled ?? false;
    const limit = state?.monthlyBudgetLimit ?? 0;
    const threshold = state?.alertThreshold ?? alertThreshold;
    const accountName = state?.accountName ?? account.accountName ?? `${account.provider} #${account.accountId}`;
    const exceedsLimit = enabled && limit > 0 && account.currentMonthCost > limit;

    return (
      <div
        key={key}
        className="grid grid-cols-1 gap-4 border-b border-gray-100 py-4 last:border-b-0 md:grid-cols-[180px_1fr_1fr_180px_180px]"
      >
        <div className="space-y-1">
          <Badge variant="outline" className={cn('w-fit capitalize', PROVIDER_BADGE_COLORS[account.provider])}>
            {account.provider}
          </Badge>
          <p className="text-sm font-semibold text-gray-900">{accountName}</p>
          <p className="text-xs text-gray-500">ID: {account.accountId}</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>이번 달 비용</span>
            <span className={cn('font-medium', exceedsLimit && 'text-red-600')}>
              {formatCurrency(account.currentMonthCost, 'KRW')}
            </span>
          </div>
          <Progress value={Math.min(account.usagePercentage ?? 0, 100)} className="h-2" />
          <p className="text-xs text-gray-500">
            사용률 {account.usagePercentage?.toFixed(1) ?? 0}%{' '}
            {account.monthlyBudgetLimit ? `· 예산 ${formatCurrency(account.monthlyBudgetLimit ?? 0, 'KRW')}` : ''}
          </p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">계정별 예산 사용</span>
            <Toggle
              checked={enabled}
              onChange={(checked) => handleAccountToggle(key, checked)}
              disabled={budgetMutation.isPending}
            />
          </div>
          <p className="text-xs text-gray-500">비활성화 시 통합 예산이 적용됩니다.</p>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">월 예산 (KRW)</label>
          <Input
            type="number"
            min={0}
            disabled={!enabled || budgetMutation.isPending}
            value={enabled ? String(limit) : ''}
            onChange={(e) => handleAccountValueChange(key, 'monthlyBudgetLimit', Number(e.target.value))}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">임계값 (%)</label>
          <Input
            type="number"
            min={0}
            max={100}
            disabled={!enabled || budgetMutation.isPending}
            value={enabled ? String(threshold) : ''}
            onChange={(e) => handleAccountValueChange(key, 'alertThreshold', Number(e.target.value))}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8">
      <div className={MOBILE_HEADER_LAYOUT}>
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">설정</h2>
          <p className={`${MOBILE_RESPONSIVE_TEXT} text-gray-600 mt-1`}>애플리케이션 설정을 관리하세요</p>
        </div>
        <Button
          onClick={handleSave}
          className={`bg-blue-600 hover:bg-blue-700 text-white ${MOBILE_RESPONSIVE_BUTTON}`}
        >
          변경사항 저장
        </Button>
      </div>

      <div className="space-y-6">
        {/* 통합/계정별 예산 설정 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-gray-700" />
              예산 관리
            </CardTitle>
            <CardDescription>통합 예산과 계정별 한도를 한 곳에서 설정하세요.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isBudgetSectionLoading ? (
              <div className="space-y-4">
                <div className="h-24 rounded-lg border border-dashed border-gray-200 bg-gray-50 animate-pulse" />
                <div className="h-40 rounded-lg border border-dashed border-gray-200 bg-gray-50 animate-pulse" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <Badge variant={globalThresholdReached ? 'destructive' : 'outline'}>
                    {globalThresholdReached ? '임계값 초과' : '안정 상태'}
                  </Badge>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <SummaryTile
                    label="이번 달 총 비용"
                    value={formatCurrency(totalMonthCost, budgetCurrency)}
                    caption={budgetMonth}
                  />
                  <SummaryTile label="설정된 월 예산" value={formatCurrency(budgetAmount, 'KRW')} caption="통합 한도" />
                  <SummaryTile
                    label="사용률"
                    value={`${consolidatedUsagePercentage.toFixed(1)}%`}
                    caption={`임계값 ${alertThreshold}%`}
                  />
                </div>
                <div className="space-y-2">
                  <Progress value={Math.min(consolidatedUsagePercentage, 100)} className="h-3" />
                  <p className="text-xs text-gray-500">
                    통합 예산은 모든 계정에 기본으로 적용되며, 계정별 예산을 설정하지 않은 경우 이 한도가 사용됩니다.
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">월 통합 예산 (KRW)</label>
                    <Input
                      type="number"
                      min={0}
                      inputMode="numeric"
                      value={budgetAmountInput}
                      onChange={(e) => setBudgetAmountInput(e.target.value)}
                      disabled={budgetMutation.isPending}
                      className="appearance-none"
                    />
                    <p className="text-xs text-gray-500">현재 값: {formatCurrency(budgetAmount, 'KRW')}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">알림 임계값 ({alertThreshold}%)</label>
                      <span className="text-xs text-gray-500">0% ~ 100%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={alertThreshold}
                      onChange={(e) => setAlertThreshold(Number(e.target.value))}
                      disabled={budgetMutation.isPending}
                      className="w-full accent-blue-600"
                    />
                    <p className="text-xs text-gray-500">설정한 비율만큼 예산을 소진하면 즉시 알림을 보내드립니다.</p>
                  </div>
                </div>
                <Tabs value={budgetMode} onValueChange={(value) => setBudgetMode(value as BudgetMode)}>
                  <TabsList>
                    <TabsTrigger value="CONSOLIDATED">통합 예산</TabsTrigger>
                    <TabsTrigger value="ACCOUNT_SPECIFIC">계정별 예산</TabsTrigger>
                  </TabsList>
                  <TabsContent
                    value="CONSOLIDATED"
                    className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900"
                  >
                    통합 예산 모드에서는 모든 계정이 동일한 한도와 임계값을 공유합니다.
                  </TabsContent>
                  <TabsContent value="ACCOUNT_SPECIFIC" className="space-y-4">
                    <div className="rounded-lg border border-amber-100 bg-amber-50 p-4 text-sm text-amber-900">
                      계정별 예산을 활성화하면 켜 둔 계정부터 별도의 예산과 임계값을 사용합니다. 설정하지 않은 계정은
                      통합 예산을 따릅니다.
                    </div>
                    {hasAccounts ? (
                      <div className="rounded-lg border border-gray-200">
                        <div className="hidden border-b border-gray-100 px-4 py-3 text-xs font-semibold text-gray-500 md:grid md:grid-cols-[180px_1fr_1fr_180px_180px]">
                          <span>계정</span>
                          <span>이번 달 비용</span>
                          <span>계정별 예산</span>
                          <span>월 예산 입력</span>
                          <span>임계값 (%)</span>
                        </div>
                        <div>{combinedAccountList.map((account) => renderAccountRow(account))}</div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 rounded-lg border border-dashed border-gray-200 p-6 text-gray-500">
                        <ShieldCheck className="h-5 w-5" />
                        클라우드 계정을 먼저 연동하면 계정별 예산을 설정할 수 있습니다.
                      </div>
                    )}
                    {invalidAccounts.length > 0 && (
                      <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        <AlertCircle className="h-4 w-4" />
                        활성화된 계정별 예산의 월 예산 값은 0보다 커야 합니다.
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
                <div className="flex flex-col gap-3 border-t border-gray-100 pt-4 md:flex-row md:items-center md:justify-between">
                  <p className="text-sm text-gray-600">
                    저장 시 모드 전환, 통합 예산, 계정별 예산 설정이 한 번에 반영됩니다.
                  </p>
                  <Button
                    onClick={handleBudgetSave}
                    disabled={isSaveDisabled}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {budgetMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        저장 중...
                      </>
                    ) : (
                      '예산 설정 저장'
                    )}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* 알림 설정 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-gray-700" />
              알림 설정
            </CardTitle>
            <CardDescription>
              앱 내 알림 및 푸시 알림을 관리합니다
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className={MOBILE_TOGGLE_LAYOUT}>
              <div className="flex-1 min-w-0">
                <p className={`font-medium text-gray-900 ${MOBILE_RESPONSIVE_TEXT}`}>예산 알림</p>
                <p className="text-xs md:text-sm text-gray-600">예산 임계값 도달 시 알림</p>
              </div>
              <Toggle
                checked={settings.notifications.budgetAlerts}
                onChange={() => handleToggle('notifications', 'budgetAlerts')}
              />
            </div>

            <div className={MOBILE_TOGGLE_LAYOUT}>
              <div className="flex-1 min-w-0">
                <p className={`font-medium text-gray-900 ${MOBILE_RESPONSIVE_TEXT}`}>이상징후 탐지</p>
                <p className="text-xs md:text-sm text-gray-600">비정상적인 지출 패턴 감지 시 알림</p>
              </div>
              <Toggle
                checked={settings.notifications.anomalyDetection}
                onChange={() => handleToggle('notifications', 'anomalyDetection')}
              />
            </div>

            <div className={MOBILE_TOGGLE_LAYOUT}>
              <div className="flex-1 min-w-0">
                <p className={`font-medium text-gray-900 ${MOBILE_RESPONSIVE_TEXT}`}>Slack 알림</p>
                <p className="text-xs md:text-sm text-gray-600">리소스 상태 및 임계값 초과 시 Slack으로 알림 전송</p>
              </div>
              <Toggle
                checked={slackEnabled}
                onChange={(checked) => setSlackEnabled(checked)}
                disabled={isSlackSectionLoading}
              />
            </div>
            <div className="space-y-2 rounded-lg border border-gray-100 bg-gray-50/50 p-4">
              <label className="text-xs font-medium text-gray-700">Slack Webhook URL</label>
              <Input
                type="url"
                placeholder="https://hooks.slack.com/services/..."
                value={slackWebhookInput}
                onChange={(e) => setSlackWebhookInput(e.target.value)}
                disabled={!slackEnabled || isSlackSectionLoading}
              />
              <p className="text-xs text-gray-500">
                Slack에서 발급한 Incoming Webhook URL을 입력하면 임계치 초과 시 채널로 바로 알림을 받아볼 수 있습니다.
              </p>
              <div className="flex flex-col gap-2 pt-2 text-xs text-gray-500 md:flex-row md:items-center md:justify-between">
                <span>{slackEnabled ? '슬랙 알림이 활성화되어 있습니다.' : '슬랙 알림을 사용하려면 토글을 켜주세요.'}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSlackSave}
                  disabled={
                    isSlackSectionLoading || (slackEnabled && !slackWebhookInput.trim())
                  }
                  className="md:w-auto"
                >
                  {slackSettingsMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      저장 중...
                    </>
                  ) : (
                    'Slack 설정 저장'
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 환경 설정 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-gray-700" />
              환경 설정
            </CardTitle>
            <CardDescription>
              언어, 통화, 시간대 등을 설정합니다
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                언어
              </label>
              <select
                value={settings.preferences.language}
                onChange={(e) => handleSelectChange('preferences', 'language', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ko">한국어</option>
                <option value="en">English</option>
                <option value="ja">日本語</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                통화
              </label>
              <select
                value={settings.preferences.currency}
                onChange={(e) => handleSelectChange('preferences', 'currency', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="KRW">KRW (₩)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="JPY">JPY (¥)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                시간대
              </label>
              <select
                value={settings.preferences.timezone}
                onChange={(e) => handleSelectChange('preferences', 'timezone', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Asia/Seoul">서울 (UTC+9)</option>
                <option value="America/New_York">뉴욕 (UTC-5)</option>
                <option value="Europe/London">런던 (UTC+0)</option>
                <option value="Asia/Tokyo">도쿄 (UTC+9)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                <div className="flex items-center gap-2">
                  <Moon className="h-4 w-4" />
                  테마
                </div>
              </label>
              <select
                value={settings.preferences.theme}
                onChange={(e) => handleSelectChange('preferences', 'theme', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="light">라이트</option>
                <option value="dark">다크</option>
                <option value="auto">시스템 설정</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* 보안 및 개인정보 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-gray-700" />
              보안 및 개인정보
            </CardTitle>
            <CardDescription>
              계정 보안 및 개인정보 설정을 관리합니다
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">2단계 인증</p>
                <p className="text-sm text-gray-600">추가 보안 계층 활성화</p>
              </div>
              <Toggle
                checked={settings.privacy.twoFactorAuth}
                onChange={() => handleToggle('privacy', 'twoFactorAuth')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">데이터 공유</p>
                <p className="text-sm text-gray-600">제품 개선을 위한 익명 데이터 공유</p>
              </div>
              <Toggle
                checked={settings.privacy.dataSharing}
                onChange={() => handleToggle('privacy', 'dataSharing')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">사용 분석</p>
                <p className="text-sm text-gray-600">앱 사용 통계 수집</p>
              </div>
              <Toggle
                checked={settings.privacy.analytics}
                onChange={() => handleToggle('privacy', 'analytics')}
              />
            </div>

            <div className="pt-4 border-t border-gray-200 flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                className="border-gray-300 text-gray-700"
              >
                비밀번호 변경
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={isDeletingAccount}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeletingAccount ? '탈퇴 처리 중...' : '회원 탈퇴'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SummaryTile({ label, value, caption }: { label: string; value: string; caption?: string }) {
  return (
    <div className="rounded-lg border border-gray-100 p-4 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-gray-900">{value}</p>
      {caption && <p className="text-xs text-gray-500">{caption}</p>}
    </div>
  );
}

function buildAccountKey(provider: CloudProvider, accountId: number | string) {
  return `${provider}:${accountId}`;
}