export type Currency = 'KRW' | 'USD';

export type Tenant = { 
  id: string; 
  name: string 
};

export type CloudAccount = { 
  id: string; 
  provider: 'AWS' | 'GCP' | 'AZURE' | 'NCP'; 
  name: string; 
  status: 'CONNECTED' | 'ERROR' | 'PENDING';
  connectedAt?: string;
};

export type CostPoint = { 
  date: string; 
  amount: number; 
  currency: Currency;
  service?: string;
  account?: string;
};

export type Budget = { 
  id: string; 
  period: 'MONTHLY' | 'QUARTERLY' | 'YEARLY'; 
  amount: number; 
  currency: Currency; 
  thresholdPct: number; 
  spendToDate?: number;
  name?: string;
  createdAt?: string;
};

export type Anomaly = { 
  id: string; 
  date: string; 
  deltaPct: number; 
  impact: number; 
  causeHint?: string;
  service?: string;
  account?: string;
};

export type Recommendation = { 
  id: string; 
  title: string; 
  saving: number; 
  difficulty: 'LOW' | 'MEDIUM' | 'HIGH'; 
  category: string;
  description?: string;
  provider?: string;
};

export type Report = {
  id: string;
  name: string;
  type: 'MONTHLY' | 'WEEKLY' | 'CUSTOM';
  status: 'GENERATING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  completedAt?: string;
};

export type CopilotMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
};

