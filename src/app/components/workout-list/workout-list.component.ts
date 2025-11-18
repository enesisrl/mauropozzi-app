import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { WorkoutListItem } from '../../services/workout.service';
import { 
  IonCard,
  IonIcon
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-workout-list',
  templateUrl: './workout-list.component.html',
  styleUrls: ['./workout-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonCard,
    IonIcon
  ]
})

export class WorkoutListComponent {
  @Input() workouts: WorkoutListItem[] = [];
  
  constructor(private router: Router) {}


  /* UI
  ------------------------------------------------------------*/

  onWorkoutClick(workout: WorkoutListItem) {
    this.router.navigate(['/workout-details', workout.id]);
  }


  /* Helpers
  ------------------------------------------------------------*/

  trackById(index: number, item: WorkoutListItem): string {
    return item.id;
  }
}