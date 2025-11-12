import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
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
  
  @Input() workouts: any[] = [];
  
  constructor(private router: Router) {}

  onWorkoutClick(workout: any) {
    this.router.navigate(['/workout-details', workout.id]);
  }
}