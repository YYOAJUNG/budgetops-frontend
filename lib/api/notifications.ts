import { AppNotification } from '@/store/notifications';
import { checkAwsEc2Alerts, AwsEc2Alert } from './aws';

/**
 * AWS EC2 알림을 AppNotification 형태로 변환
 */
function convertEc2AlertToNotification(alert: AwsEc2Alert): AppNotification {
  // 심각도에 따른 중요도 매핑
  const importanceMap: Record<string, 'low' | 'normal' | 'high'> = {
    INFO: 'low',
    WARNING: 'normal',
    CRITICAL: 'high',
  };

  return {
    id: `ec2-alert-${alert.instanceId}-${alert.ruleId}-${Date.now()}`,
    title: alert.ruleTitle,
    message: `${alert.instanceName || alert.instanceId} - ${alert.violatedMetric} 임계치 초과 (현재: ${alert.currentValue?.toFixed(1)}%, 임계치: ${alert.threshold?.toFixed(1)}%)`,
    timestamp: alert.createdAt || new Date().toISOString(),
    isRead: alert.status === 'ACKNOWLEDGED',
    importance: importanceMap[alert.severity] || 'normal',
    service: 'EC2',
    provider: 'AWS',
  };
}

/**
 * 백엔드에서 실시간 알림 가져오기
 */
export async function fetchNotifications(): Promise<AppNotification[]> {
  const notifications: AppNotification[] = [];

  try {
    // AWS EC2 알림 체크 및 가져오기
    const ec2Alerts = await checkAwsEc2Alerts();
    const ec2Notifications = ec2Alerts.map(convertEc2AlertToNotification);
    notifications.push(...ec2Notifications);
  } catch (error) {
    console.error('Failed to fetch EC2 alerts:', error);
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


