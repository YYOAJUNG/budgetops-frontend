import { api } from './client';

export interface AzureAccount {
  id: number;
  name: string;
  subscriptionId: string;
  tenantId: string;
  clientId: string;
  clientSecretLast4: string;
  active: boolean;
}

export interface CreateAzureAccountRequest {
  name: string;
  subscriptionId: string;
  tenantId: string;
  clientId: string;
  clientSecret: string;
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

