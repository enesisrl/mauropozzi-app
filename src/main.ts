import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { provideHttpClient } from '@angular/common/http';
import { addIcons } from 'ionicons';
import { 
  addOutline,
  arrowForwardOutline,
  caretForwardCircleOutline, 
  chevronBackOutline, 
  chevronDownOutline,
  chevronForwardOutline, 
  exitOutline,
  hourglassOutline,
  pause,
  play,
  refreshOutline,
  reloadOutline,
  returnDownForwardOutline,
} from 'ionicons/icons';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

/* Add icons to the library */
addIcons({
  'add-outline': addOutline,
  'arrow-forward-outline': arrowForwardOutline,
  'caret-forward-circle-outline': caretForwardCircleOutline,
  'chevron-back-outline': chevronBackOutline,
  'chevron-down-outline': chevronDownOutline,
  'chevron-forward-outline': chevronForwardOutline,
  'exit-outline': exitOutline,
  'hourglass-outline': hourglassOutline,
  'pause': pause,
  'play': play,
  'refresh-outline': refreshOutline,
  'reload-outline': reloadOutline,
  'return-down-forward-outline': returnDownForwardOutline,
});

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(),
  ],
});
