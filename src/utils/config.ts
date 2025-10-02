// Configuration for different environments
export const config = {
  // Analytics Configuration
  analytics: {
    // Production GA4 Measurement ID
    gaTrackingId: process.env.NODE_ENV === 'production' 
      ? 'G-RVX49ZBSWG' // 실제 운영환경 측정 ID
      : 'G-RVX49ZBSWG', // 개발환경에서도 같은 ID 사용
    
    // Google Tag Manager Container ID
    gtmContainerId: process.env.NODE_ENV === 'production'
      ? 'GTM-TTTMZQ4K' // 실제 GTM 컨테이너 ID로 교체하세요
      : 'GTM-TTTMZQ4K', // 개발환경용 GTM ID
    
    // Debug mode for development
    debugMode: process.env.NODE_ENV === 'development',
    
    // Disable analytics in test environment
    enabled: process.env.NODE_ENV !== 'test'
  },
  
  // App Configuration
  app: {
    name: 'CloudDash',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  }
};

// Helper functions
export const getGATrackingId = () => config.analytics.gaTrackingId;
export const getGTMContainerId = () => config.analytics.gtmContainerId;
export const isAnalyticsEnabled = () => config.analytics.enabled;
export const isDebugMode = () => config.analytics.debugMode;