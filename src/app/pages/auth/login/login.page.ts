import { Component } from '@angular/core';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent,
  IonButton,
  IonItem,
  IonInput,
  IonLabel
} from '@ionic/angular/standalone';
import { Auth } from '../../../services/auth';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AppConfig } from '../../../config/app.config';
import { Browser } from '@capacitor/browser';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonItem,
    IonInput,
    IonLabel,
    FormsModule
  ]
})
export class LoginPage {
  email: string = '';
  password: string = '';

  constructor(
    private auth: Auth,
    private router: Router
  ) {}

  async openExternalLink(url: string) {
    await Browser.open({ url: url });
  }

  login() {
    console.log('Login tentativo con:', this.email, this.password);
    
    // Per ora fake login, dopo metterai API vera
    this.auth.fakeLogin();
    
    // Vai alla home dopo login
    this.router.navigate(['/home'], { replaceUrl: true });
  }

  // Metodo rapido per testare
  openPasswordRecovery() {
    this.openExternalLink(AppConfig.urls.passwordRecovery);
  }
}