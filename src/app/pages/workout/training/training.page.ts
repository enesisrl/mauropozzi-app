import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, AlertController } from '@ionic/angular';
import { ModalController } from '@ionic/angular/standalone';
import { Subscription } from 'rxjs';
import { WorkoutService, WorkoutExercise } from '../../../services/workout.service';
import { ImagePreloaderService } from '../../../services/image-preloader.service';
import { WorkoutExerciseExplanationPage } from '../exercise-explanation/exercise-explanation.page';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { 
  IonContent, 
  IonButton,
  IonSpinner,
  IonIcon
} from '@ionic/angular/standalone';
@Component({
  selector: 'app-workout-training',
  templateUrl: './training.page.html',
  styleUrls: ['./training.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent, 
    IonButton,
    IonSpinner,
    IonIcon
  ]
})
export class WorkoutTrainingPage implements OnInit, OnDestroy {
  
  workoutId: string = '';
  exerciseId: string = '';
  exercise: WorkoutExercise | null = null;
  step: 'exercise' | 'exercise-time' | 'rest' = 'exercise';
  
  // Timer properties
  timerSeconds: number = 0;
  timerInterval?: number;
  isTimerRunning: boolean = false;
  isPaused: boolean = false;
  
  isLoading = true;
  isOpeningModal = false;
  environment = environment;
  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private workoutService: WorkoutService,
    private loadingController: LoadingController,
    private imagePreloader: ImagePreloaderService,
    private alertController: AlertController,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    // Recupera i parametri dalla route
    this.route.params.subscribe(params => {
      this.workoutId = params['workoutId'];
      this.exerciseId = params['exerciseId'];
      if (this.workoutId && this.exerciseId) {
        this.loadTraining();
      }
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.stopTimer();
  }
  
  

  /* UI
  ------------------------------------------------------------ */
  
  workoutNext() {
    if (this.step === 'exercise') {
      // Passa da esercizio a timer (1:30)
      this.step = 'exercise-time';
      this.startTimer();
    } else if (this.step === 'exercise-time') {
      // Passa a recupero
      this.step = 'rest';
      this.startTimer();
    } else if (this.step === 'rest') {
      // Torna all'esercizio o vai al prossimo
      this.step = 'exercise';
      this.stopTimer();
    }
  }

  async exerciseExplanation() {
    // Blocco immediato per click multipli
    if (this.isOpeningModal) {
      return;
    }

    await WorkoutExerciseExplanationPage.openModal(
      this.modalController,
      this.workoutId,
      this.exerciseId,
      (isOpening) => { this.isOpeningModal = isOpening; }
    );
  }

  async workoutStop() {
    const alert = await this.alertController.create({
      header: "Esci dall'allenamento",
      message: 'Sei sicuro di voler interrompere l\'allenamento?',
      buttons: [
        {
          text: 'Annulla',
          role: 'cancel'
        },
        {
          text: 'Conferma',
          handler: () => {
            this.goBack();
          }
        }
      ]
    });

    await alert.present();
  }

  goBack() {
    this.router.navigate(['/workout-details', this.workoutId]);
  }


  /* Timer 
  ------------------------------------------------------------ */

  getFormattedTime(): string {
    const mins = Math.floor(this.timerSeconds / 60).toString().padStart(2, '0');
    const secs = (this.timerSeconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  }

  startTimer(): void {
    //@todok controllo se ho il tempo

    this.stopTimer();
    this.timerSeconds = 90; // @todok prendo il tempo dallo step
    this.startTimerInterval();
  }

  pauseTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = undefined;
    }
    this.isTimerRunning = false;
    this.isPaused = true;
  }

  resumeTimer(): void {
    if (this.isPaused && this.timerSeconds > 0) {
      this.startTimerInterval();
    } else {
      this.startTimer();
    }
  }

  private startTimerInterval(): void {
    this.isTimerRunning = true;
    this.isPaused = false;
    
    this.timerInterval = window.setInterval(() => {
      if (this.timerSeconds > 0) {
        this.timerSeconds--;
      } else {
        this.stopTimer();
      }
    }, 1000);
  }
  
  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = undefined;
    }
    this.isTimerRunning = false;
    this.isPaused = false;
  }
  
  
  /* Helpers
  ------------------------------------------------------------ */

  private async loadTraining() {
    const cachedExercise = this.workoutService.getCachedExerciseById(this.workoutId, this.exerciseId);
    
    if (cachedExercise) {
      this.exercise = cachedExercise;
      this.isLoading = false;
      
      this.preloadExerciseImage();
      return;
    }

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
          }
        }
      },
      complete: () => {
        this.isLoading = false;
        loading.dismiss();
      }
    });

    this.subscriptions.push(subscription);
  }

  private preloadExerciseImage(): void {
    if (!this.exercise?.thumb) return;

    this.imagePreloader.preloadImage(this.exercise.thumb).then(() => {
    });
  }
}