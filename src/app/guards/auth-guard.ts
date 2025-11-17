import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../services/auth';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    console.log('AuthGuard: utente non autenticato, redirect al login');
    router.navigate(['/login'], { replaceUrl: true });
    return false;
  }

  // Smart refresh automatico prima di accedere alla pagina protetta
  try {
    await authService.smartRefresh();
    return true;
  } 
  
  // Se lo smart refresh fallisce per problemi di auth, redirect al login
  catch (error) {
    console.log('AuthGuard: errore durante lo smart refresh, redirect al login');
    router.navigate(['/login'], { replaceUrl: true });
    return false;
  }
};