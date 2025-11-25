import { api } from './client';

export interface GcpAccount {
  id: number;
  name?: string; // 사용자가 연동 시 입력한 계정 이름
  serviceAccountName: string;
  projectId: string;
  createdAt: string;
}

export interface TestIntegrationRequest {
  serviceAccountId: string;
  serviceAccountKeyJson: string;
  billingAccountId?: string;
}

export interface ServiceAccountTestResult {
  ok: boolean;
  missingRoles: string[];
  message: string;
  httpStatus?: number;
  grantedPermissions?: string[];
  debugBodySnippet?: string;
}

export interface BillingTestResult {
  ok: boolean;
  datasetExists: boolean;
  latestTable?: string;
  message: string;
}

export interface TestIntegrationResponse {
  ok: boolean;
  message: string;
  serviceAccount: ServiceAccountTestResult;
  billing: BillingTestResult;
}

export interface SaveIntegrationRequest {
  name?: string; // 사용자가 입력한 계정 이름
  serviceAccountId: string;
  serviceAccountKeyJson: string;
  billingAccountId?: string;
}

export interface SaveIntegrationResponse {
  ok: boolean;
  id?: number;
  serviceAccountId?: string;
  projectId?: string;
  message: string;
}

/**
 * GCP 계정 목록 조회
 */
export async function getGcpAccounts(): Promise<GcpAccount[]> {
  const { data } = await api.get<GcpAccount[]>('/gcp/accounts');
  return data;
}

/**
 * GCP 계정 통합 테스트
 * 서비스 계정과 결제 계정을 한 번에 테스트합니다.
 */
export async function testGcpIntegration(
  request: TestIntegrationRequest
): Promise<TestIntegrationResponse> {
  const { data } = await api.post<TestIntegrationResponse>(
    '/gcp/accounts/test',
    request
  );
  return data;
}

/**
 * GCP 계정 저장
 * 검증된 서비스 계정 및 결제 계정 정보를 데이터베이스에 저장합니다.
 */
export async function saveGcpIntegration(
  request: SaveIntegrationRequest
): Promise<SaveIntegrationResponse> {
  const { data } = await api.post<SaveIntegrationResponse>(
    '/gcp/accounts',
    request
  );
  return data;
}

/**
 * GCP 계정 삭제
 * @param id 삭제할 계정 ID
 */
export async function deleteGcpAccount(id: number): Promise<void> {
  await api.delete(`/gcp/accounts/${id}`);
}

/**
 * GCP 리소스 타입 정의
 */
export interface GcpResource {
  id: number;
  resourceId: string;
  resourceName: string;
  resourceType: string;
  resourceTypeShort: string;
  monthlyCost: number | null;
  region: string;
  status: string;
  lastUpdated: string;
  additionalAttributes?: {
    externalIPs?: string[];
    internalIPs?: string[];
    machineType?: string;
    [key: string]: any;
  };
}

export interface GcpAccountResources {
  accountId: number;
  accountName: string | null;
  projectId: string;
  resources: GcpResource[];
}

/**
 * 모든 GCP 계정의 리소스 목록 조회
 */
export async function getAllGcpResources(): Promise<GcpAccountResources[]> {
  try {
    const { data } = await api.get<GcpAccountResources[]>('/gcp/resources');
    return data;
  } catch (error) {
    console.error('Failed to fetch GCP resources:', error);
    return [];
  }
}

export interface GcpMetricDataPoint {
  timestamp: string;
  value: number | null;
  unit: string;
}

export interface GcpInstanceMetrics {
  resourceId: string;
  resourceType: string;
  region: string;
  cpuUtilization: GcpMetricDataPoint[];
  networkIn: GcpMetricDataPoint[];
  networkOut: GcpMetricDataPoint[];
  memoryUtilization: GcpMetricDataPoint[];
}

/**
 * GCP 인스턴스의 메트릭 조회
 * @param resourceId GCP 리소스 ID (인스턴스 ID)
 * @param hours 조회할 시간 범위 (기본값: 1시간)
 */
export async function getGcpInstanceMetrics(
  resourceId: string,
  hours?: number
): Promise<GcpInstanceMetrics> {
  const params: any = {};
  if (hours) params.hours = hours;
  
  const { data } = await api.get<GcpInstanceMetrics>(
    `/gcp/resources/${resourceId}/metrics`,
    { params }
  );
  return data;
}

/**
 * GCP 알림 인터페이스
 */
export interface GcpAlert {
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
 * 모든 GCP 계정의 알림 점검 실행
 * 백엔드: POST /gcp/alerts/check
 */
export async function checkGcpAlerts(): Promise<GcpAlert[]> {
  const { data } = await api.post<GcpAlert[]>('/gcp/alerts/check');
  return data;
}

/**
 * 특정 GCP 계정의 알림 점검 실행
 * 백엔드: POST /gcp/alerts/check/{accountId}
 */
export async function checkGcpAlertsByAccount(accountId: number): Promise<GcpAlert[]> {
  const { data } = await api.post<GcpAlert[]>(`/gcp/alerts/check/${accountId}`);
  return data;
}
