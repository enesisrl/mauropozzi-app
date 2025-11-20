import { addIcons } from 'ionicons';
import { AppComponent } from './app/app.component';
import { bootstrapApplication } from '@angular/platform-browser';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { provideHttpClient } from '@angular/common/http';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { routes } from './app/app.routes';
import { 
  addOutline,
  arrowForwardOutline,
  caretForwardCircleOutline, 
  chevronBackOutline, 
  chevronDownOutline,
  chevronForwardOutline, 
  exitOutline,
  hourglassOutline,
  lockClosed,
  pause,
  play,
  refreshOutline,
  reloadOutline,
  returnDownForwardOutline,
} from 'ionicons/icons';

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
  'lock-closed': lockClosed,
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
