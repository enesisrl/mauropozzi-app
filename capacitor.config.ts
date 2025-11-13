import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mauropozzi.app',
  appName: 'mauropozzi-app',
  webDir: 'www',
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,  // Disabilitiamo l'auto-show per gestirlo manualmente
      launchAutoHide: false,
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true
    }
  }
};

export default config;
