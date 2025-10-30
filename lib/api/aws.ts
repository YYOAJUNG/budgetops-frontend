import { api } from './client';

export interface CreateAwsAccountRequest {
  name: string;
  defaultRegion: string;
  accessKeyId: string;
  secretAccessKey: string;
}

export interface AwsAccountSummary {
  id: number;
  name: string;
  defaultRegion: string;
  accessKeyId: string;
  secretKeyLast4: string;
  active: boolean;
}

export interface AwsResourceItem {
  id: number;
  resourceId: string;
  resourceType: string;
  resourceName: string;
  region: string;
  status: string;
  description: string;
  awsAccountId: number;
}

export async function createAwsAccount(payload: CreateAwsAccountRequest): Promise<AwsAccountSummary> {
  return (await api.post('/aws/accounts', payload)).data;
}

export async function getAwsAccounts(): Promise<AwsAccountSummary[]> {
  return (await api.get('/aws/accounts')).data;
}

export async function getAwsAccountInfo(accountId: number): Promise<AwsAccountSummary> {
  return (await api.get(`/aws/accounts/${accountId}/info`)).data;
}

export async function getAwsResourcesByAccount(accountId: number): Promise<AwsResourceItem[]> {
  return (await api.get(`/aws/accounts/${accountId}/resources`)).data;
}

export async function getAwsResourcesByType(resourceType: string): Promise<AwsResourceItem[]> {
  return (await api.get('/aws/resources', { params: { resourceType } })).data;
}

export async function getAwsResourcesByAccountAndType(accountId: number, resourceType: string): Promise<AwsResourceItem[]> {
  return (await api.get(`/aws/accounts/${accountId}/resources/${resourceType}`)).data;
}


