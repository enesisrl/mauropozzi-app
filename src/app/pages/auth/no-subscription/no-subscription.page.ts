import { Auth } from '../../../services/auth';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { 
  IonContent, 
  IonButton, 
  IonIcon 
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-no-subscription',
  templateUrl: './no-subscription.page.html',
  styleUrls: ['./no-subscription.page.scss'],
  imports: [
    IonButton,
    IonContent,
    IonIcon
  ]
})

export class NoSubscriptionPage implements OnInit, OnDestroy {
  private userSubscription?: Subscription;

  constructor(
    private auth: Auth,
    private router: Router
  ) {
  }

  ngOnInit() {
    // Monitora continuamente lo stato dell'utente
    this.userSubscription = this.auth.user$.subscribe(user => {
      if (user && user.subscribed) {
        // Se l'utente diventa attivo, vai alla home
        this.router.navigate(['/main'], { replaceUrl: true });
      }
    });
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  
  /* UI
  ------------------------------------------------------------*/

  logout() {
    this.auth.logout();
    this.router.navigate(['/login'], { replaceUrl: true });
  }
}