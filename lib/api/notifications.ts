import { AppNotification } from '@/store/notifications';
import { checkAwsEc2Alerts, AwsEc2Alert } from './aws';
import { checkGcpAlerts, GcpAlert } from './gcp';

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
    id: `gcp-alert-${alert.resourceId}-${alert.ruleId}-${Date.now()}`,
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
 * 백엔드에서 실시간 알림 가져오기
 */
export async function fetchNotifications(): Promise<AppNotification[]> {
  const notifications: AppNotification[] = [];

  // AWS 알림
  try {
    const awsAlerts = await checkAwsEc2Alerts();
    const awsNotifications = awsAlerts.map(convertAwsAlertToNotification);
    notifications.push(...awsNotifications);
  } catch (error) {
    console.error('Failed to fetch AWS alerts:', error);
  }

  // GCP 알림
  try {
    const gcpAlerts = await checkGcpAlerts();
    const gcpNotifications = gcpAlerts.map(convertGcpAlertToNotification);
    notifications.push(...gcpNotifications);
  } catch (error) {
    console.error('Failed to fetch GCP alerts:', error);
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


