import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { WorkoutService, WorkoutExercise } from '../../services/workout.service';
import { ImagePreloaderService } from '../../services/image-preloader.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
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
  selector: 'app-workout-exercise-details',
  templateUrl: './workout-exercise-details.page.html',
  styleUrls: ['./workout-exercise-details.page.scss'],
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
  ]
})
export class WorkoutExerciseDetailsPage implements OnInit, OnDestroy {
  
  workoutId: string = '';
  exerciseId: string = '';
  exercise: WorkoutExercise | null = null;
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
    // Recupera i parametri dalla route
    this.route.params.subscribe(params => {
      this.workoutId = params['workoutId'];
      this.exerciseId = params['exerciseId'];
      if (this.workoutId && this.exerciseId) {
        this.loadExerciseDetails();
      }
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Carica i dettagli dell'esercizio dalla cache
   */
  async loadExerciseDetails() {
    // Prima prova a caricare dalla cache
    const cachedExercise = this.workoutService.getCachedExerciseById(this.workoutId, this.exerciseId);
    
    if (cachedExercise) {
      // Trova l'esercizio nella cache
      this.exercise = cachedExercise;
      this.isLoading = false;
      
      // Precarica l'immagine dell'esercizio
      this.preloadExerciseImage();
      
      console.log('Exercise loaded from cache');
      return;
    }

    // Se non è in cache, prova a caricare l'intero workout e poi l'esercizio
    const loading = await this.loadingController.create({
      message: environment.ln.generalLoading
    });
    await loading.present();

    const subscription = this.workoutService.getWorkoutDetails(this.workoutId).subscribe({
      next: (response) => {
        if (response.success && response.item) {
          // Ora cerca l'esercizio nel workout appena caricato
          const exercise = this.workoutService.getCachedExerciseById(this.workoutId, this.exerciseId);
          if (exercise) {
            this.exercise = exercise;
            this.preloadExerciseImage();
          } else {
            console.error('Exercise not found in workout');
          }
        }
        this.isLoading = false;
        loading.dismiss();
      },
      error: (error) => {
        console.error('Error loading workout:', error);
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
    await this.loadExerciseDetails();
    if (event?.target) {
      event.target.complete();
    }
  }

  /**
   * Naviga indietro
   */
  goBack() {
    this.router.navigate(['/workout-details', this.workoutId]);
  }
  

  /**
   * Precarica l'immagine dell'esercizio per migliorare le performance
   */
  private preloadExerciseImage(): void {
    if (!this.exercise?.thumb) return;

    const exerciseImageUrl = `${environment.api.baseUrl.replace('/v1', '')}/assets/media/allenamento_esercizio/${this.exercise.thumb}`;

    // Precarica l'immagine
    this.imagePreloader.preloadImage(exerciseImageUrl).then(() => {
      console.log('Exercise image preloaded successfully');
    }).catch(error => {
      console.warn('Exercise image failed to preload:', error);
    });
  }

  exerciseExplanation() {
    
  }
  workoutStart() {
    
  }
}