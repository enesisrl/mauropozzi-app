import { authGuard } from './guards/auth-guard';
import { subscriptionGuard } from './guards/subscription-guard';
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/main',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'no-subscription',
    loadComponent: () => import('./pages/auth/no-subscription/no-subscription.page').then( m => m.NoSubscriptionPage)
  },
  {
    path: 'main',
    loadComponent: () => import('./pages/main/main.page').then( m => m.MainPage),
    canActivate: [authGuard, subscriptionGuard],
    children: [
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
        redirectTo: '/main/workouts',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'workout-details/:id',
    loadComponent: () => import('./pages/workout/details/details.page').then( m => m.WorkoutDetailsPage),
    canActivate: [authGuard, subscriptionGuard]
  },
  {
    path: 'workout-details/:workoutId/:exerciseId',
    loadComponent: () => import('./pages/workout/exercise-details/exercise-details.page').then( m => m.WorkoutExerciseDetailsPage),
    canActivate: [authGuard, subscriptionGuard]
  },
  {
    path: 'workout-details/:workoutId/:exerciseId/explanation',
    loadComponent: () => import('./pages/workout/exercise-explanation/exercise-explanation.page').then( m => m.WorkoutExerciseExplanationPage),
    canActivate: [authGuard, subscriptionGuard]
  },
];
