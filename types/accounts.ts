export type CloudProvider = 'AWS' | 'GCP' | 'AZURE' | 'NCP';

export interface AccountFormData {
  provider: CloudProvider;
  name: string;
  region?: string;
  accessKey?: string;
  secretKey?: string;
  projectId?: string;
  serviceAccountKey?: string;
  subscriptionId?: string;
  clientId?: string;
  clientSecret?: string;
  tenantId?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
}

export interface AccountConnection {
  id: string;
  provider: CloudProvider;
  name: string;
  status: 'CONNECTED' | 'ERROR' | 'PENDING' | 'DISCONNECTED';
  connectedAt?: string;
  lastSyncAt?: string;
  errorMessage?: string;
}

export interface ProviderConfig {
  provider: CloudProvider;
  displayName: string;
  icon: string;
  supportsOAuth: boolean;
  requiredFields: string[];
  optionalFields: string[];
  oauthUrl?: string;
}
