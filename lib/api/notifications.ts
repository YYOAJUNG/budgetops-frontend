import { AppNotification } from '@/store/notifications';
import { checkAwsEc2Alerts, AwsEc2Alert } from './aws';

const MOCK: AppNotification[] = [
  {
    id: '1',
    title: '비용 알림',
    message: 'AWS 계정의 이번 달 비용이 예산의 80%를 초과했습니다.',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    isRead: false,
    importance: 'high',
  },
  {
    id: '2',
    title: '계정 연동 완료',
    message: 'GCP 계정이 성공적으로 연동되었습니다.',
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    isRead: true,
    importance: 'normal',
  },
  {
    id: '3',
    title: '비용 최적화 제안',
    message: '사용하지 않는 EC2 인스턴스 3개를 발견했습니다.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    importance: 'normal',
  },
];

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
    id: `ec2-alert-${alert.instanceId}-${alert.ruleId}`,
    title: `[${alert.accountName}] ${alert.ruleTitle}`,
    message: `인스턴스 ${alert.instanceName || alert.instanceId}에서 ${alert.violatedMetric} 임계치 초과 감지 (현재: ${alert.currentValue?.toFixed(2)}, 임계치: ${alert.threshold?.toFixed(2)})`,
    timestamp: alert.createdAt || new Date().toISOString(),
    isRead: alert.status === 'ACKNOWLEDGED',
    importance: importanceMap[alert.severity] || 'normal',
  };
}

// 백엔드에서 AWS EC2 알림을 가져와서 통합
export async function fetchNotifications(): Promise<AppNotification[]> {
  const notifications: AppNotification[] = [...MOCK];

  try {
    // AWS EC2 알림 체크 및 가져오기
    const ec2Alerts = await checkAwsEc2Alerts();
    const ec2Notifications = ec2Alerts.map(convertEc2AlertToNotification);
    notifications.push(...ec2Notifications);
  } catch (error) {
    console.error('Failed to fetch EC2 alerts:', error);
    // 에러 발생 시 기존 MOCK 알림만 반환
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


