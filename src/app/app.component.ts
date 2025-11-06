import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor(private router: Router) {
    // 🐛 DEBUG: Forza sempre il passaggio allo splash
    // Rimuovi questa riga quando non serve più per debug
    this.router.navigate(['/splash'], { replaceUrl: true });
  }
}
