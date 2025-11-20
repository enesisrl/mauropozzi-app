import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { WorkoutExerciseListComponent } from '../../../components/workout-exercise-list/workout-exercise-list.component';
import { WorkoutService, WorkoutDetail } from '../../../services/workout.service';
import { 
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent, 
  IonHeader,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-workout-details',
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent, 
    IonHeader,
    IonToolbar,
    IonButton,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonRefresher,
    IonRefresherContent,
    IonSpinner,
    WorkoutExerciseListComponent
  ]
})

export class WorkoutDetailsPage implements OnInit, OnDestroy {
  workoutId: string = '';
  workout: WorkoutDetail | null = null;
  initialLoad = true;
  isLoading = false;
  environment = environment;
  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private workoutService: WorkoutService
  ) {}

  ngOnInit() {
    // Recupera l'ID dalla route
    this.route.params.subscribe(async params => {
      this.workoutId = params['id'];
      if (this.workoutId) {
        this.isLoading = true;
        this.workout = await this.workoutService.loadWorkoutDetails(this.workoutId);
        this.initialLoad = false;
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  
  async onRefresh(event: any) {
    if (this.workoutId) {
      this.isLoading = true;
      this.workout = await this.workoutService.loadWorkoutDetails(this.workoutId, true);
      this.isLoading = false;
    }
    
    setTimeout(() => {
      (event.target as any)?.complete();
    }, 500);
  }
  
  /* UI
  ------------------------------------------------------------*/

  goBack() {
    this.router.navigate(['/main']);
  }
}