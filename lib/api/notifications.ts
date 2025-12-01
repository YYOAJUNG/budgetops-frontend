import { AppNotification } from '@/store/notifications';
import { checkAwsAlerts, AwsAlert } from './aws';
import { checkGcpAlerts, GcpAlert } from './gcp';
import { checkAzureAlerts, AzureAlert } from './azure';
import { checkNcpAlerts, NcpAlert } from './ncp';
import { checkBudgetAlerts, type BudgetAlert } from './budget';
import { api } from './client';

export interface SlackSettingsResponse {
  enabled: boolean;
  webhookUrl: string | null;
  updatedAt?: string | null;
}

export interface SlackSettingsRequest {
  enabled: boolean;
  webhookUrl?: string | null;
}

/**
 * AWS 알림(EC2/RDS/S3 등)을 AppNotification 형태로 변환
 */
function convertAwsAlertToNotification(alert: AwsAlert): AppNotification {
  // 심각도에 따른 중요도 매핑
  const importanceMap: Record<string, 'low' | 'normal' | 'high'> = {
    INFO: 'low',
    WARNING: 'normal',
    CRITICAL: 'high',
  };

  // 규칙 ID에서 서비스 추론 (instance_rightsizing, stop_unused_instances -> EC2, db_rightsizing -> RDS 등)
  const service = alert.ruleId?.includes('db_') || alert.ruleId?.includes('_db') ? 'RDS' 
    : alert.ruleId?.includes('lifecycle') || alert.ruleId?.includes('bucket') ? 'S3'
    : 'EC2';

  return {
    id: `aws-alert-${alert.instanceId}-${alert.ruleId}`,
    title: alert.ruleTitle,
    message: `${alert.instanceName || alert.instanceId} - ${alert.violatedMetric} 임계치 초과 (현재: ${alert.currentValue?.toFixed(1)}%, 임계치: ${alert.threshold?.toFixed(1)}%)`,
    timestamp: alert.createdAt || new Date().toISOString(),
    isRead: alert.status === 'ACKNOWLEDGED',
    importance: importanceMap[alert.severity] || 'normal',
    service,
    provider: 'AWS',
  };
}

/**
 * GCP 알림을 AppNotification 형태로 변환
 */
function convertGcpAlertToNotification(alert: GcpAlert): AppNotification {
  // 심각도에 따른 중요도 매핑
  const importanceMap: Record<string, 'low' | 'normal' | 'high'> = {
    INFO: 'low',
    WARNING: 'normal',
    CRITICAL: 'high',
  };

  return {
    id: `gcp-alert-${alert.resourceId}-${alert.ruleId}`,
    title: alert.ruleTitle,
    message: `${alert.resourceName || alert.resourceId} - ${alert.violatedMetric} 임계치 초과 (현재: ${alert.currentValue?.toFixed(1)}%, 임계치: ${alert.threshold?.toFixed(1)}%)`,
    timestamp: alert.createdAt || new Date().toISOString(),
    isRead: alert.status === 'ACKNOWLEDGED',
    importance: importanceMap[alert.severity] || 'normal',
    service: 'Compute Engine',
    provider: 'GCP',
  };
}

/**
 * Azure 알림을 AppNotification 형태로 변환
 */
function convertAzureAlertToNotification(alert: AzureAlert): AppNotification {
  // 심각도에 따른 중요도 매핑
  const importanceMap: Record<string, 'low' | 'normal' | 'high'> = {
    INFO: 'low',
    WARNING: 'normal',
    CRITICAL: 'high',
  };

  return {
    id: `azure-alert-${alert.resourceId}-${alert.ruleId}`,
    title: alert.ruleTitle,
    message: `${alert.resourceName || alert.resourceId} - ${alert.violatedMetric} 임계치 초과 (현재: ${alert.currentValue?.toFixed(1)}%, 임계치: ${alert.threshold?.toFixed(1)}%)`,
    timestamp: alert.createdAt || new Date().toISOString(),
    isRead: alert.status === 'ACKNOWLEDGED',
    importance: importanceMap[alert.severity] || 'normal',
    service: 'Virtual Machines',
    provider: 'Azure',
  };
}

/**
 * NCP 알림을 AppNotification 형태로 변환
 */
function convertNcpAlertToNotification(alert: NcpAlert): AppNotification {
  const importanceMap: Record<string, 'low' | 'normal' | 'high'> = {
    INFO: 'low',
    WARNING: 'normal',
    CRITICAL: 'high',
  };

  return {
    id: `ncp-alert-${alert.serverInstanceNo}-${alert.ruleId}-${Date.now()}`,
    title: alert.ruleTitle,
    message: `${alert.serverName || alert.serverInstanceNo} - ${alert.violatedMetric} 임계치 초과 (현재: ${alert.currentValue?.toFixed(1)}%, 임계치: ${alert.threshold?.toFixed(1)}%)`,
    timestamp: alert.createdAt || new Date().toISOString(),
    isRead: alert.status === 'ACKNOWLEDGED',
    importance: importanceMap[alert.severity] || 'normal',
    service: 'Server',
    provider: 'NCP',
  };
}

