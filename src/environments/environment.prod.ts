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
      storeWorkoutExerciseProgress: '/store-workout-exercise-progress/',
    }
  },

  cache: {
    userData: 5 * 60 * 1000,
    workoutDetailsData: 5 * 60 * 1000,
  },

  urls: {
    profile: 'https://www.mauropozzi.com/it/coaching/profile/',
    passwordRecovery: 'https://www.mauropozzi.com/it/coaching/password-recovery/'
  },

  ln: {
    generalLoading: 'Ci siamo quasi...'
  }
};