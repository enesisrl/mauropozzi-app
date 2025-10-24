export const environment = {
  production: true,
  api: {
    baseUrl: 'https://www.mauropozzi.com/it/app/v1',
    endpoints: {
      login: '/auth-login/',
      profile: '/user-profile/'
    }
  },

  urls: {
    passwordRecovery: 'https://www.mauropozzi.com/it/coaching/password-recovery/'
  }
};