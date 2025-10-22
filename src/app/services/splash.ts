import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class Splash {
  constructor(
    private router: Router
  ) {}

  private readonly SPLASH_SHOWN_KEY = 'splash_shown_today';
  
  shouldShowSplash(): boolean {
    const splashShownToday = localStorage.getItem(this.SPLASH_SHOWN_KEY);
    const today = new Date().toDateString();
    return splashShownToday !== today;
  }
  
  markSplashAsShown(): void {
    const today = new Date().toDateString();
    localStorage.setItem(this.SPLASH_SHOWN_KEY, today);
  }

  onSplashComplete(): void {
    this.markSplashAsShown();
    this.router.navigate(['/home'], { replaceUrl: true });
  }
}