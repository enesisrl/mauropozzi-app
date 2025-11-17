import { Auth } from './services/auth';
import { Component, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';import { ImagePreloaderService } from './services/image-preloader.service';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { SplashScreen } from '@capacitor/splash-screen';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {
  
  constructor(
    private auth: Auth,
    private router: Router,
    private imagePreloader: ImagePreloaderService
  ) {}

  ngOnInit() {
    this.initializeApp();
  }

  async initializeApp(): Promise<void> {
    // Mostra splash screen nativa
    await SplashScreen.show({
      showDuration: 1500,
      autoHide: false
    });

    // Inizializza app e precarica immagini
    try {
      await this.imagePreloader.preloadEssentialImages();
    } catch (error) {
    }

    try {
      // Controlla se c'è un token salvato
      const token = this.auth.getToken();
      if (!token) {
        // Nessun token, vai al login
        await this.navigateToLogin();
        return;
      }
      
      // C'è un token, prova a caricare il profilo utente
      try {
        const response = await firstValueFrom(this.auth.loadProfile());
        
        if (response?.success) {
          // Profilo caricato con successo, vai al main
          await this.navigateToMain();
        } else {
          // Profilo non valido, logout e vai al login
          this.auth.logout();
          await this.navigateToLogin();
        }
      } catch (error: any) {
        // Errore nel caricamento profilo, logout e vai al login
        this.auth.logout();
        await this.navigateToLogin();
      }
    } catch (error) {
      // Errore durante l'inizializzazione, vai al login
      await this.navigateToLogin();
    }
  }

  private async navigateToLogin(): Promise<void> {
    await SplashScreen.hide();
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  private async navigateToMain(): Promise<void> {
    await SplashScreen.hide();
    this.router.navigate(['/main'], { replaceUrl: true });
  }
}
