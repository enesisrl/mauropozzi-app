import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { WorkoutService, WorkoutDetail, WorkoutDay, WorkoutExercise } from '../../services/workout.service';
import { ImagePreloaderService } from '../../services/image-preloader.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { WorkoutExerciseListComponent } from '../../components/workout-exercise-list/workout-exercise-list.component';
import { 
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
} from '@ionic/angular/standalone';
@Component({
  selector: 'app-workout-details',
  templateUrl: './workout-details.page.html',
  styleUrls: ['./workout-details.page.scss'],
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
  isLoading = true;
  environment = environment;
  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private workoutService: WorkoutService,
    private loadingController: LoadingController,
    private imagePreloader: ImagePreloaderService
  ) {}

  ngOnInit() {
    // Recupera l'ID dalla route
    this.route.params.subscribe(params => {
      this.workoutId = params['id'];
      if (this.workoutId) {
        this.loadWorkoutDetails();
      }
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Carica i dettagli della scheda
   */
  async loadWorkoutDetails() {
    const loading = await this.loadingController.create({
      message: environment.ln.generalLoading
    });
    await loading.present();

    const subscription = this.workoutService.getWorkoutDetails(this.workoutId).subscribe({
      next: (response) => {
        if (response.success && response.item) {
          this.workout = response.item;
          
          // Preload exercise images
          this.preloadExerciseImages();
        }
        this.isLoading = false;
        loading.dismiss();
      },
      error: (error) => {
        this.isLoading = false;
        loading.dismiss();
      }
    });

    this.subscriptions.push(subscription);
  }

  /**
   * Ricarica i dati
   */
  async onRefresh(event: any) {
    await this.loadWorkoutDetails();
    if (event?.target) {
      event.target.complete();
    }
  }

  /**
   * Naviga indietro
   */
  goBack() {
    this.router.navigate(['/main']);
  }

  /**
   * Formatta la durata in minuti e secondi
   */
  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  /**
   * Precarica le immagini degli esercizi per migliorare le performance
   */
  private preloadExerciseImages(): void {
    if (!this.workout?.esercizi) return;

    const exerciseImages: string[] = [];
    
    // Raccoglie tutte le immagini degli esercizi
    this.workout.esercizi.forEach((giorno: WorkoutDay) => {
      if (giorno.gruppi) {
        giorno.gruppi.forEach(gruppo => {
          if (gruppo.esercizi) {
            gruppo.esercizi.forEach((esercizio: WorkoutExercise) => {
              if (esercizio.thumb) {
                exerciseImages.push(esercizio.thumb);
              }
            });
          }
        });
      }
    });

    // Precarica le immagini in batch
    if (exerciseImages.length > 0) {
      this.imagePreloader.preloadImages(exerciseImages).then(() => {
      });
    }
  }
}