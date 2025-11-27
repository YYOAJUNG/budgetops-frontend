'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, Loader2, PiggyBank, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Toggle } from '@/components/ui/toggle';
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

type AccountBudgetFormState = {
  provider: CloudProvider;
  accountId: number;
  accountName: string;
  enabled: boolean;
  monthlyBudgetLimit: number;
  alertThreshold: number;
};

const PROVIDER_LABELS: Record<CloudProvider, string> = {
  AWS: 'AWS',
  AZURE: 'Azure',
  GCP: 'GCP',
  NCP: 'NCP',
};

const PROVIDER_BADGE_COLORS: Record<CloudProvider, string> = {
  AWS: 'bg-orange-50 text-orange-700 border-orange-200',
  AZURE: 'bg-blue-50 text-blue-700 border-blue-200',
  GCP: 'bg-green-50 text-green-700 border-green-200',
  NCP: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const DEFAULT_THRESHOLD = 80;

export function Budgets() {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<BudgetMode>('CONSOLIDATED');
  const [monthlyBudgetInput, setMonthlyBudgetInput] = useState('');
  const [alertThreshold, setAlertThreshold] = useState(DEFAULT_THRESHOLD);
  const [accountBudgetsState, setAccountBudgetsState] = useState<Record<string, AccountBudgetFormState>>({});

  const { data: budgetSettings, isLoading: isSettingsLoading } = useQuery({
    queryKey: ['budgetSettings'],
    queryFn: getBudgetSettings,
  });

  const { data: budgetUsage, isLoading: isUsageLoading } = useQuery({
    queryKey: ['budgetUsage'],
    queryFn: getBudgetUsage,
  });

  useEffect(() => {
    if (!budgetSettings) {
      return;
    }
    setMode(budgetSettings.mode ?? 'CONSOLIDATED');
    setMonthlyBudgetInput(
      budgetSettings.monthlyBudgetLimit !== undefined && budgetSettings.monthlyBudgetLimit !== null
        ? String(budgetSettings.monthlyBudgetLimit)
        : ''
    );
    setAlertThreshold(budgetSettings.alertThreshold ?? DEFAULT_THRESHOLD);
  }, [budgetSettings]);

  useEffect(() => {
    if (!budgetUsage) {
      return;
    }
    setAccountBudgetsState((prev) => {
      const next: Record<string, AccountBudgetFormState> = {};

      const registerAccount = (
        account: Pick<AccountBudgetUsage, 'provider' | 'accountId' | 'accountName'> & {
          currentLimit: number;
          currentThreshold: number;
          enabled: boolean;
        }
      ) => {
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

      (budgetUsage.accountUsages ?? []).forEach((usage) => {
        const setting = budgetSettings?.accountBudgets.find(
          (budget) => budget.provider === usage.provider && Number(budget.accountId) === usage.accountId
        );
        registerAccount({
          provider: usage.provider,
          accountId: usage.accountId,
          accountName: usage.accountName,
          currentLimit: setting
            ? setting.monthlyBudgetLimit
            : usage.monthlyBudgetLimit !== undefined && usage.monthlyBudgetLimit !== null
            ? usage.monthlyBudgetLimit
            : 0,
          currentThreshold: setting?.alertThreshold ?? budgetSettings?.alertThreshold ?? DEFAULT_THRESHOLD,
          enabled: Boolean(setting) || Boolean(usage.hasBudget),
        });
      });

      (budgetSettings?.accountBudgets ?? []).forEach((setting) => {
        const key = buildAccountKey(setting.provider, setting.accountId);
        if (!next[key]) {
          next[key] = {
            provider: setting.provider,
            accountId: Number(setting.accountId),
            accountName: setting.accountName ?? `${setting.provider} #${setting.accountId}`,
            enabled: true,
            monthlyBudgetLimit: setting.monthlyBudgetLimit,
            alertThreshold: setting.alertThreshold ?? budgetSettings?.alertThreshold ?? DEFAULT_THRESHOLD,
          };
        }
      });

      return next;
    });
  }, [budgetUsage, budgetSettings]);

  const mutation = useMutation({
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
        error?.message ||
        '예산 설정 저장 중 오류가 발생했습니다.';
      alert(message);
    },
  });

  const consolidatedUsagePercentage = budgetUsage?.usagePercentage ?? 0;
  const globalThresholdReached = Boolean(budgetUsage?.thresholdReached);

  const invalidAccounts = useMemo(
    () =>
      Object.values(accountBudgetsState).filter(
        (account) => account.enabled && (!account.monthlyBudgetLimit || account.monthlyBudgetLimit <= 0)
      ),
    [accountBudgetsState]
  );

  const handleAccountToggle = (key: string, enabled: boolean) => {
    setAccountBudgetsState((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        enabled,
      },
    }));
  };

  const handleAccountValueChange = (key: string, field: 'monthlyBudgetLimit' | 'alertThreshold', value: number) => {
    setAccountBudgetsState((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }));
  };

  const handleSave = () => {
    const parsedMonthlyBudget = Number(monthlyBudgetInput);
    if (Number.isNaN(parsedMonthlyBudget) || parsedMonthlyBudget <= 0) {
      alert('통합 예산 한도를 0보다 큰 값으로 입력해주세요.');
      return;
    }

    const payload = {
      mode,
      monthlyBudgetLimit: Math.round(parsedMonthlyBudget),
      alertThreshold,
      accountBudgets: Object.values(accountBudgetsState)
        .filter((account) => account.enabled && account.monthlyBudgetLimit > 0)
        .map((account) => ({
          provider: account.provider,
          accountId: account.accountId,
          monthlyBudgetLimit: Math.round(account.monthlyBudgetLimit),
          alertThreshold: account.alertThreshold,
        })),
    };

    mutation.mutate(payload);
  };

  const renderAccountRow = (account: AccountBudgetUsage) => {
    const key = buildAccountKey(account.provider, account.accountId);
    const state = accountBudgetsState[key];
    const enabled = state?.enabled ?? false;
    const limit = state?.monthlyBudgetLimit ?? 0;
    const threshold = state?.alertThreshold ?? DEFAULT_THRESHOLD;
    const exceedsLimit = account.monthlyBudgetLimit && account.currentMonthCost > (account.monthlyBudgetLimit ?? 0);

    return (
      <div
        key={key}
        className="grid grid-cols-1 md:grid-cols-[180px_1fr_1fr_180px_180px] gap-4 border-b border-gray-100 py-4 last:border-b-0"
      >
        <div className="space-y-1">
          <Badge
            variant="outline"
            className={cn('w-fit capitalize', PROVIDER_BADGE_COLORS[account.provider])}
          >
            {PROVIDER_LABELS[account.provider]}
          </Badge>
          <p className="text-sm font-semibold text-gray-900">{account.accountName}</p>
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
            {account.monthlyBudgetLimit ? `· 예산 ${formatCurrency(account.monthlyBudgetLimit, 'KRW')}` : ''}
          </p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">계정별 예산 사용</span>
            <Toggle
              checked={enabled}
              onChange={(checked) => handleAccountToggle(key, checked)}
            />
          </div>
          <p className="text-xs text-gray-500">
            비활성화 시 통합 예산이 적용됩니다.
          </p>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">월 예산 (KRW)</label>
          <Input
            type="number"
            min={0}
            disabled={!enabled || mutation.isPending}
            value={enabled ? limit : ''}
            onChange={(e) => handleAccountValueChange(key, 'monthlyBudgetLimit', Number(e.target.value))}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">임계값 (%)</label>
          <Input
            type="number"
            min={0}
            max={100}
            disabled={!enabled || mutation.isPending}
            value={enabled ? threshold : ''}
            onChange={(e) => handleAccountValueChange(key, 'alertThreshold', Number(e.target.value))}
          />
        </div>
      </div>
    );
  };

  const isLoading = isSettingsLoading || isUsageLoading;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">예산 관리</h2>
        <p className="text-muted-foreground">
          통합 예산을 기본으로 사용하면서 필요 시 계정별 한도를 세밀하게 설정하세요.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <PiggyBank className="h-5 w-5 text-blue-600" />
              통합 예산 요약
            </CardTitle>
            <CardDescription>모든 계정에 공통으로 적용되는 기본 예산입니다.</CardDescription>
          </div>
          {budgetUsage && (
            <Badge variant={globalThresholdReached ? 'destructive' : 'outline'}>
              {globalThresholdReached ? '임계값 초과' : '안정 상태'}
            </Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <SummaryTile
              label="이번 달 총 비용"
              value={formatCurrency(budgetUsage?.currentMonthCost ?? 0, budgetUsage?.currency ?? 'KRW')}
              caption={budgetUsage?.month}
            />
            <SummaryTile
              label="설정된 월 예산"
              value={formatCurrency(Number(monthlyBudgetInput || 0), 'KRW')}
              caption="통합 한도"
            />
            <SummaryTile
              label="사용률"
              value={`${consolidatedUsagePercentage.toFixed(1)}%`}
              caption={`임계값 ${alertThreshold}%`}
            />
          </div>

          <div className="space-y-3">
            <Progress value={Math.min(consolidatedUsagePercentage, 100)} className="h-3" />
            <p className="text-xs text-gray-500">
              통합 예산은 모든 계정에 기본으로 적용되며, 계정별 예산을 설정하지 않은 경우 이 한도가 사용됩니다.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-700">월 통합 예산 (KRW)</label>
              <Input
                type="number"
                min={0}
                inputMode="numeric"
                disabled={mutation.isPending || isLoading}
                value={monthlyBudgetInput}
                onChange={(e) => setMonthlyBudgetInput(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">알림 임계값 (%)</label>
              <Input
                type="number"
                min={0}
                max={100}
                disabled={mutation.isPending || isLoading}
                value={alertThreshold}
                onChange={(e) => setAlertThreshold(Number(e.target.value))}
                className="mt-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>예산 모드 선택</CardTitle>
          <CardDescription>
            통합 예산만 사용할지, 계정별 예산을 활성화할지 선택하세요. 모드 변경은 저장 시 적용됩니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={mode} onValueChange={(value) => setMode(value as BudgetMode)}>
            <TabsList>
              <TabsTrigger value="CONSOLIDATED">통합 예산</TabsTrigger>
              <TabsTrigger value="ACCOUNT_SPECIFIC">계정별 예산</TabsTrigger>
            </TabsList>
            <TabsContent value="CONSOLIDATED" className="space-y-4">
              <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
                통합 예산 모드에서는 모든 계정이 위에서 설정한 기본 예산과 임계값을 공유합니다. 계정별 알림은
                비활성화됩니다.
              </div>
            </TabsContent>
            <TabsContent value="ACCOUNT_SPECIFIC" className="space-y-4">
              <div className="rounded-lg border border-amber-100 bg-amber-50 p-4 text-sm text-amber-900">
                계정별 예산을 활성화하면 켜둔 계정부터 별도의 예산과 임계값을 사용합니다. 설정하지 않은 계정은
                통합 예산을 계속 따릅니다.
              </div>

              {isLoading ? (
                <div className="flex items-center gap-3 rounded-lg border border-dashed border-gray-200 p-6 text-gray-500">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  계정 정보를 불러오는 중입니다...
                </div>
              ) : (budgetUsage?.accountUsages?.length ?? 0) > 0 ? (
                <div className="rounded-lg border border-gray-200">
                  <div className="hidden border-b border-gray-100 px-4 py-3 text-xs font-semibold text-gray-500 md:grid md:grid-cols-[180px_1fr_1fr_180px_180px]">
                    <span>계정</span>
                    <span>이번 달 비용</span>
                    <span>계정별 예산</span>
                    <span>월 예산 입력</span>
                    <span>임계값 (%)</span>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {budgetUsage?.accountUsages?.map((account) => renderAccountRow(account))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-lg border border-dashed border-gray-200 p-6 text-gray-500">
                  <ShieldCheck className="h-5 w-5" />
                  연결된 계정이 없습니다. 마이페이지에서 먼저 클라우드 계정을 연동해주세요.
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

          <div className="mt-6 flex flex-col gap-3 border-t border-gray-100 pt-4 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-gray-600">
              저장 시 모드 전환, 통합 예산, 계정별 예산 설정이 한 번에 반영됩니다.
            </p>
            <Button
              onClick={handleSave}
              disabled={mutation.isPending || isLoading}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              예산 설정 저장
            </Button>
          </div>
        </CardContent>
      </Card>
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
