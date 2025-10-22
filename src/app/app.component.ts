import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { Platform } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  // constructor() {}
  
  // @todok debug
  constructor(private platform: Platform, private router: Router) {
    this.platform.ready().then(() => {
      this.router.navigateByUrl('/splash', { replaceUrl: true });
    });
  }
}
