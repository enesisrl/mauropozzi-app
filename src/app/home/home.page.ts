import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import { Auth } from '../services/auth';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent],
})

export class HomePage {
  constructor(private auth: Auth) {}

  ngOnInit() {
    this.auth.isAuthenticated$.subscribe(isLoggedIn => {
      if (isLoggedIn) {
        console.log('Utente è loggato!');
      }
    });
  }
}