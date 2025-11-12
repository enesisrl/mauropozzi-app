import { authGuard } from './guards/auth-guard';
import { subscriptionGuard } from './guards/subscription-guard';
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/splash',
    pathMatch: 'full'
  },
  {
    path: 'splash',
    loadComponent: () => import('./pages/splash/splash.page').then(m => m.SplashPage)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'no-subscription',
    loadComponent: () => import('./pages/no-subscription/no-subscription.page').then( m => m.NoSubscriptionPage)
  },
  {
    path: 'main',
    loadComponent: () => import('./pages/main/main.page').then( m => m.MainPage),
    canActivate: [authGuard, subscriptionGuard],
    children: [
      // {
      //   path: 'home',
      //   loadComponent: () => import('./pages/main/tabs/home/home.page').then( m => m.HomePage),
      //   canActivate: [authGuard, subscriptionGuard]
      // },
      {
        path: 'workouts',
        loadComponent: () => import('./pages/main/tabs/workouts/workouts.page').then( m => m.WorkoutsPage),
        canActivate: [authGuard, subscriptionGuard]
      },
      {
        path: 'nutrition',
        loadComponent: () => import('./pages/main/tabs/nutrition/nutrition.page').then( m => m.NutritionPage),
        canActivate: [authGuard, subscriptionGuard]
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/main/tabs/profile/profile.page').then( m => m.ProfilePage),
        canActivate: [authGuard, subscriptionGuard]
      },
      {
        path: 'calendar',
        loadComponent: () => import('./pages/main/tabs/calendar/calendar.page').then( m => m.CalendarPage),
        canActivate: [authGuard, subscriptionGuard]
      },
      {
        path: '',
        // redirectTo: '/main/home',
        redirectTo: '/main/workouts',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'workout-details/:id',
    loadComponent: () => import('./pages/workout-details/workout-details.page').then( m => m.WorkoutDetailsPage),
    canActivate: [authGuard, subscriptionGuard]
  },
  {
    path: 'workout-details/:workoutId/:exerciseId',
    loadComponent: () => import('./pages/workout-exercise-details/workout-exercise-details.page').then( m => m.WorkoutExerciseDetailsPage),
    canActivate: [authGuard, subscriptionGuard]
  },
];
