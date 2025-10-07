import dayjs from 'dayjs';
import type { Tenant, CloudAccount, CostPoint, Budget, Anomaly, Recommendation, Report } from '@/types/core';

export const mockTenants: Tenant[] = [
  { id: 't1', name: '메인 프로젝트' },
  { id: 't2', name: '개발 환경' },
];

export const mockAccounts: CloudAccount[] = [
  { id: 'a1', provider: 'AWS', name: 'AWS Production', status: 'CONNECTED', connectedAt: '2024-01-15' },
  { id: 'a2', provider: 'GCP', name: 'GCP Analytics', status: 'CONNECTED', connectedAt: '2024-02-01' },
  { id: 'a3', provider: 'AZURE', name: 'Azure Dev', status: 'PENDING', connectedAt: '2024-03-10' },
];

export const generateMockCostSeries = (days: number = 30): CostPoint[] => {
  const data: CostPoint[] = [];
  for (let i = days; i >= 0; i--) {
    data.push({
      date: dayjs().subtract(i, 'day').format('YYYY-MM-DD'),
      amount: Math.floor(Math.random() * 500000 + 1000000),
      currency: 'KRW',
    });
  }
  return data;
};

export const mockBudgets: Budget[] = [
  { 
    id: 'b1', 
    period: 'MONTHLY', 
    amount: 50000000, 
    currency: 'KRW', 
    thresholdPct: 80, 
    spendToDate: 38000000,
    name: '2024년 3월 예산',
    createdAt: '2024-03-01'
  },
  { 
    id: 'b2', 
    period: 'QUARTERLY', 
    amount: 150000000, 
    currency: 'KRW', 
    thresholdPct: 90, 
    spendToDate: 120000000,
    name: 'Q1 2024 예산',
    createdAt: '2024-01-01'
  },
];

export const mockAnomalies: Anomaly[] = [
  { 
    id: 'an1', 
    date: dayjs().subtract(2, 'day').format('YYYY-MM-DD'), 
    deltaPct: 45.2, 
    impact: 1200000, 
    causeHint: 'EC2 인스턴스 급증',
    service: 'EC2',
    account: 'AWS Production'
  },
  { 
    id: 'an2', 
    date: dayjs().subtract(5, 'day').format('YYYY-MM-DD'), 
    deltaPct: -32.1, 
    impact: -800000, 
    causeHint: 'Lambda 사용량 감소',
    service: 'Lambda',
    account: 'AWS Production'
  },
];

export const mockRecommendations: Recommendation[] = [
  { 
    id: 'r1', 
    title: 'EC2 Reserved Instance로 전환', 
    saving: 2500000, 
    difficulty: 'LOW', 
    category: 'Compute',
    description: 'On-Demand 인스턴스를 Reserved Instance로 전환하여 비용 절감',
    provider: 'AWS'
  },
  { 
    id: 'r2', 
    title: '미사용 EBS 볼륨 삭제', 
    saving: 850000, 
    difficulty: 'LOW', 
    category: 'Storage',
    description: '30일 이상 연결되지 않은 EBS 볼륨 정리',
    provider: 'AWS'
  },
  { 
    id: 'r3', 
    title: 'RDS 인스턴스 다운사이징', 
    saving: 1200000, 
    difficulty: 'MEDIUM', 
    category: 'Database',
    description: '사용률이 낮은 RDS 인스턴스 크기 조정',
    provider: 'AWS'
  },
];

export const mockReports: Report[] = [
  { 
    id: 'rep1', 
    name: '2024년 2월 월간 리포트', 
    type: 'MONTHLY', 
    status: 'COMPLETED', 
    createdAt: '2024-03-01T09:00:00Z',
    completedAt: '2024-03-01T09:05:32Z'
  },
  { 
    id: 'rep2', 
    name: '주간 비용 리포트', 
    type: 'WEEKLY', 
    status: 'GENERATING', 
    createdAt: dayjs().subtract(1, 'hour').toISOString()
  },
];

