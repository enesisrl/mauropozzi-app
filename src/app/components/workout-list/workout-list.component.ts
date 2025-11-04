import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IonButton, IonIcon } from '@ionic/angular/standalone';

export interface WorkoutListConfig {
  showActions?: boolean;
  showDetails?: boolean;
  maxItems?: number;
  emptyMessage?: string;
}

@Component({
  selector: 'app-workout-list',
  templateUrl: './workout-list.component.html',
  styleUrls: ['./workout-list.component.scss'],
  standalone: true,
  imports: [CommonModule, IonButton, IonIcon]
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

  get emptyMessage() {
    return this.config.emptyMessage || 'Nessuna scheda attiva al momento';
  }

  onWorkoutClick(workout: any) {
    console.log('Workout clicked:', workout);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  }
}