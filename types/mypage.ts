import { LucideIcon } from 'lucide-react';

// User profile types
export interface UserProfile {
  name: string;
  email: string;
  company: string;
  phone: string;
  department: string;
  position: string;
  joinDate?: string;
  lastLogin?: string;
}

// Cloud account types
export type CloudProvider = 'AWS' | 'GCP' | 'Azure' | 'NCP' | 'Oracle' | 'Alibaba';
export type AccountStatus = 'connected' | 'error' | 'pending';

export interface CloudAccount {
  id: string;
  provider: CloudProvider;
  accountName: string;
  accountId: string;
  status: AccountStatus;
  lastSync: string;
  monthlyCost: number;
}

// Subscription types
export type PlanId = 'free' | 'pro' | 'enterprise';

export interface SubscriptionPlan {
  id: PlanId;
  name: string;
  price: number | null;
  period: string;
  popular?: boolean;
  features: string[];
}

export type PaymentStatus = 'paid' | 'pending' | 'failed';

export interface PaymentHistory {
  id: string;
  date: string;
  amount: number;
  status: PaymentStatus;
  invoiceUrl: string;
}

// Settings types
export interface NotificationSettings {
  budgetAlerts: boolean;
  anomalyDetection: boolean;
  weeklyReport: boolean;
  monthlyReport: boolean;
}

export interface EmailSettings {
  marketing: boolean;
  productUpdates: boolean;
  securityAlerts: boolean;
}

export interface PreferenceSettings {
  language: string;
  currency: string;
  timezone: string;
  theme: 'light' | 'dark' | 'auto';
}

export interface PrivacySettings {
  dataSharing: boolean;
  analytics: boolean;
  twoFactorAuth: boolean;
}

export interface SettingsState {
  notifications: NotificationSettings;
  email: EmailSettings;
  preferences: PreferenceSettings;
  privacy: PrivacySettings;
}

// Status configuration type
export interface StatusConfig<T extends string> {
  [key: string]: {
    label: string;
    icon: LucideIcon;
    color: string;
  };
}
