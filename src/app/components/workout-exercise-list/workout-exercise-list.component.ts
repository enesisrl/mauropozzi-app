import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { 
  IonContent, 
  IonHeader,
  IonToolbar,
  IonLabel,
  IonItem,
  IonIcon,
  IonCardHeader,
  IonCardContent,
  IonCard,
  IonChip,
  IonButton,
  IonThumbnail,
  IonList,
  IonCardTitle,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
} from '@ionic/angular/standalone';
@Component({
  selector: 'app-workout-exercise-list',
  templateUrl: './workout-exercise-list.component.html',
  styleUrls: ['./workout-exercise-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonCard,
    IonContent, 
    IonHeader,
    IonToolbar,
    IonLabel,
    IonItem,
    IonIcon,
    IonCardHeader,
    IonCardContent,
    IonChip,
    IonButton,
    IonThumbnail,
    IonList,
    IonCardTitle,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonRefresher,
    IonRefresherContent,
    IonSpinner,
  ]
})
export class WorkoutExerciseListComponent {
  
  @Input() groups: any[] = [];


  onExerciseClick(exercise: any) {
    console.log('Exercise clicked:', exercise);
  }
}