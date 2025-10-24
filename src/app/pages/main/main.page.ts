import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { 
  IonTabs, 
  IonTabBar, 
  IonTabButton, 
  IonIcon, 
  IonLabel,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonRippleEffect,
  IonButton,
  IonAvatar
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { home, person, calendar, barbell, settings, notifications } from 'ionicons/icons';
import { Auth } from '../../services/auth';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet, 
    IonTabs,
    IonTabBar, 
    IonTabButton,
    IonIcon,
    IonLabel,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonRippleEffect,
    IonButton,
    IonAvatar
  ]
})
export class MainPage {
  currentUser: any = null;

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