import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImagePreloaderService {
  
  private preloadedImages: Map<string, HTMLImageElement> = new Map();

  constructor() {}

  /**
   * Precarica una singola immagine
   */
  preloadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      // Se già precaricata, restituisci quella in cache
      if (this.preloadedImages.has(src)) {
        resolve(this.preloadedImages.get(src)!);
        return;
      }

      const img = new Image();
      
      img.onload = () => {
        this.preloadedImages.set(src, img);
        resolve(img);
      };
      
      img.onerror = (error) => {
        reject(error);
      };
      
      img.src = src;
    });
  }

  /**
   * Precarica multiple immagini
   */
  preloadImages(srcs: string[]): Promise<HTMLImageElement[]> {
    const promises = srcs.map(src => this.preloadImage(src));
    return Promise.all(promises);
  }

  /**
   * Precarica le immagini essenziali dell'app
   */
  preloadEssentialImages(): Promise<HTMLImageElement[]> {
    const essentialImages = [
      'assets/images/icon-pdf.svg',
      'assets/images/icon-nutrition.svg',
      'assets/images/icon-workout.svg',
      'assets/images/icon-calendar-black.svg',
      'assets/images/icon-checked.svg',
      'assets/images/icon-unchecked.svg',
      'assets/images/icon-home.svg',
      'assets/images/icon-profile.svg'
    ];

    return this.preloadImages(essentialImages)
      .then((images) => {
        return images;
      })
      .catch((error) => {
        throw error;
      });
  }

  /**
   * Precarica le immagini degli esercizi (quando disponibili)
   */
  preloadExerciseImages(exerciseUrls: string[]): Promise<HTMLImageElement[]> {
    return this.preloadImages(exerciseUrls);
  }

  /**
   * Verifica se un'immagine è già stata precaricata
   */
  isPreloaded(src: string): boolean {
    return this.preloadedImages.has(src);
  }

  /**
   * Ottiene un'immagine precaricata
   */
  getPreloadedImage(src: string): HTMLImageElement | null {
    return this.preloadedImages.get(src) || null;
  }

  /**
   * Pulisce la cache delle immagini
   */
  clearCache(): void {
    this.preloadedImages.clear();
  }
}