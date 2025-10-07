import type { ProviderConfig } from '@/types/accounts';

export const providerConfigs: ProviderConfig[] = [
  {
    provider: 'AWS',
    displayName: 'Amazon Web Services',
    icon: 'aws',
    supportsOAuth: false,
    requiredFields: ['accessKeyId', 'secretAccessKey'],
    optionalFields: ['region'],
  },
  {
    provider: 'GCP',
    displayName: 'Google Cloud Platform',
    icon: 'gcp',
    supportsOAuth: true,
    requiredFields: ['projectId'],
    optionalFields: ['serviceAccountKey'],
    oauthUrl: '/oauth/gcp',
  },
  {
    provider: 'AZURE',
    displayName: 'Microsoft Azure',
    icon: 'azure',
    supportsOAuth: true,
    requiredFields: ['subscriptionId', 'clientId', 'clientSecret', 'tenantId'],
    optionalFields: [],
    oauthUrl: '/oauth/azure',
  },
  {
    provider: 'NCP',
    displayName: 'Naver Cloud Platform',
    icon: 'ncp',
    supportsOAuth: false,
    requiredFields: ['accessKey', 'secretKey'],
    optionalFields: ['region'],
  },
];

export const getProviderConfig = (provider: string): ProviderConfig | undefined => {
  return providerConfigs.find(config => config.provider === provider);
};
