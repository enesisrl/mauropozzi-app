import { authGuard } from './guards/auth-guard';
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
    path: 'main',
    loadComponent: () => import('./pages/main/main.page').then( m => m.MainPage),
    canActivate: [authGuard],
    children: [
      {
        path: 'home',
        loadComponent: () => import('./pages/main/tabs/home/home.page').then( m => m.HomePage),
        canActivate: [authGuard]
      },
      {
        path: 'workouts',
        loadComponent: () => import('./pages/main/tabs/workouts/workouts.page').then( m => m.WorkoutsPage),
        canActivate: [authGuard]
      },
      {
        path: 'nutrition',
        loadComponent: () => import('./pages/main/tabs/nutrition/nutrition.page').then( m => m.NutritionPage),
        canActivate: [authGuard]
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/main/tabs/profile/profile.page').then( m => m.ProfilePage),
        canActivate: [authGuard]
      },
      {
        path: 'calendar',
        loadComponent: () => import('./pages/main/tabs/calendar/calendar.page').then( m => m.CalendarPage),
        canActivate: [authGuard]
      },
      {
        path: '',
        redirectTo: '/main/home',
        pathMatch: 'full'
      }
    ]
  }
];
