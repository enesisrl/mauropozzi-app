import { Component, OnInit } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { Splash } from '../../services/splash';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
  standalone: true,
  imports: [IonContent]
})
export class SplashPage implements OnInit {

  constructor(private splashService: Splash) {}

  ngOnInit() {
      this.showSplash();
  }

  private async showSplash() {
    if(this.splashService.shouldShowSplash()) {
      await this.delay(1500);
    }
    this.splashService.onSplashComplete();
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}