import { Auth } from '../../services/auth';
import { Component, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { IonContent } from '@ionic/angular/standalone';
import { Router } from '@angular/router';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
  standalone: true,
  imports: [IonContent]
})
export class SplashPage implements OnInit {

  constructor(
    private auth: Auth,
    private router: Router
  ) {}

  ngOnInit() {
    this.initializeApp();
  }

  async initializeApp() {
    const minSplashTime = this.delay(1500);

    try {
      // Se non sono loggato, vado subito al login
      const token = this.auth.getToken();
      if (!token) {
        await minSplashTime;
        this.router.navigate(['/login'], { replaceUrl: true });
        return;
      }
      
      // Se sono loggato provo a caricare i dati utente
      const [response] = await Promise.all([
        firstValueFrom(this.auth.loadProfile()),
        minSplashTime
      ]);

      if (response?.success) {
        this.router.navigate(['/main'], { replaceUrl: true });
      } 
      
      // In caso di errore faccio logout e vado al login
      else {
        this.auth.logout();
        this.router.navigate(['/login'], { replaceUrl: true });
      }
    } 
    
    // In caso di errore faccio logout e vado al login
    catch (error: any) {
      await minSplashTime;
      this.auth.logout();
      this.router.navigate(['/login'], { replaceUrl: true });
    }

  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}