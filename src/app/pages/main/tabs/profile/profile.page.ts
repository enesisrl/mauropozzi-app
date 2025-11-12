import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonButton } from '@ionic/angular/standalone';
import { Auth } from '../../../../services/auth';
import { Browser } from '@capacitor/browser';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonContent, IonButton, CommonModule, FormsModule]
})
export class ProfilePage implements OnInit {

  currentUser: any = null;

  constructor(
    private auth: Auth,
  ) { }

  ngOnInit() {
    this.auth.user$.subscribe(user => {
      this.currentUser = user;
    });
  }

  getInitials(): string {
    if (!this.currentUser) return 'U';
    const first = this.currentUser.firstName?.charAt(0) || '';
    const last = this.currentUser.lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || 'MP';
  }

  async completeProfile() {
    await Browser.open({
      url: environment.urls.profile + '?ptk=' + this.auth.getToken(),
      windowName: '_system'
    });
  }

  getProgressPercentage(subscription: any): number {
    if (!subscription.payment_installments || !subscription.paid_installments) return 0;
    return Math.round((subscription.paid_installments / subscription.payment_installments) * 100);
  }

  async renewSubscription(subscription: any) {
    if (!subscription.rinnova_url) return;
    
    await Browser.open({
      url: subscription.rinnova_url,
      windowName: '_system'
    });
  }

  logout() {
    this.auth.logout();
  }
}
