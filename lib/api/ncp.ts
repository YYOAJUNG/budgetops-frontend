import { api } from './client';

export interface NcpServerInstance {
  serverInstanceNo: string;
  serverName: string;
  serverDescription?: string;
  cpuCount: number;
  memorySize: number;
  platformType?: string;
  publicIp?: string;
  privateIp?: string;
  serverInstanceStatus?: string;
  serverInstanceStatusName?: string;
  createDate?: string;
  uptime?: string;
  serverImageProductCode?: string;
  serverProductCode?: string;
  zoneCode?: string;
  regionCode?: string;
  vpcNo?: string;
  subnetNo?: string;
}

export interface NcpAccount {
  id: number;
  name: string;
  regionCode?: string;
  accessKey: string;
  secretKeyLast4: string;
  active: boolean;
}

export interface CreateNcpAccountRequest {
  name: string;
  regionCode?: string;
  accessKey: string;
  secretKey: string;
}

export interface NcpMonthlyCost {
  demandMonth: string; // YYYYMM 형식
  demandType?: string;
  demandTypeDetail?: string;
  contractNo?: string;
  instanceName?: string;
  demandAmount: number;
  useAmount: number;
  promotionDiscountAmount: number;
  etcDiscountAmount: number;
  currency?: string;
}

/**
 * NCP 계정 목록 조회
 */
export async function getNcpAccounts(): Promise<NcpAccount[]> {
  const { data } = await api.get<NcpAccount[]>('/ncp/accounts');
  return data;
}

/**
 * NCP 계정 생성(연동)
 */
export async function createNcpAccount(payload: CreateNcpAccountRequest): Promise<NcpAccount> {
  const { data } = await api.post<NcpAccount>('/ncp/accounts', payload);
  return data;
}

/**
 * NCP 계정 삭제 (비활성화)
 * @param accountId NCP 계정 ID
 */
export async function deleteNcpAccount(accountId: number): Promise<void> {
  await api.delete(`/ncp/accounts/${accountId}`);
}

/**
 * 특정 NCP 계정의 서버 인스턴스 목록 조회
 * @param accountId NCP 계정 ID
 * @param regionCode 리전 코드 (선택사항)
 */
export async function getServerInstances(
  accountId: number,
  regionCode?: string
): Promise<NcpServerInstance[]> {
  const params = regionCode ? { regionCode } : {};
  const { data } = await api.get<NcpServerInstance[]>(
    `/ncp/accounts/${accountId}/servers/instances`,
    { params }
  );
  return data;
}

/**
 * 모든 NCP 계정의 서버 인스턴스를 조회
 */
export async function getAllServerInstances(): Promise<NcpServerInstance[]> {
  try {
    const accounts = await getNcpAccounts();
    if (accounts.length === 0) {
      return [];
    }

    // 활성 계정만 필터링
    const activeAccounts = accounts.filter((account) => account.active === true);
    if (activeAccounts.length === 0) {
      console.warn('No active NCP accounts found');
      return [];
    }

    // 모든 활성 계정의 서버 인스턴스를 병렬로 조회
    const instancesPromises = activeAccounts.map((account) =>
      getServerInstances(account.id, account.regionCode).catch((error) => {
        console.error(`Failed to fetch server instances for account ${account.id} (${account.name}):`, error);
        // 에러를 로깅하지만 빈 배열 반환하여 다른 계정 조회는 계속 진행
        return [];
      })
    );

    const instancesArrays = await Promise.all(instancesPromises);
    const allInstances = instancesArrays.flat();
    console.log(`Fetched ${allInstances.length} server instances from ${activeAccounts.length} active account(s)`);
    return allInstances;
  } catch (error) {
    console.error('Failed to fetch all NCP server instances:', error);
    return [];
  }
}

/**
 * 서버 인스턴스 시작
 * @param accountId NCP 계정 ID
 * @param serverInstanceNos 서버 인스턴스 번호 목록
 * @param regionCode 리전 코드 (선택사항)
 */
export async function startServerInstances(
  accountId: number,
  serverInstanceNos: string[],
  regionCode?: string
): Promise<NcpServerInstance[]> {
  const params = regionCode ? { regionCode } : {};
  const { data } = await api.post<NcpServerInstance[]>(
    `/ncp/accounts/${accountId}/servers/instances/start`,
    serverInstanceNos,
    { params }
  );
  return data;
}

/**
 * 서버 인스턴스 정지
 * @param accountId NCP 계정 ID
 * @param serverInstanceNos 서버 인스턴스 번호 목록
 * @param regionCode 리전 코드 (선택사항)
 */
export async function stopServerInstances(
  accountId: number,
  serverInstanceNos: string[],
  regionCode?: string
): Promise<NcpServerInstance[]> {
  const params = regionCode ? { regionCode } : {};
  const { data } = await api.post<NcpServerInstance[]>(
    `/ncp/accounts/${accountId}/servers/instances/stop`,
    serverInstanceNos,
    { params }
  );
  return data;
}

/**
 * 특정 NCP 계정의 비용 조회
 * @param accountId NCP 계정 ID
 * @param startMonth 시작 월 (YYYYMM 형식, 선택사항)
 * @param endMonth 종료 월 (YYYYMM 형식, 선택사항)
 */
export async function getNcpAccountCosts(
  accountId: number,
  startMonth?: string,
  endMonth?: string
): Promise<NcpMonthlyCost[]> {
  const params: any = {};
  if (startMonth) params.startMonth = startMonth;
  if (endMonth) params.endMonth = endMonth;

  const { data } = await api.get<NcpMonthlyCost[]>(
    `/ncp/accounts/${accountId}/costs`,
    { params }
  );
  return data;
}
