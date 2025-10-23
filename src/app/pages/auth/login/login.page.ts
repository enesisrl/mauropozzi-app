import { Component } from '@angular/core';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent,
  IonButton,
  IonItem,
  IonInput,
  IonLabel,
  IonSpinner,
  LoadingController,
  AlertController
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
    IonSpinner,
    FormsModule
  ]
})
export class LoginPage {
  email: string = '';
  password: string = '';
  isLoading: boolean = false;

  constructor(
    private auth: Auth,
    private router: Router,
    private loadingController: LoadingController,
    private alertController: AlertController
  ) {}

  async login() {
    if (!this.email || !this.password) {
      this.showAlert('Ops!', 'Inserisci e-mail e password per continuare');
      return;
    }

    this.isLoading = true;
    const loading = await this.loadingController.create({
      message: 'Ci siamo quasi…',
      spinner: 'crescent'
    });
    await loading.present();

    this.auth.login(this.email, this.password).subscribe({
      next: async (response) => {
        await loading.dismiss();
        this.isLoading = false;
        
        if (response.success) {
          this.router.navigate(['/home'], { replaceUrl: true });
        } else {
          this.showAlert('Ops!', response.message || 'Sembra che le tue credenziali non siano corrette, riprova.');
        }
      },
      error: async (error) => {
        await loading.dismiss();
        this.isLoading = false;
        this.showAlert('Ops!', "Qualcosa è andato storto. Riprova tra poco.");
      }
    });
  }
  
  private async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  async openExternalLink(url: string) {
    await Browser.open({ url: url });
  }

  openPasswordRecovery() {
    this.openExternalLink(AppConfig.urls.passwordRecovery);
  }
}