import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { 
  IonCard,
} from '@ionic/angular/standalone';
@Component({
  selector: 'app-workout-exercise-list',
  templateUrl: './workout-exercise-list.component.html',
  styleUrls: ['./workout-exercise-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonCard,
  ]
})
export class WorkoutExerciseListComponent {
  
  @Input() groups: any[] = [];


  onExerciseClick(exercise: any) {
    console.log('Exercise clicked:', exercise);
  }
}