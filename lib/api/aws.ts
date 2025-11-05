import { api } from './client';

const isMock = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

let mockAccounts: AwsAccountSummary[] = [
  {
    id: 1,
    name: 'team-prod',
    defaultRegion: 'ap-northeast-2',
    accessKeyId: 'AKIA1234567890ABCD',
    secretKeyLast4: '****ABCD',
    active: true,
  },
  {
    id: 2,
    name: 'team-dev',
    defaultRegion: 'us-west-2',
    accessKeyId: 'AKIADEVACCOUNT000001',
    secretKeyLast4: '****0001',
    active: true,
  },
  {
    id: 3,
    name: 'team-sandbox',
    defaultRegion: 'eu-central-1',
    accessKeyId: 'AKIASANDBOX00000002',
    secretKeyLast4: '****0002',
    active: false,
  },
];

let mockResources: AwsResourceItem[] = [
  {
    id: 10,
    resourceId: 'i-0abcd1234',
    resourceType: 'ec2',
    resourceName: 'prod-web-1',
    region: 'ap-northeast-2',
    status: 'running',
    description: 'EC2 instance',
    awsAccountId: 1,
  },
  {
    id: 11,
    resourceId: 'i-0abcd5678',
    resourceType: 'ec2',
    resourceName: 'prod-api-1',
    region: 'ap-northeast-2',
    status: 'stopped',
    description: 'EC2 instance',
    awsAccountId: 1,
  },
  {
    id: 12,
    resourceId: 'lb-1234',
    resourceType: 'alb',
    resourceName: 'app-alb',
    region: 'us-west-2',
    status: 'active',
    description: 'Application Load Balancer',
    awsAccountId: 2,
  },
  {
    id: 13,
    resourceId: 'rds-aurora-01',
    resourceType: 'rds',
    resourceName: 'aurora-cluster',
    region: 'eu-central-1',
    status: 'available',
    description: 'Aurora MySQL Cluster',
    awsAccountId: 3,
  },
];

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
  if (isMock) {
    // 간단 검증 (서버 유효성 규칙과 유사)
    if (!payload.name?.trim()) throw new Error('name은 필수입니다.');
    if (!payload.defaultRegion?.trim()) throw new Error('defaultRegion은 필수입니다.');
    if (!/^[A-Z0-9]{16,24}$/.test(payload.accessKeyId)) throw new Error('accessKeyId 형식이 올바르지 않습니다.');
    if (payload.secretAccessKey.length < 32 || payload.secretAccessKey.length > 128) throw new Error('secretAccessKey 길이가 올바르지 않습니다.');
    if (mockAccounts.some(a => a.accessKeyId === payload.accessKeyId)) throw new Error('중복된 accessKeyId 입니다.');

    const id = Math.max(0, ...mockAccounts.map(a => a.id)) + 1;
    const resp: AwsAccountSummary = {
      id,
      name: payload.name,
      defaultRegion: payload.defaultRegion,
      accessKeyId: payload.accessKeyId,
      secretKeyLast4: '****' + payload.secretAccessKey.slice(-4),
      active: true,
    };
    mockAccounts = [resp, ...mockAccounts];
    return resp;
  }
  return (await api.post('/aws/accounts', payload)).data;
}

export async function getAwsAccounts(): Promise<AwsAccountSummary[]> {
  if (isMock) {
    return [...mockAccounts];
  }
  return (await api.get('/aws/accounts')).data;
}

export async function getAwsAccountInfo(accountId: number): Promise<AwsAccountSummary> {
  if (isMock) {
    const found = mockAccounts.find(a => a.id === accountId);
    if (!found) throw new Error('존재하지 않는 accountId');
    return found;
  }
  return (await api.get(`/aws/accounts/${accountId}/info`)).data;
}

export async function deleteAwsAccount(accountId: number): Promise<void> {
  if (isMock) {
    mockAccounts = mockAccounts.filter(a => a.id !== accountId);
    mockResources = mockResources.filter(r => r.awsAccountId !== accountId);
    return;
  }
  await api.delete(`/aws/accounts/${accountId}`);
}
export async function getAwsResourcesByAccount(accountId: number): Promise<AwsResourceItem[]> {
  if (isMock) {
    return mockResources.filter(r => r.awsAccountId === accountId);
  }
  return (await api.get(`/aws/accounts/${accountId}/resources`)).data;
}

export async function getAwsResourcesByType(resourceType: string): Promise<AwsResourceItem[]> {
  if (isMock) {
    return mockResources.filter(r => r.resourceType === resourceType);
  }
  return (await api.get('/aws/resources', { params: { resourceType } })).data;
}

export async function getAwsResourcesByAccountAndType(accountId: number, resourceType: string): Promise<AwsResourceItem[]> {
  if (isMock) {
    return mockResources.filter(r => r.awsAccountId === accountId && r.resourceType === resourceType);
  }
  return (await api.get(`/aws/accounts/${accountId}/resources/${resourceType}`)).data;
}


