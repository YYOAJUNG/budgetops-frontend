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

export interface CreateEc2InstanceRequest {
  name: string;
  instanceType: string;
  imageId: string;
  keyPairName?: string;
  securityGroupId?: string;
  subnetId?: string;
  availabilityZone?: string;
  userData?: string;
  minCount?: number;
  maxCount?: number;
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
 * AWS 계정 삭제 (비활성화)
 * @param accountId AWS 계정 ID
 */
export async function deleteAwsAccount(accountId: number): Promise<void> {
  await api.delete(`/aws/accounts/${accountId}`);
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

export interface Ec2MetricDataPoint {
  timestamp: string;
  value: number | null;
  unit: string;
}

export interface AwsEc2Metrics {
  instanceId: string;
  region: string;
  cpuUtilization: Ec2MetricDataPoint[];
  networkIn: Ec2MetricDataPoint[];
  networkOut: Ec2MetricDataPoint[];
  memoryUtilization: Ec2MetricDataPoint[];
}

/**
 * EC2 인스턴스의 CloudWatch 메트릭 조회
 * @param accountId AWS 계정 ID
 * @param instanceId EC2 인스턴스 ID
 * @param region 리전 (선택사항)
 * @param hours 조회할 시간 범위 (기본값: 1시간)
 */
export async function getEc2InstanceMetrics(
  accountId: number,
  instanceId: string,
  region?: string,
  hours?: number
): Promise<AwsEc2Metrics> {
  const params: any = {};
  if (region) params.region = region;
  if (hours) params.hours = hours;
  
  const { data } = await api.get<AwsEc2Metrics>(
    `/aws/accounts/${accountId}/ec2/instances/${instanceId}/metrics`,
    { params }
  );
  return data;
}

/**
 * EC2 인스턴스 생성
 * @param accountId AWS 계정 ID
 * @param request 인스턴스 생성 요청
 * @param region 리전 (선택사항)
 */
export async function createEc2Instance(
  accountId: number,
  request: CreateEc2InstanceRequest,
  region?: string
): Promise<AwsEc2Instance> {
  const params = region ? { region } : {};
  const { data } = await api.post<AwsEc2Instance>(
    `/aws/accounts/${accountId}/ec2/instances`,
    request,
    { params }
  );
  return data;
}

/**
 * EC2 인스턴스 정지
 * @param accountId AWS 계정 ID
 * @param instanceId EC2 인스턴스 ID
 * @param region 리전 (선택사항)
 */
export async function stopEc2Instance(
  accountId: number,
  instanceId: string,
  region?: string
): Promise<AwsEc2Instance> {
  const params = region ? { region } : {};
  const { data } = await api.post<AwsEc2Instance>(
    `/aws/accounts/${accountId}/ec2/instances/${instanceId}/stop`,
    {},
    { params }
  );
  return data;
}

/**
 * EC2 인스턴스 시작
 * @param accountId AWS 계정 ID
 * @param instanceId EC2 인스턴스 ID
 * @param region 리전 (선택사항)
 */
export async function startEc2Instance(
  accountId: number,
  instanceId: string,
  region?: string
): Promise<AwsEc2Instance> {
  const params = region ? { region } : {};
  const { data } = await api.post<AwsEc2Instance>(
    `/aws/accounts/${accountId}/ec2/instances/${instanceId}/start`,
    {},
    { params }
  );
  return data;
}

/**
 * EC2 인스턴스 삭제 (종료)
 * @param accountId AWS 계정 ID
 * @param instanceId EC2 인스턴스 ID
 * @param region 리전 (선택사항)
 */
export async function terminateEc2Instance(
  accountId: number,
  instanceId: string,
  region?: string
): Promise<void> {
  const params = region ? { region } : {};
  await api.delete(`/aws/accounts/${accountId}/ec2/instances/${instanceId}`, { params });
}

