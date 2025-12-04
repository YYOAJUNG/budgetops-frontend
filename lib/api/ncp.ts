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

export interface NcpCostSummary {
  month: string; // YYYYMM 형식
  totalCost: number;
  currency: string;
  totalDemandAmount: number;
  totalUseAmount: number;
  totalDiscountAmount: number;
}

export interface MetricDataPoint {
  timestamp: string;
  value: number | null;
}

export interface NcpServerMetrics {
  instanceNo: string;
  instanceName: string;
  cpuUsage: MetricDataPoint[];
  memoryUsage: MetricDataPoint[];
  networkIn: MetricDataPoint[];
  networkOut: MetricDataPoint[];
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
 * 서버 인스턴스 삭제 (반납)
 * @param accountId NCP 계정 ID
 * @param serverInstanceNos 서버 인스턴스 번호 목록
 * @param regionCode 리전 코드 (선택사항)
 */
export async function terminateServerInstances(
  accountId: number,
  serverInstanceNos: string[],
  regionCode?: string
): Promise<NcpServerInstance[]> {
  const params = regionCode ? { regionCode } : {};
  const { data } = await api.post<NcpServerInstance[]>(
    `/ncp/accounts/${accountId}/servers/instances/terminate`,
    serverInstanceNos,
    { params }
  );
  return data;
}

/**
 * NCP 서버 인스턴스 메트릭 인터페이스
 */
export interface NcpServerMetrics {
  instanceNo: string;
  instanceName: string;
  region: string;
  cpuUtilization: Array<{
    timestamp: string;
    value: number | null;
    unit: string;
  }>;
  networkIn: Array<{
    timestamp: string;
    value: number | null;
    unit: string;
  }>;
  networkOut: Array<{
    timestamp: string;
    value: number | null;
    unit: string;
  }>;
  diskRead: Array<{
    timestamp: string;
    value: number | null;
    unit: string;
  }>;
  diskWrite: Array<{
    timestamp: string;
    value: number | null;
    unit: string;
  }>;
  fileSystemUtilization: Array<{
    timestamp: string;
    value: number | null;
    unit: string;
  }>;
}

/**
 * 서버 인스턴스 메트릭 조회
 * @param accountId NCP 계정 ID
 * @param instanceNo 서버 인스턴스 번호
 * @param regionCode 리전 코드 (선택사항)
 * @param hours 조회 기간 (시간, 기본값: 1)
 */
export async function getServerInstanceMetrics(
  accountId: number,
  instanceNo: string,
  regionCode?: string,
  hours: number = 1
): Promise<NcpServerMetrics> {
  const params: any = { hours };
  if (regionCode) params.regionCode = regionCode;
  
  const { data } = await api.get<NcpServerMetrics>(
    `/ncp/accounts/${accountId}/servers/instances/${instanceNo}/metrics`,
    { params }
  );
  return data;
}

/**
 * 집계된 NCP 서버 메트릭 인터페이스
 */
export interface NcpAggregatedMetrics {
  totalServers: number;
  cpuUtilization: Array<{
    timestamp: string;
    value: number | null;
    unit: string;
    min: number | null;
    max: number | null;
    avg: number | null;
  }>;
  networkIn: Array<{
    timestamp: string;
    value: number | null;
    unit: string;
    min: number | null;
    max: number | null;
    avg: number | null;
  }>;
  networkOut: Array<{
    timestamp: string;
    value: number | null;
    unit: string;
    min: number | null;
    max: number | null;
    avg: number | null;
  }>;
  diskRead: Array<{
    timestamp: string;
    value: number | null;
    unit: string;
    min: number | null;
    max: number | null;
    avg: number | null;
  }>;
  diskWrite: Array<{
    timestamp: string;
    value: number | null;
    unit: string;
    min: number | null;
    max: number | null;
    avg: number | null;
  }>;
  fileSystemUtilization: Array<{
    timestamp: string;
    value: number | null;
    unit: string;
    min: number | null;
    max: number | null;
    avg: number | null;
  }>;
}

/**
 * 여러 서버 인스턴스의 메트릭을 집계
 * @param accountId NCP 계정 ID
 * @param instanceNos 서버 인스턴스 번호 목록
 * @param regionCode 리전 코드 (선택사항)
 * @param hours 조회 기간 (시간, 기본값: 1)
 */
export async function getAggregatedServerMetrics(
  accountId: number,
  instanceNos: string[],
  regionCode?: string,
  hours: number = 1
): Promise<NcpAggregatedMetrics> {
  if (instanceNos.length === 0) {
    return {
      totalServers: 0,
      cpuUtilization: [],
      networkIn: [],
      networkOut: [],
      diskRead: [],
      diskWrite: [],
      fileSystemUtilization: [],
    };
  }

  // 모든 서버의 메트릭을 병렬로 조회
  const metricsPromises = instanceNos.map((instanceNo) =>
    getServerInstanceMetrics(accountId, instanceNo, regionCode, hours).catch((error) => {
      console.error(`Failed to fetch metrics for instance ${instanceNo}:`, error);
      return null;
    })
  );

  const metricsResults = await Promise.all(metricsPromises);
  const validMetrics = metricsResults.filter((m): m is NcpServerMetrics => m !== null);

  if (validMetrics.length === 0) {
    return {
      totalServers: 0,
      cpuUtilization: [],
      networkIn: [],
      networkOut: [],
      diskRead: [],
      diskWrite: [],
      fileSystemUtilization: [],
    };
  }

  // 타임스탬프별로 메트릭 집계
  const timestampMap = new Map<string, {
    cpu: number[];
    networkIn: number[];
    networkOut: number[];
    diskRead: number[];
    diskWrite: number[];
    fileSystem: number[];
  }>();

  validMetrics.forEach((metrics) => {
    // CPU 집계
    metrics.cpuUtilization.forEach((point) => {
      if (!timestampMap.has(point.timestamp)) {
        timestampMap.set(point.timestamp, {
          cpu: [],
          networkIn: [],
          networkOut: [],
          diskRead: [],
          diskWrite: [],
          fileSystem: [],
        });
      }
      const entry = timestampMap.get(point.timestamp)!;
      if (point.value !== null) {
        entry.cpu.push(point.value);
      }
    });

    // Network In 집계
    metrics.networkIn.forEach((point) => {
      const entry = timestampMap.get(point.timestamp);
      if (entry && point.value !== null) {
        entry.networkIn.push(point.value);
      }
    });

    // Network Out 집계
    metrics.networkOut.forEach((point) => {
      const entry = timestampMap.get(point.timestamp);
      if (entry && point.value !== null) {
        entry.networkOut.push(point.value);
      }
    });

    // Disk Read 집계
    metrics.diskRead.forEach((point) => {
      const entry = timestampMap.get(point.timestamp);
      if (entry && point.value !== null) {
        entry.diskRead.push(point.value);
      }
    });

    // Disk Write 집계
    metrics.diskWrite.forEach((point) => {
      const entry = timestampMap.get(point.timestamp);
      if (entry && point.value !== null) {
        entry.diskWrite.push(point.value);
      }
    });

    // File System 집계
    metrics.fileSystemUtilization.forEach((point) => {
      const entry = timestampMap.get(point.timestamp);
      if (entry && point.value !== null) {
        entry.fileSystem.push(point.value);
      }
    });
  });

  // 집계 결과 생성
  const sortedTimestamps = Array.from(timestampMap.keys()).sort();

  const aggregateMetric = (
    values: number[]
  ): { value: number | null; min: number | null; max: number | null; avg: number | null } => {
    if (values.length === 0) {
      return { value: null, min: null, max: null, avg: null };
    }
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    return { value: avg, min, max, avg };
  };

  const cpuUtilization = sortedTimestamps.map((timestamp) => {
    const entry = timestampMap.get(timestamp)!;
    const firstMetric = validMetrics[0].cpuUtilization.find((p) => p.timestamp === timestamp);
    return {
      timestamp,
      unit: firstMetric?.unit || 'Percent',
      ...aggregateMetric(entry.cpu),
    };
  });

  const networkIn = sortedTimestamps.map((timestamp) => {
    const entry = timestampMap.get(timestamp)!;
    const firstMetric = validMetrics[0].networkIn.find((p) => p.timestamp === timestamp);
    return {
      timestamp,
      unit: firstMetric?.unit || 'bits/sec',
      ...aggregateMetric(entry.networkIn),
    };
  });

  const networkOut = sortedTimestamps.map((timestamp) => {
    const entry = timestampMap.get(timestamp)!;
    const firstMetric = validMetrics[0].networkOut.find((p) => p.timestamp === timestamp);
    return {
      timestamp,
      unit: firstMetric?.unit || 'bits/sec',
      ...aggregateMetric(entry.networkOut),
    };
  });

  const diskRead = sortedTimestamps.map((timestamp) => {
    const entry = timestampMap.get(timestamp)!;
    const firstMetric = validMetrics[0].diskRead.find((p) => p.timestamp === timestamp);
    return {
      timestamp,
      unit: firstMetric?.unit || 'bytes/sec',
      ...aggregateMetric(entry.diskRead),
    };
  });

  const diskWrite = sortedTimestamps.map((timestamp) => {
    const entry = timestampMap.get(timestamp)!;
    const firstMetric = validMetrics[0].diskWrite.find((p) => p.timestamp === timestamp);
    return {
      timestamp,
      unit: firstMetric?.unit || 'bytes/sec',
      ...aggregateMetric(entry.diskWrite),
    };
  });

  const fileSystemUtilization = sortedTimestamps.map((timestamp) => {
    const entry = timestampMap.get(timestamp)!;
    const firstMetric = validMetrics[0].fileSystemUtilization.find((p) => p.timestamp === timestamp);
    return {
      timestamp,
      unit: firstMetric?.unit || 'Percent',
      ...aggregateMetric(entry.fileSystem),
    };
  });

  return {
    totalServers: validMetrics.length,
    cpuUtilization,
    networkIn,
    networkOut,
    diskRead,
    diskWrite,
    fileSystemUtilization,
  };
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

/**
 * NCP 알림 인터페이스
 */
export interface NcpAlert {
  id?: number;
  accountId: number;
  accountName: string;
  serverInstanceNo: string;
  serverName: string;
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
 * 특정 NCP 계정의 비용 요약 조회
 * @param accountId NCP 계정 ID
 * @param month 조회 월 (YYYYMM 형식, 선택사항 - 미지정 시 현재 월)
 */
export async function getNcpAccountCostSummary(
  accountId: number,
  month?: string
): Promise<NcpCostSummary> {
  const params: any = {};
  if (month) params.month = month;

  const { data } = await api.get<NcpCostSummary>(
    `/ncp/accounts/${accountId}/costs/summary`,
    { params }
  );
  return data;
}

/**
 * 모든 NCP 계정의 알림 점검 실행
 */
export async function checkNcpAlerts(): Promise<NcpAlert[]> {
  const { data } = await api.post<NcpAlert[]>('/ncp/alerts/check');
  return data;
}

/**
 * 특정 NCP 계정의 알림 점검 실행
 */
export async function checkNcpAlertsByAccount(accountId: number): Promise<NcpAlert[]> {
  const { data } = await api.post<NcpAlert[]>(`/ncp/alerts/check/${accountId}`);
  return data;
}

/**
 * 모든 NCP 계정의 비용 요약 조회
 * @param month 조회 월 (YYYYMM 형식, 선택사항 - 미지정 시 현재 월)
 */
export async function getAllNcpAccountsCostsSummary(
  month?: string
): Promise<Array<{ accountId: number; accountName: string; totalCost: number; currency: string }>> {
  try {
    const activeAccounts = await getActiveNcpAccounts();
    if (activeAccounts.length === 0) {
      return [];
    }

    const costSummaries = await fetchCostSummariesForAccounts(activeAccounts, month);
    console.log(`Fetched cost summaries from ${activeAccounts.length} active NCP account(s)`);
    return costSummaries;
  } catch (error) {
    console.error('Failed to fetch all NCP account cost summaries:', error);
    return [];
  }
}

/**
 * 활성 NCP 계정 목록 조회
 */
async function getActiveNcpAccounts(): Promise<NcpAccount[]> {
  const accounts = await getNcpAccounts();
  const activeAccounts = accounts.filter((account) => account.active === true);

  if (activeAccounts.length === 0) {
    console.warn('No active NCP accounts found');
  }

  return activeAccounts;
}

/**
 * 여러 계정의 비용 요약을 병렬로 조회
 */
async function fetchCostSummariesForAccounts(
  accounts: NcpAccount[],
  month?: string
): Promise<Array<{ accountId: number; accountName: string; totalCost: number; currency: string }>> {
  const costSummaryPromises = accounts.map((account) =>
    fetchAccountCostSummary(account, month)
  );

  return await Promise.all(costSummaryPromises);
}

/**
 * 단일 계정의 비용 요약 조회 (에러 처리 포함)
 */
async function fetchAccountCostSummary(
  account: NcpAccount,
  month?: string
): Promise<{ accountId: number; accountName: string; totalCost: number; currency: string }> {
  try {
    const summary = await getNcpAccountCostSummary(account.id, month);
    return {
      accountId: account.id,
      accountName: account.name,
      totalCost: summary.totalCost,
      currency: summary.currency,
    };
  } catch (error) {
    console.error(`Failed to fetch cost summary for account ${account.id} (${account.name}):`, error);
    // 에러 발생 시 0원으로 반환하여 다른 계정 조회는 계속 진행
    return {
      accountId: account.id,
      accountName: account.name,
      totalCost: 0,
      currency: 'KRW',
    };
  }
}
