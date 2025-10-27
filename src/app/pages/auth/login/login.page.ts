import { 
  AlertController,
  IonButton,
  IonContent,
  IonInput,
  IonSpinner,
  LoadingController
} from '@ionic/angular/standalone';
import { Auth } from '../../../services/auth';
import { Browser } from '@capacitor/browser';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonButton,
    IonContent,
    IonInput,
    IonSpinner
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
          this.router.navigate(['/main/home'], { replaceUrl: true });
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
    this.openExternalLink(environment.urls.passwordRecovery);
  }
}