import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';

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
        loadComponent: () => import('./pages/main/tabs/home/home.page').then( m => m.HomePage)
      },
      {
        path: 'workouts',
        loadComponent: () => import('./pages/main/tabs/workouts/workouts.page').then( m => m.WorkoutsPage)
      },
      {
        path: 'nutrition',
        loadComponent: () => import('./pages/main/tabs/nutrition/nutrition.page').then( m => m.NutritionPage)
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/main/tabs/profile/profile.page').then( m => m.ProfilePage)
      },
      {
        path: '',
        redirectTo: '/main/home',
        pathMatch: 'full'
      }
    ]
  }
];