function convertBudgetAlertToNotification(alert: BudgetAlert): AppNotification {
  const targetLabel = alert.accountName
    ? `${alert.accountName}${alert.provider ? ` (${alert.provider})` : ''}`
    : '통합 예산';
  const usageMessage = alert.message
    ? alert.message
    : `${targetLabel}에서 예산의 ${alert.usagePercentage?.toFixed(1) ?? 0}%를 사용했습니다.`;

  return {
    id: `budget-alert-${alert.triggeredAt}`,
    title: '예산 임계값 도달',
    message: usageMessage,
    timestamp: alert.triggeredAt ?? new Date().toISOString(),
    isRead: false,
    importance: 'high',
    service: alert.provider ? `${alert.provider} Budget` : 'Budget',
  };
}

export async function getSlackSettings(): Promise<SlackSettingsResponse> {
  const { data } = await api.get<SlackSettingsResponse>('/notifications/slack');
  return data;
}

export async function updateSlackSettings(payload: SlackSettingsRequest): Promise<SlackSettingsResponse> {
  const { data } = await api.put<SlackSettingsResponse>('/notifications/slack', payload);
  return data;
}

export async function testSlackNotification(): Promise<{ message?: string; error?: string }> {
  const { data } = await api.post<{ message?: string; error?: string }>('/notifications/slack/test');
  return data;
}

/**
 * 백엔드에서 실시간 알림 가져오기
 */
export async function fetchNotifications(): Promise<AppNotification[]> {
  const notifications: AppNotification[] = [];

  // AWS 알림
  try {
    console.log('[Notifications] Fetching AWS alerts...');
    const awsAlerts = await checkAwsAlerts();
    console.log(`[Notifications] Received ${awsAlerts.length} AWS alerts`);
    const awsNotifications = awsAlerts.map(convertAwsAlertToNotification);
    notifications.push(...awsNotifications);
  } catch (error) {
    console.error('[Notifications] Failed to fetch AWS alerts:', error);
  }

  // GCP 알림
  try {
    console.log('[Notifications] Fetching GCP alerts...');
    const gcpAlerts = await checkGcpAlerts();
    console.log(`[Notifications] Received ${gcpAlerts.length} GCP alerts`);
    const gcpNotifications = gcpAlerts.map(convertGcpAlertToNotification);
    notifications.push(...gcpNotifications);
  } catch (error) {
    console.error('[Notifications] Failed to fetch GCP alerts:', error);
  }

  // Azure 알림
  try {
    console.log('[Notifications] Fetching Azure alerts...');
    const azureAlerts = await checkAzureAlerts();
    console.log(`[Notifications] Received ${azureAlerts.length} Azure alerts`);
    const azureNotifications = azureAlerts.map(convertAzureAlertToNotification);
    notifications.push(...azureNotifications);
  } catch (error) {
    console.error('[Notifications] Failed to fetch Azure alerts:', error);
  }

  // NCP 알림
  try {
    console.log('[Notifications] Fetching NCP alerts...');
    const ncpAlerts = await checkNcpAlerts();
    console.log(`[Notifications] Received ${ncpAlerts.length} NCP alerts`);
    const ncpNotifications = ncpAlerts.map(convertNcpAlertToNotification);
    notifications.push(...ncpNotifications);
  } catch (error) {
    console.error('[Notifications] Failed to fetch NCP alerts:', error);
  }

  // 예산 임계값 알림
  try {
    const budgetAlerts = await checkBudgetAlerts();
    budgetAlerts.forEach((alert) => notifications.push(convertBudgetAlertToNotification(alert)));
  } catch (error) {
    console.error('[Notifications] Failed to fetch budget alerts:', error);
  }

  console.log(`[Notifications] Total ${notifications.length} alerts fetched`);

  // 중요도 높은 알림을 우선으로 정렬
  const importanceRank = { high: 0, normal: 1, low: 2 };
  return notifications.sort(
    (a, b) =>
      (importanceRank[a.importance ?? 'normal'] - importanceRank[b.importance ?? 'normal']) ||
      (a.isRead === b.isRead ? 0 : a.isRead ? 1 : -1)
  );
}

export async function markAllNotificationsRead(): Promise<void> {
  // 백엔드 연동 시 PUT /notifications/read-all 등으로 대체
  return;
}

export async function markNotificationRead(id: string): Promise<void> {
  // 백엔드 연동 시 PUT /notifications/{id}/read 등으로 대체
  return;
}
