import { api } from './client';

export interface AzureAccount {
  id: number;
  name: string;
  subscriptionId: string;
  tenantId: string;
  clientId: string;
  clientSecretLast4: string;
  active: boolean;
  hasCredit?: boolean;
  creditLimitAmount?: number;
  creditCurrency?: string;
  creditStartDate?: string;
  creditEndDate?: string;
}

export interface CreateAzureAccountRequest {
  name: string;
  subscriptionId: string;
  tenantId: string;
  clientId: string;
  clientSecret: string;
  hasCredit?: boolean;
  creditLimitAmount?: number;
}

export interface AzureVirtualMachine {
  id: string;
  name: string;
  resourceGroup: string;
  location: string;
  vmSize: string;
  provisioningState: string;
  powerState: string;
  osType: string;
  computerName: string;
  privateIp: string;
  publicIp: string;
  availabilityZone: string;
  timeCreated: string;
}

export interface AzureMetricPoint {
  timestamp: string;
  value: number | null;
  unit: string;
}

export interface AzureVmMetrics {
  vmName: string;
  resourceGroup: string;
  cpuUtilization: AzureMetricPoint[];
  networkIn: AzureMetricPoint[];
  networkOut: AzureMetricPoint[];
  memoryUtilization: AzureMetricPoint[];
}

export interface AzureDailyCost {
  accountId: number;
  date: string;
  amount: number;
  currency: string;
}

export interface AzureMonthlyCost {
  accountId: number;
  amount: number;
  currency: string;
}

export interface AzureAccountCost {
  accountId: number;
  accountName: string;
  amount: number;
  currency: string;
}

export interface AzureFreeTierUsage {
  usedAmount: number;
  creditLimitAmount: number;
  remainingAmount: number;
  percentage: number;
  currency: string;
  creditStartDate: string;
  creditEndDate: string;
}

export async function getAzureAccounts(): Promise<AzureAccount[]> {
  const { data } = await api.get<AzureAccount[]>('/azure/accounts');
  return data;
}

export async function createAzureAccount(payload: CreateAzureAccountRequest): Promise<AzureAccount> {
  const { data } = await api.post<AzureAccount>('/azure/accounts', payload);
  return data;
}

export async function deleteAzureAccount(accountId: number): Promise<void> {
  await api.delete(`/azure/accounts/${accountId}`);
}

export async function getAzureVirtualMachines(
  accountId: number,
  location?: string
): Promise<AzureVirtualMachine[]> {
  const params = location ? { location } : undefined;
  const { data } = await api.get<AzureVirtualMachine[]>(
    `/azure/accounts/${accountId}/virtual-machines`,
    { params }
  );
  return data;
}

export async function getAzureAccountCosts(
  accountId: number,
  startDate?: string,
  endDate?: string
): Promise<AzureDailyCost[]> {
  const params: Record<string, string> = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  const { data } = await api.get<AzureDailyCost[]>(
    `/azure/accounts/${accountId}/costs`,
    { params }
  );
  return data;
}

export async function getAzureAccountFreeTierUsage(
  accountId: number,
  startDate?: string,
  endDate?: string
): Promise<AzureFreeTierUsage> {
  const params: Record<string, string> = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  const { data } = await api.get<AzureFreeTierUsage>(
    `/azure/accounts/${accountId}/freetier/usage`,
    { params }
  );
  return data;
}

export async function getAzureAccountMonthlyCost(
  accountId: number,
  year: number,
  month: number
): Promise<AzureMonthlyCost> {
  const { data } = await api.get<AzureMonthlyCost>(
    `/azure/accounts/${accountId}/costs/monthly`,
    { params: { year, month } }
  );
  return data;
}

export async function getAllAzureAccountsCosts(
  startDate?: string,
  endDate?: string
): Promise<AzureAccountCost[]> {
  const params: Record<string, string> = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  const { data } = await api.get<AzureAccountCost[]>(
    '/azure/accounts/costs',
    { params }
  );
  return data;
}

export async function getAzureVmMetrics(
  accountId: number,
  vmName: string,
  resourceGroup: string,
  hours?: number
): Promise<AzureVmMetrics> {
  if (!resourceGroup || resourceGroup.trim() === '') {
    throw new Error('Resource group is required for Azure VM metrics');
  }
  const params: Record<string, string | number> = { resourceGroup: resourceGroup.trim() };
  if (hours) {
    params.hours = hours;
  }
  const encodedVmName = encodeURIComponent(vmName);
  const { data } = await api.get<AzureVmMetrics>(
    `/azure/accounts/${accountId}/virtual-machines/${encodedVmName}/metrics`,
    { params }
  );
  return data;
}

export async function startAzureVirtualMachine(
  accountId: number,
  vmName: string,
  resourceGroup: string
): Promise<void> {
  const params = { resourceGroup };
  await api.post(
    `/azure/accounts/${accountId}/virtual-machines/${encodeURIComponent(vmName)}/start`,
    null,
    { params }
  );
}

export async function stopAzureVirtualMachine(
  accountId: number,
  vmName: string,
  resourceGroup: string,
  skipShutdown?: boolean
): Promise<void> {
  const params: Record<string, string> = { resourceGroup };
  if (skipShutdown) {
    params.skipShutdown = 'true';
  }
  await api.post(
    `/azure/accounts/${accountId}/virtual-machines/${encodeURIComponent(vmName)}/stop`,
    null,
    { params }
  );
}

export async function deleteAzureVirtualMachine(
  accountId: number,
  vmName: string,
  resourceGroup: string
): Promise<void> {
  const params = { resourceGroup: resourceGroup.trim() };
  await api.delete(
    `/azure/accounts/${accountId}/virtual-machines/${encodeURIComponent(vmName)}`,
    { params }
  );
}

/**
 * Azure 알림 인터페이스
 */
export interface AzureAlert {
  id?: number;
  accountId: number;
  accountName: string;
  resourceId: string;
  resourceName: string;
  ruleId: string;
  ruleTitle: string;
  violatedMetric: string;
  currentValue: number | null;
  threshold: number | null;
  message: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  status: 'PENDING' | 'SENT' | 'ACKNOWLEDGED';
  createdAt: string;
  sentAt?: string;
  acknowledgedAt?: string;
}

/**
 * 모든 Azure 계정의 알림 점검 실행
 */
export async function checkAzureAlerts(): Promise<AzureAlert[]> {
  const { data } = await api.post<AzureAlert[]>('/azure/alerts/check');
  return data;
}

/**
 * 특정 Azure 계정의 알림 점검 실행
 */
export async function checkAzureAlertsByAccount(accountId: number): Promise<AzureAlert[]> {
  const { data } = await api.post<AzureAlert[]>(`/azure/alerts/check/${accountId}`);
  return data;
}
