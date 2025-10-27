import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonButton } from '@ionic/angular/standalone';
import { Auth } from 'src/app/services/auth';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonContent, IonButton, CommonModule, FormsModule]
})
export class ProfilePage implements OnInit {

  constructor(
    private auth: Auth,
  ) { }

  ngOnInit() {
  }

  logout() {
    this.auth.logout();
  }
}
