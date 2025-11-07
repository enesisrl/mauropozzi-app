
import { Auth } from '../../../../services/auth';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkoutListComponent, WorkoutListConfig } from '../../../../components/workout-list/workout-list.component';
import { 
  IonContent, 
  IonHeader,
  IonToolbar,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-workouts',
  templateUrl: './workouts.page.html',
  styleUrls: ['./workouts.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    WorkoutListComponent
  ]
})
export class WorkoutsPage implements OnInit {

  currentUser: any = null;
  
  // Configurazione per la workout list nella home
  homeWorkoutConfig: WorkoutListConfig = {
  };

  constructor(
    private auth: Auth,
  ) { }

  ngOnInit() {
    this.auth.user$.subscribe(user => {
      this.currentUser = user;
    });
  }

}
