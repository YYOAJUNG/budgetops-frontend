import { api } from './client';

export interface FreeTierUsage {
  provider: 'AWS' | 'GCP' | 'Azure' | 'NCP';
  serviceName: string;
  used: number;
  limit: number;
  unit: string;
  isActive: boolean;
}

/**
 * 모든 CSP의 프리티어 사용현황 조회
 */
export async function getAllFreeTierUsage(): Promise<FreeTierUsage[]> {
  const freeTierData: FreeTierUsage[] = [];

  // AWS 프리티어 (EC2)
  try {
    const { data } = await api.get('/aws/freetier/usage');
    if (data && Array.isArray(data)) {
      freeTierData.push(...data);
    }
  } catch (error) {
    console.warn('Failed to fetch AWS free tier:', error);
  }

  // TODO: GCP, Azure, NCP 프리티어 API 추가 시 통합

  return freeTierData;
}

