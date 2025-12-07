import { api } from './client';

export interface GcpAccount {
  id: number;
  name?: string; // 사용자가 연동 시 입력한 계정 이름
  serviceAccountName: string;
  projectId: string;
  createdAt: string;
  hasCredit?: boolean;
  creditLimitAmount?: number;
  creditCurrency?: string;
  creditStartDate?: string;
  creditEndDate?: string;
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

export interface GcpFreeTierUsage {
  usedAmount: number;
  freeTierLimitAmount: number;
  remainingAmount: number;
  percentage: number;
  currency: string;
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
 * 특정 GCP 계정의 프리티어/크레딧 사용량 조회
 */
export async function getGcpAccountFreeTierUsage(
  accountId: number,
  startDate?: string,
  endDate?: string
): Promise<GcpFreeTierUsage> {
  const params: Record<string, string> = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  const { data } = await api.get<GcpFreeTierUsage>(
    `/gcp/accounts/${accountId}/freetier/usage`,
    { params }
  );
  return data;
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

/**
 * GCP 비용 관련 타입 정의
 */

/**
 * 일별 비용 항목
 */
export interface GcpDailyCost {
  date: string; // "YYYY-MM-DD" 형식
  grossCost: number;
  creditUsed: number;
  netCost: number;
  displayNetCost: number; // 표시용 netCost (음수면 0)
}

/**
 * 특정 계정의 일별 비용 응답
 */
export interface GcpAccountCosts {
  accountId: number;
  accountName: string;
  currency: string; // 예: "USD", "KRW"
  totalGrossCost: number; // 프리티어/크레딧 공제 전 사용액
  totalCreditUsed: number; // 사용된 크레딧액
  totalNetCost: number; // 실제 청구된 금액 (크레딧/프리티어 공제 후)
  totalDisplayNetCost: number; // 표시용 netCost (음수면 0)
  dailyCosts: GcpDailyCost[];
}

/**
 * 특정 계정의 월별 비용 응답
 */
export interface GcpMonthlyCosts {
  accountId: number;
  accountName: string;
  year: number;
  month: number;
  totalGrossCost: number;
  totalCreditUsed: number;
  totalNetCost: number;
  displayNetCost: number; // 표시용 netCost (음수면 0)
  currency: string;
}

/**
 * 모든 계정의 통합 비용 응답의 summary 부분
 */
export interface GcpCostsSummary {
  currency: string;
  totalGrossCost: number;
  totalCreditUsed: number;
  totalNetCost: number;
  totalDisplayNetCost: number; // 표시용 netCost (음수면 0)
}

/**
 * 모든 계정의 통합 비용 응답의 계정별 항목
 */
export interface GcpAccountCostSummary {
  accountId: number;
  accountName: string;
  currency: string;
  totalGrossCost: number;
  totalCreditUsed: number;
  totalNetCost: number;
  totalDisplayNetCost: number; // 표시용 netCost (음수면 0)
}

/**
 * 모든 계정의 통합 비용 응답
 */
export interface GcpAllAccountsCosts {
  summary: GcpCostsSummary;
  accounts: GcpAccountCostSummary[];
}

/**
 * 특정 GCP 계정의 일별 비용 조회
 * @param accountId GCP 계정 ID
 * @param startDate 시작 날짜 (ISO 8601 형식: YYYY-MM-DD, 선택)
 * @param endDate 종료 날짜 (ISO 8601 형식: YYYY-MM-DD, 선택, exclusive)
 */
export async function getGcpAccountCosts(
  accountId: number,
  startDate?: string,
  endDate?: string
): Promise<GcpAccountCosts> {
  const params: Record<string, string> = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  
  const { data } = await api.get<GcpAccountCosts>(
    `/gcp/accounts/${accountId}/costs`,
    { params }
  );
  return data;
}

/**
 * 특정 GCP 계정의 월별 비용 조회
 * @param accountId GCP 계정 ID
 * @param year 연도 (예: 2024)
 * @param month 월 (1-12)
 */
export async function getGcpAccountMonthlyCosts(
  accountId: number,
  year: number,
  month: number
): Promise<GcpMonthlyCosts> {
  const params: Record<string, string> = {
    year: year.toString(),
    month: month.toString(),
  };
  
  const { data } = await api.get<GcpMonthlyCosts>(
    `/gcp/accounts/${accountId}/costs/monthly`,
    { params }
  );
  return data;
}

/**
 * 모든 GCP 계정의 비용 통합 조회
 * @param startDate 시작 날짜 (ISO 8601 형식: YYYY-MM-DD, 선택)
 * @param endDate 종료 날짜 (ISO 8601 형식: YYYY-MM-DD, 선택, exclusive)
 */
export async function getAllGcpAccountsCosts(
  startDate?: string,
  endDate?: string
): Promise<GcpAllAccountsCosts> {
  const params: Record<string, string> = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  
  const { data } = await api.get<GcpAllAccountsCosts>(
    '/gcp/costs',
    { params }
  );
  return data;
}
