import { AppNotification } from '@/store/notifications';

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

// TODO: 백엔드 연동되면 실제 API 호출로 교체
export async function fetchNotifications(): Promise<AppNotification[]> {
  // 중요도 높은 알림을 우선으로 정렬
  const importanceRank = { high: 0, normal: 1, low: 2 };
  return [...MOCK].sort(
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


