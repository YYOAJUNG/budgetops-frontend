import { getAllEc2Instances, AwsEc2Instance } from './aws';

export type CloudProvider = 'AWS' | 'GCP' | 'Azure' | 'Oracle' | 'Alibaba';

export type ResourceItem = {
  id: string;
  name: string;
  provider: CloudProvider;
  service: string;
  cost: number;
  region: string;
  updatedAt: string;
  status: 'running' | 'stopped' | 'idle';
};

const MOCK_RESOURCES: ResourceItem[] = [
  {
    id: 'res-aws-ec2-1',
    name: 'prod-web-1',
    provider: 'AWS',
    service: 'EC2',
    cost: 420000,
    region: 'ap-northeast-2',
    updatedAt: '2025-11-02T08:30:00Z',
    status: 'running',
  },
  {
    id: 'res-aws-rds-1',
    name: 'aurora-cluster',
    provider: 'AWS',
    service: 'RDS',
    cost: 310000,
    region: 'ap-northeast-2',
    updatedAt: '2025-11-04T12:10:00Z',
    status: 'running',
  },
  {
    id: 'res-gcp-bq-1',
    name: 'analytics-dataset',
    provider: 'GCP',
    service: 'BigQuery',
    cost: 280000,
    region: 'asia-northeast3',
    updatedAt: '2025-11-01T05:42:00Z',
    status: 'running',
  },
  {
    id: 'res-gcp-gcs-1',
    name: 'backup-bucket',
    provider: 'GCP',
    service: 'Cloud Storage',
    cost: 120000,
    region: 'asia-northeast3',
    updatedAt: '2025-10-30T01:05:00Z',
    status: 'idle',
  },
  {
    id: 'res-azure-vm-1',
    name: 'vm-app-01',
    provider: 'Azure',
    service: 'Virtual Machines',
    cost: 190000,
    region: 'koreacentral',
    updatedAt: '2025-11-03T09:22:00Z',
    status: 'running',
  },
  {
    id: 'res-aws-lambda-1',
    name: 'user-events-fn',
    provider: 'AWS',
    service: 'Lambda',
    cost: 75000,
    region: 'us-east-1',
    updatedAt: '2025-11-05T02:15:00Z',
    status: 'running',
  },
  {
    id: 'res-aws-s3-1',
    name: 'logs-archive',
    provider: 'AWS',
    service: 'S3',
    cost: 56000,
    region: 'ap-northeast-2',
    updatedAt: '2025-11-04T18:00:00Z',
    status: 'idle',
  },
  {
    id: 'res-gcp-gke-1',
    name: 'gke-cluster',
    provider: 'GCP',
    service: 'Kubernetes Engine',
    cost: 340000,
    region: 'asia-northeast3',
    updatedAt: '2025-11-02T16:30:00Z',
    status: 'running',
  },
  {
    id: 'res-azure-sql-1',
    name: 'sql-managed-instance',
    provider: 'Azure',
    service: 'Azure SQL',
    cost: 210000,
    region: 'koreasouth',
    updatedAt: '2025-11-05T07:18:00Z',
    status: 'running',
  },
  {
    id: 'res-oracle-oci-1',
    name: 'oci-prod-db',
    provider: 'Oracle',
    service: 'OCI Database',
    cost: 260000,
    region: 'ap-seoul-1',
    updatedAt: '2025-10-28T11:11:00Z',
    status: 'running',
  },
];

/**
 * EC2 인스턴스를 ResourceItem으로 변환
 */
function convertEc2ToResource(instance: AwsEc2Instance): ResourceItem {
  // 상태 매핑
  const statusMap: Record<string, 'running' | 'stopped' | 'idle'> = {
    running: 'running',
    stopped: 'stopped',
    stopping: 'stopped',
    pending: 'idle',
    'shutting-down': 'stopped',
    terminated: 'stopped',
  };

  return {
    id: instance.instanceId,
    name: instance.name || instance.instanceId,
    provider: 'AWS',
    service: 'EC2',
    cost: 0, // 비용 정보는 별도 API에서 가져와야 함
    region: instance.availabilityZone.slice(0, -1), // us-east-1a -> us-east-1
    updatedAt: instance.launchTime,
    status: statusMap[instance.state] || 'idle',
  };
}

export async function getResources(): Promise<ResourceItem[]> {
  try {
    // 실제 EC2 데이터만 조회
    const ec2Instances = await getAllEc2Instances();
    const ec2Resources = ec2Instances.map(convertEc2ToResource);
    
    return ec2Resources;
  } catch (error) {
    console.error('Failed to fetch resources:', error);
    // 에러 시 빈 배열 반환
    return [];
  }
}

export type FreeTierUsage = {
  provider: CloudProvider;
  quota: number;
  used: number;
  unit: string;
};

const MOCK_FREETIERS: FreeTierUsage[] = [
  { provider: 'AWS', quota: 750, used: 620, unit: '시간' },
  { provider: 'GCP', quota: 300, used: 180, unit: '시간' },
  { provider: 'Azure', quota: 200, used: 90, unit: '시간' },
  { provider: 'Oracle', quota: 400, used: 350, unit: '크레딧' },
];

export async function getFreeTierUsage(): Promise<FreeTierUsage[]> {
  return new Promise((resolve) => setTimeout(() => resolve(MOCK_FREETIERS), 200));
}
