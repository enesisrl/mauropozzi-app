export const environment = {
  production: false,
  api: {
    baseUrl: 'http://mauropozzi.test:8074/it/app/v1',
    endpoints: {
      login: '/auth-login/',
      profile: '/user-profile/'
    }
  },

  urls: {
    passwordRecovery: 'http://mauropozzi.test:8074/it/coaching/password-recovery/',
  }
};