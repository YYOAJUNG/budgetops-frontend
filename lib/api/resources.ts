import { getAllEc2Instances, AwsEc2Instance } from './aws';
import { getAllGcpResources, GcpResource } from './gcp';
import { getAzureAccounts, getAzureVirtualMachines, AzureVirtualMachine } from './azure';

export type CloudProvider = 'AWS' | 'GCP' | 'Azure' | 'Oracle' | 'Alibaba';

export type AzureResourceDetails = {
  provider: 'Azure';
  vmSize: string;
  osType: string;
  computerName: string;
  powerState: string;
  provisioningState: string;
  resourceGroup: string;
  privateIp: string;
  publicIp: string;
  availabilityZone: string;
  timeCreated: string;
};

export type ResourceDetails = AzureResourceDetails;

export type ResourceItem = {
  id: string;
  name: string;
  provider: CloudProvider;
  service: string;
  cost: number;
  region: string;
  updatedAt: string;
  status: 'running' | 'stopped' | 'idle';
  details?: ResourceDetails;
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

/**
 * GCP 리소스를 ResourceItem으로 변환
 */
function convertGcpResourceToResource(
  resource: GcpResource,
  projectId: string
): ResourceItem {
  // 상태 매핑
  const statusMap: Record<string, 'running' | 'stopped' | 'idle'> = {
    RUNNING: 'running',
    STOPPED: 'stopped',
    STOPPING: 'stopped',
    STARTING: 'idle',
    SUSPENDED: 'stopped',
    SUSPENDING: 'stopped',
    TERMINATED: 'stopped',
  };

  // 리소스 타입에 따른 서비스명 매핑 - TODO: 추후 추가 예정
  const serviceMap: Record<string, string> = {
    'compute.googleapis.com/Instance': 'Instance',
    // 'container.googleapis.com/Cluster': 'Kubernetes Engine',
    // 'storage.googleapis.com/Bucket': 'Cloud Storage',
    // 'bigquery.googleapis.com/Dataset': 'BigQuery',
  };

  const service = serviceMap[resource.resourceType] || 'Unknown';

  return {
    id: resource.resourceId,
    name: resource.resourceName,
    provider: 'GCP',
    service,
    cost: resource.monthlyCost || 0,
    region: resource.region,
    updatedAt: resource.lastUpdated,
    status: statusMap[resource.status] || '-',
  };
}
    
/**
 * Azure VM을 ResourceItem으로 변환
 */
function convertAzureVmToResource(vm: AzureVirtualMachine): ResourceItem {
  // Azure powerState 매핑 (예: "VM running" -> "running")
  const powerState = vm.powerState?.toLowerCase() || '';
  let status: 'running' | 'stopped' | 'idle' = 'idle';
  if (powerState.includes('running')) {
    status = 'running';
  } else if (powerState.includes('stopped') || powerState.includes('deallocated')) {
    status = 'stopped';
  }

  return {
    id: vm.id,
    name: vm.name,
    provider: 'Azure',
    service: 'Virtual Machines',
    cost: 0, // 비용 정보는 별도 API에서 가져와야 함
    region: vm.location,
    updatedAt: vm.timeCreated || new Date().toISOString(), // timeCreated가 있으면 사용
    status,
    details: {
      provider: 'Azure',
      vmSize: vm.vmSize,
      osType: vm.osType,
      computerName: vm.computerName,
      powerState: vm.powerState,
      provisioningState: vm.provisioningState,
      resourceGroup: vm.resourceGroup,
      privateIp: vm.privateIp,
      publicIp: vm.publicIp,
      availabilityZone: vm.availabilityZone,
      timeCreated: vm.timeCreated,
    },
  };
}

export async function getResources(): Promise<ResourceItem[]> {
  try {
    const resources: ResourceItem[] = [];

    // AWS EC2 인스턴스 조회
    try {
      const ec2Instances = await getAllEc2Instances();
      const ec2Resources = ec2Instances.map(convertEc2ToResource);
      resources.push(...ec2Resources);
    } catch (error) {
      console.warn('Failed to fetch AWS EC2 instances:', error);
    }

    // Azure Virtual Machines 조회
    try {
      const azureAccounts = await getAzureAccounts();
      const activeAzureAccounts = azureAccounts.filter(acc => acc.active);
      
      for (const account of activeAzureAccounts) {
        try {
          const vms = await getAzureVirtualMachines(account.id);
          const vmResources = vms.map(convertAzureVmToResource);
          resources.push(...vmResources);
        } catch (error) {
          console.warn(`Failed to fetch Azure VMs for account ${account.id}:`, error);
        }
      }
    } catch (error) {
      console.warn('Failed to fetch Azure accounts:', error);
    }

    // GCP 리소스 조회
    try {
      const gcpAccountResources = await getAllGcpResources();
      const gcpResources = gcpAccountResources.flatMap((accountResources) =>
        accountResources.resources.map((resource) =>
          convertGcpResourceToResource(resource, accountResources.projectId)
        )
      );
      resources.push(...gcpResources);
    } catch (error) {
      console.warn('Failed to fetch GCP resources:', error);
    }
    
    return resources;
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
