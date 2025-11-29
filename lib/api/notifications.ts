import { AppNotification } from '@/store/notifications';
import { checkAwsEc2Alerts, AwsEc2Alert } from './aws';
import { checkNcpAlerts, NcpAlert } from './ncp';

/**
 * AWS 알림(EC2/RDS/S3 등)을 AppNotification 형태로 변환
 */
function convertAwsAlertToNotification(alert: AwsEc2Alert): AppNotification {
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
    id: `aws-alert-${alert.instanceId}-${alert.ruleId}-${Date.now()}`,
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

/**
 * 백엔드에서 실시간 알림 가져오기
 */
export async function fetchNotifications(): Promise<AppNotification[]> {
  const notifications: AppNotification[] = [];

  try {
    // AWS 모든 서비스 알림 체크 및 가져오기 (EC2, RDS, S3 등)
    const awsAlerts = await checkAwsEc2Alerts();
    const awsNotifications = awsAlerts.map(convertAwsAlertToNotification);
    notifications.push(...awsNotifications);
  } catch (error) {
    console.error('Failed to fetch AWS alerts:', error);
  }

  try {
    // NCP 알림 체크 및 가져오기
    const ncpAlerts = await checkNcpAlerts();
    const ncpNotifications = ncpAlerts.map(convertNcpAlertToNotification);
    notifications.push(...ncpNotifications);
  } catch (error) {
    console.error('Failed to fetch NCP alerts:', error);
  }

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


