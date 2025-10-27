import { 
  IonHeader,
  IonLabel,
  IonRippleEffect,
  IonTabBar, 
  IonTabButton, 
  IonTabs
} from '@ionic/angular/standalone';
import { Auth } from '../../services/auth';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonLabel,
    IonRippleEffect,
    IonTabBar, 
    IonTabButton,
    IonTabs,
    RouterOutlet
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