import { api } from './client';

export interface AwsEc2Instance {
  instanceId: string;
  name: string;
  instanceType: string;
  state: string;
  availabilityZone: string;
  publicIp: string;
  privateIp: string;
  launchTime: string;
}

export interface AwsAccount {
  id: number;
  name: string;
  defaultRegion: string;
  accessKeyId: string;
  secretKeyLast4: string;
  active: boolean;
}

export interface CreateAwsAccountRequest {
  name: string;
  defaultRegion: string;
  accessKeyId: string;
  secretAccessKey: string;
}

/**
 * AWS 계정 목록 조회
 */
export async function getAwsAccounts(): Promise<AwsAccount[]> {
  const { data } = await api.get<AwsAccount[]>('/aws/accounts');
  return data;
}

/**
 * AWS 계정 생성(연동)
 */
export async function createAwsAccount(payload: CreateAwsAccountRequest): Promise<AwsAccount> {
  const { data } = await api.post<AwsAccount>('/aws/accounts', payload);
  return data;
}

/**
 * 특정 AWS 계정의 EC2 인스턴스 목록 조회
 * @param accountId AWS 계정 ID
 * @param region 리전 (선택사항)
 */
export async function getEc2Instances(
  accountId: number,
  region?: string
): Promise<AwsEc2Instance[]> {
  const params = region ? { region } : {};
  const { data } = await api.get<AwsEc2Instance[]>(
    `/aws/accounts/${accountId}/ec2/instances`,
    { params }
  );
  return data;
}

/**
 * 특정 EC2 인스턴스 상세 조회
 * @param accountId AWS 계정 ID
 * @param instanceId EC2 인스턴스 ID
 * @param region 리전 (선택사항)
 */
export async function getEc2Instance(
  accountId: number,
  instanceId: string,
  region?: string
): Promise<AwsEc2Instance> {
  const params = region ? { region } : {};
  const { data } = await api.get<AwsEc2Instance>(
    `/aws/accounts/${accountId}/ec2/instances/${instanceId}`,
    { params }
  );
  return data;
}

/**
 * 모든 AWS 계정의 EC2 인스턴스를 조회
 */
export async function getAllEc2Instances(): Promise<AwsEc2Instance[]> {
  try {
    const accounts = await getAwsAccounts();
    if (accounts.length === 0) {
      return [];
    }

    // 모든 계정의 EC2 인스턴스를 병렬로 조회
    const instancesPromises = accounts.map((account) =>
      getEc2Instances(account.id, account.defaultRegion).catch(() => [])
    );

    const instancesArrays = await Promise.all(instancesPromises);
    return instancesArrays.flat();
  } catch (error) {
    console.error('Failed to fetch all EC2 instances:', error);
    return [];
  }
}

