import { Injectable } from '@angular/core';
import { ImagePreloaderService } from './image-preloader.service';

@Injectable({
  providedIn: 'root'
})
export class AppInit {

  constructor(private imagePreloader: ImagePreloaderService) {}

  /**
   * Inizializza l'app con preload delle immagini
   */
  async initialize(): Promise<void> {
    try {
      // Precarica immagini essenziali
      await this.imagePreloader.preloadEssentialImages();
    } catch (error) {
    }
  }
}