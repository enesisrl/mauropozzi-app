export const environment = {
  production: false,
  api: {
    baseUrl: 'http://mauropozzi.test:8074/it/app/v1',
    endpoints: {
      login: '/auth-login/',
      profile: '/user-profile/',
      nutritionList: '/nutrition-list/',
      workoutList: '/workout-list/',
      workoutDetails: '/workout-details/',
    }
  },

  urls: {
    profile: 'http://mauropozzi.test:8074/it/coaching/profile/',
    passwordRecovery: 'http://mauropozzi.test:8074/it/coaching/password-recovery/',
  },

  ln: {
    generalLoading: 'Ci siamo quasi...'
  }
};