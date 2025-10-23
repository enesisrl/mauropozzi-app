import { Component, OnInit } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { firstValueFrom } from 'rxjs';

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
      const token = this.auth.getToken();
      if (!token) {
        await minSplashTime;
        this.router.navigate(['/login'], { replaceUrl: true });
        return;
      }

      // ✅ METODO MODERNO
      const [response] = await Promise.all([
        firstValueFrom(this.auth.loadProfile()),
        minSplashTime
      ]);

      if (response?.success) {
        this.router.navigate(['/home'], { replaceUrl: true });
      } else {
        this.auth.logout();
        this.router.navigate(['/login'], { replaceUrl: true });
      }
    } catch (error: any) {
      await minSplashTime;
      this.auth.logout();
      this.router.navigate(['/login'], { replaceUrl: true });
    }

  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}