export const environment = {
  production: false,
  apiUrl: 'http://localhost:5001/api/v1',
  appName: '金鸿马物流安全平台',
  version: '1.0.0',
  defaultLanguage: 'zh-CN',
  supportedLanguages: ['zh-CN', 'en-US'],
  features: {
    enableAnalytics: false,
    enableOffline: true,
    enableNotifications: true,
    enablePushNotifications: false
  },
  security: {
    tokenStorageKey: 'logistics_platform_token',
    refreshTokenStorageKey: 'logistics_platform_refresh_token',
    userStorageKey: 'logistics_platform_user',
    sessionTimeout: 3600000, // 1 hour
    maxLoginAttempts: 5,
    lockoutDuration: 1800000 // 30 minutes
  },
  ui: {
    defaultTheme: 'light',
    enableDarkMode: true,
    responsiveBreakpoints: {
      mobile: 768,
      tablet: 1024,
      desktop: 1200
    }
  }
};