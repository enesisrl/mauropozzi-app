import { 
  IonHeader,
  IonLabel,
  IonTabBar, 
  IonTabButton, 
  IonTabs
} from '@ionic/angular/standalone';
import { Auth } from '../../services/auth';
import { CommonModule, DatePipe, registerLocaleData } from '@angular/common';
import { Component, LOCALE_ID } from '@angular/core';
import { Router } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import localeIt from '@angular/common/locales/it';

registerLocaleData(localeIt);

@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    IonHeader,
    IonLabel,
    IonTabBar, 
    IonTabButton,
    IonTabs,
    RouterOutlet
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'it-IT' }
  ]
})
export class MainPage {
  currentUser: any = null;
  today = new Date();

  constructor(
    private auth: Auth,
    private router: Router
  ) {}

  ngOnInit() {
    this.auth.user$.subscribe(user => {
      this.currentUser = user;
    });
  }

  openProfile() {
    this.router.navigate(['/main/profile']);
  }
}