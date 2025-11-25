import { api } from './client';

export interface BudgetSettings {
  monthlyBudgetLimit: number;
  alertThreshold: number;
  updatedAt?: string;
}

export interface BudgetUsage {
  monthlyBudgetLimit: number;
  alertThreshold: number;
  currentMonthCost: number;
  usagePercentage: number;
  thresholdReached: boolean;
  month: string;
  currency: 'KRW' | 'USD';
}

export interface BudgetAlert {
  budgetLimit: number;
  currentMonthCost: number;
  usagePercentage: number;
  threshold: number;
  month: string;
  currency: 'KRW' | 'USD';
  triggeredAt: string;
  message: string;
}

export async function getBudgetSettings(): Promise<BudgetSettings> {
  const { data } = await api.get('/budgets/me/settings');
  return {
    monthlyBudgetLimit: data.monthlyBudgetLimit ?? 0,
    alertThreshold: data.alertThreshold ?? 0,
    updatedAt: data.updatedAt,
  };
}

export async function updateBudgetSettings(payload: {
  monthlyBudgetLimit: number;
  alertThreshold: number;
}): Promise<BudgetSettings> {
  const { data } = await api.put('/budgets/me/settings', payload);
  return {
    monthlyBudgetLimit: data.monthlyBudgetLimit ?? 0,
    alertThreshold: data.alertThreshold ?? 0,
    updatedAt: data.updatedAt,
  };
}

export async function getBudgetUsage(): Promise<BudgetUsage> {
  const { data } = await api.get('/budgets/me/usage');
  return {
    monthlyBudgetLimit: data.monthlyBudgetLimit ?? 0,
    alertThreshold: data.alertThreshold ?? 0,
    currentMonthCost: data.currentMonthCost ?? 0,
    usagePercentage: data.usagePercentage ?? 0,
    thresholdReached: data.thresholdReached ?? false,
    month: data.month,
    currency: data.currency ?? 'KRW',
  };
}

export async function checkBudgetAlerts(): Promise<BudgetAlert[]> {
  const { data } = await api.post('/budgets/alerts/check');
  return Array.isArray(data) ? data : [];
}

