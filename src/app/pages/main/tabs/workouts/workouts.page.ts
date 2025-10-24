import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-workouts',
  templateUrl: './workouts.page.html',
  styleUrls: ['./workouts.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class WorkoutsPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
