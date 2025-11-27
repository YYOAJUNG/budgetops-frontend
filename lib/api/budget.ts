import { api } from './client';

export type BudgetMode = 'CONSOLIDATED' | 'ACCOUNT_SPECIFIC';
export type CloudProvider = 'AWS' | 'AZURE' | 'GCP' | 'NCP';

export interface AccountBudgetSetting {
  provider: CloudProvider;
  accountId: number;
  accountName: string;
  monthlyBudgetLimit: number;
  alertThreshold?: number | null;
}

export interface AccountBudgetUsage {
  provider: CloudProvider;
  accountId: number;
  accountName: string;
  currentMonthCost: number;
  monthlyBudgetLimit?: number | null;
  alertThreshold?: number | null;
  usagePercentage: number;
  thresholdReached: boolean;
  hasBudget: boolean;
}

export interface BudgetSettings {
  mode: BudgetMode;
  monthlyBudgetLimit: number;
  alertThreshold: number;
  updatedAt?: string;
  accountBudgets: AccountBudgetSetting[];
}

export interface BudgetUsage {
  mode: BudgetMode;
  monthlyBudgetLimit: number;
  alertThreshold: number;
  currentMonthCost: number;
  usagePercentage: number;
  thresholdReached: boolean;
  month: string;
  currency: 'KRW' | 'USD';
  accountUsages: AccountBudgetUsage[];
}

export interface BudgetAlert {
  mode: BudgetMode;
  provider?: CloudProvider | null;
  accountId?: number | null;
  accountName?: string | null;
  budgetLimit: number;
  currentMonthCost: number;
  usagePercentage: number;
  threshold: number;
  month: string;
  currency: 'KRW' | 'USD';
  triggeredAt: string;
  message: string;
}

export interface UpdateBudgetSettingsPayload {
  mode: BudgetMode;
  monthlyBudgetLimit: number;
  alertThreshold: number;
  accountBudgets?: Array<{
    provider: CloudProvider;
    accountId: number;
    monthlyBudgetLimit: number;
    alertThreshold?: number;
  }>;
}

export async function getBudgetSettings(): Promise<BudgetSettings> {
  const { data } = await api.get('/budgets/me/settings');
  const accountBudgets: AccountBudgetSetting[] = Array.isArray(data.accountBudgets)
    ? data.accountBudgets.map((budget: any) => ({
        provider: budget.provider,
        accountId: Number(budget.accountId),
        accountName: budget.accountName ?? `${budget.provider} #${budget.accountId}`,
        monthlyBudgetLimit: Number(budget.monthlyBudgetLimit ?? 0),
        alertThreshold: budget.alertThreshold ?? null,
      }))
    : [];

  return {
    mode: data.mode ?? 'CONSOLIDATED',
    monthlyBudgetLimit: Number(data.monthlyBudgetLimit ?? 0),
    alertThreshold: data.alertThreshold ?? 0,
    updatedAt: data.updatedAt,
    accountBudgets,
  };
}

export async function updateBudgetSettings(payload: UpdateBudgetSettingsPayload): Promise<BudgetSettings> {
  const normalizedPayload = {
    ...payload,
    accountBudgets: (payload.accountBudgets ?? []).map((budget) => ({
      ...budget,
      accountId: Number(budget.accountId),
    })),
  };
  const { data } = await api.put('/budgets/me/settings', normalizedPayload);
  return getBudgetSettingsFromResponse(data);
}

function getBudgetSettingsFromResponse(data: any): BudgetSettings {
  const accountBudgets: AccountBudgetSetting[] = Array.isArray(data.accountBudgets)
    ? data.accountBudgets.map((budget: any) => ({
        provider: budget.provider,
        accountId: Number(budget.accountId),
        accountName: budget.accountName ?? `${budget.provider} #${budget.accountId}`,
        monthlyBudgetLimit: Number(budget.monthlyBudgetLimit ?? 0),
        alertThreshold: budget.alertThreshold ?? null,
      }))
    : [];

  return {
    mode: data.mode ?? 'CONSOLIDATED',
    monthlyBudgetLimit: Number(data.monthlyBudgetLimit ?? 0),
    alertThreshold: data.alertThreshold ?? 0,
    updatedAt: data.updatedAt,
    accountBudgets,
  };
}

export async function getBudgetUsage(): Promise<BudgetUsage> {
  const { data } = await api.get('/budgets/me/usage');
  const accountUsages: AccountBudgetUsage[] = Array.isArray(data.accountUsages)
    ? data.accountUsages.map((usage: any) => ({
        provider: usage.provider,
        accountId: Number(usage.accountId),
        accountName: usage.accountName ?? `${usage.provider} #${usage.accountId}`,
        currentMonthCost: Number(usage.currentMonthCost ?? 0),
        monthlyBudgetLimit: usage.monthlyBudgetLimit !== undefined ? Number(usage.monthlyBudgetLimit ?? 0) : undefined,
        alertThreshold: usage.alertThreshold ?? null,
        usagePercentage: Number(usage.usagePercentage ?? 0),
        thresholdReached: Boolean(usage.thresholdReached),
        hasBudget: Boolean(usage.hasBudget),
      }))
    : [];

  return {
    mode: data.mode ?? 'CONSOLIDATED',
    monthlyBudgetLimit: Number(data.monthlyBudgetLimit ?? 0),
    alertThreshold: data.alertThreshold ?? 0,
    currentMonthCost: Number(data.currentMonthCost ?? 0),
    usagePercentage: Number(data.usagePercentage ?? 0),
    thresholdReached: Boolean(data.thresholdReached),
    month: data.month,
    currency: data.currency ?? 'KRW',
    accountUsages,
  };
}

export async function checkBudgetAlerts(): Promise<BudgetAlert[]> {
  const { data } = await api.post('/budgets/alerts/check');
  if (!Array.isArray(data)) return [];
  return data.map((alert: any) => ({
    mode: alert.mode ?? 'CONSOLIDATED',
    provider: alert.provider ?? null,
    accountId: alert.accountId !== undefined && alert.accountId !== null ? Number(alert.accountId) : null,
    accountName: alert.accountName ?? null,
    budgetLimit: Number(alert.budgetLimit ?? 0),
    currentMonthCost: Number(alert.currentMonthCost ?? 0),
    usagePercentage: Number(alert.usagePercentage ?? 0),
    threshold: Number(alert.threshold ?? 0),
    month: alert.month,
    currency: alert.currency ?? 'KRW',
    triggeredAt: alert.triggeredAt,
    message: alert.message,
  }));
}

