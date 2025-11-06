import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

import { 
  IonCard,
} from '@ionic/angular/standalone';

export interface WorkoutListConfig {
  maxItems?: number;
}

@Component({
  selector: 'app-workout-list',
  templateUrl: './workout-list.component.html',
  styleUrls: ['./workout-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonCard
  ]
})
export class WorkoutListComponent {
  
  @Input() workouts: any[] = [];
  @Input() config: WorkoutListConfig = {};
  
  @Output() workoutAction = new EventEmitter<any>();

  get displayWorkouts() {
    if (this.config.maxItems) {
      return this.workouts.slice(0, this.config.maxItems);
    }
    return this.workouts;
  }

  onWorkoutClick(workout: any) {
    console.log('Workout clicked:', workout);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  }
}