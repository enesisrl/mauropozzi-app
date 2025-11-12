export const environment = {
  production: true,
  api: {
    baseUrl: 'https://www.mauropozzi.com/it/app/v1',
    endpoints: {
      login: '/auth-login/',
      profile: '/user-profile/',
      nutritionList: '/nutrition-list/',
      workoutList: '/workout-list/',
      workoutDetails: '/workout-details/',
    }
  },

  urls: {
    profile: 'https://www.mauropozzi.com/it/coaching/profile/',
    passwordRecovery: 'https://www.mauropozzi.com/it/coaching/password-recovery/'
  },

  ln: {
    generalLoading: 'Ci siamo quasi...'
  }
};