import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Browser } from '@capacitor/browser';
import { LoadingController } from '@ionic/angular/standalone';
import { 
  IonContent, 
  IonButton 
} from '@ionic/angular/standalone';
import { Auth } from '../../../../services/auth';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonButton,
    IonContent
  ]
})

export class ProfilePage implements OnInit, OnDestroy {
  currentUser: any = null;
  private userSubscription?: Subscription;

  constructor(
    private auth: Auth,
    private loadingController: LoadingController
  ) { }

  ngOnInit() {
    this.userSubscription = this.auth.user$.subscribe(user => {
      this.currentUser = user;
    });
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }
  
  
  /* UI
  ------------------------------------------------------------*/

  async completeProfile() {
    await Browser.open({
      url: environment.urls.profile + '?ptk=' + this.auth.getToken(),
      windowName: '_system'
    });
  }

  async renewSubscription(subscription: any) {
    if (!subscription.rinnova_url) return;
    
    await Browser.open({
      url: subscription.rinnova_url,
      windowName: '_system'
    });
  }

  async logout() {
    const loading = await this.loadingController.create({
      message: environment.ln.generalLoading,
      spinner: 'crescent'
    });
    
    await loading.present();
    
    try {
      await this.auth.logout();
    } finally {
      await loading.dismiss();
    }
  }
  
  
  /* Helpers
  ------------------------------------------------------------*/

  getInitials(): string {
    if (!this.currentUser) return 'U';
    const first = this.currentUser.firstName?.charAt(0) || '';
    const last = this.currentUser.lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || 'MP';
  }

  getProgressPercentage(subscription: any): number {
    if (!subscription.payment_installments || !subscription.paid_installments) return 0;
    return Math.round((subscription.paid_installments / subscription.payment_installments) * 100);
  }

}
