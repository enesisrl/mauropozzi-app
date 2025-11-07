import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../services/auth';
import { map, take } from 'rxjs/operators';

export const subscriptionGuard = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  return auth.user$.pipe(
    take(1),
    map(user => {
      if (!user) {
        // Se non c'è utente, vai al login
        router.navigate(['/login'], { replaceUrl: true });
        return false;
      }

      if (!user.subscribed) {
        // Se l'utente non è abbonato, vai alla pagina di blocco
        router.navigate(['/no-subscription'], { replaceUrl: true });
        return false;
      }

      return true;
    })
  );
};