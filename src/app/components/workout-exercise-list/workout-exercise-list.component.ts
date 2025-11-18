import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { 
  IonCard,
  IonIcon
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-workout-exercise-list',
  templateUrl: './workout-exercise-list.component.html',
  styleUrls: ['./workout-exercise-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonCard,
    IonIcon
  ]
})

export class WorkoutExerciseListComponent {
  @Input() workoutId: string = '';
  @Input() groups: any[] = [];

  constructor(private router: Router) {}

  
  /* UI
  ------------------------------------------------------------*/

  onExerciseClick(group: any) {
    if(group.esercizi[0].id) { 
      this.router.navigate(['/workout-details', this.workoutId, group.esercizi[0].id]);
    }
  }
}