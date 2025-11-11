import { api } from './client';

export type ActionType = 'offhours' | 'commitment' | 'storage' | 'rightsizing' | 'cleanup';

export interface ScenarioParams {
  targetSize?: string;
  targetVcpu?: number;
  targetRam?: number;
  targetIops?: number;
  commitLevel?: number;
  commitYears?: number;
  weekdays?: string[];
  stopAt?: string;
  startAt?: string;
  timezone?: string;
  scaleToZeroSupported?: boolean;
  targetTier?: string;
  retentionDays?: number;
  unusedDays?: number;
  customParams?: Record<string, any>;
}

export interface SimulateRequest {
  resourceIds: string[];
  action: ActionType;
  params?: ScenarioParams;
}

export interface SimulationResult {
  scenarioName: string;
  newCost: number;
  currentCost: number;
  savings: number;
  riskScore: number;
  priorityScore: number;
  confidence: number;
  yamlPatch?: string;
  description: string;
}

export interface SimulateResponse {
  scenarios: SimulationResult[];
  actionType: string;
  totalResources: number;
}

export interface ProposalRequest {
  scenarioId: string;
  note?: string;
  ttlDays: number;
}

export interface ProposalResponse {
  proposalId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  createdAt: string;
  expiresAt: string;
  scenario?: SimulationResult;
  note?: string;
}

/**
 * 시뮬레이션 실행
 */
export async function simulate(request: SimulateRequest): Promise<SimulateResponse> {
  const { data } = await api.post<SimulateResponse>('/simulator/simulate', request);
  return data;
}

/**
 * 제안서 생성
 */
export async function createProposal(request: ProposalRequest): Promise<ProposalResponse> {
  const { data } = await api.post<ProposalResponse>('/simulator/proposals', request);
  return data;
}

/**
 * 제안서 조회
 */
export async function getProposal(proposalId: string): Promise<ProposalResponse> {
  const { data } = await api.get<ProposalResponse>(`/simulator/proposals/${proposalId}`);
  return data;
}

/**
 * 제안서 승인
 */
export async function approveProposal(proposalId: string): Promise<ProposalResponse> {
  const { data } = await api.post<ProposalResponse>(`/simulator/proposals/${proposalId}/approve`);
  return data;
}

/**
 * 제안서 거부
 */
export async function rejectProposal(proposalId: string): Promise<ProposalResponse> {
  const { data } = await api.post<ProposalResponse>(`/simulator/proposals/${proposalId}/reject`);
  return data;
}

/**
 * 추천 액션 조회
 */
export interface RecommendationResponse {
  title: string;
  description: string;
  estimatedSavings: number;
  actionType: string;
  scenario: SimulationResult;
}

export async function getRecommendations(): Promise<RecommendationResponse[]> {
  const { data } = await api.get<RecommendationResponse[]>('/simulator/recommendations');
  return data;
}

