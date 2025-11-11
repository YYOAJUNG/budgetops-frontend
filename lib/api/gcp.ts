import { api } from './client';

export interface GcpAccount {
  id: number;
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

