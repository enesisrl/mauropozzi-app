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
  timerMinutes: number = 0;
  timerSeconds: number = 0;
  timerInterval?: number;
  isTimerRunning: boolean = false;
  
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
    this.clearTimer();
  }

  /**
   * Carica i dettagli dell'esercizio dalla cache
   */
  async loadTraining(reset: boolean = false) {
    if (reset) {
      this.workoutService.clearWorkoutDetailsCache();
    }

    // Prima prova a caricare dalla cache
    const cachedExercise = this.workoutService.getCachedExerciseById(this.workoutId, this.exerciseId);
    
    if (cachedExercise) {
      this.exercise = cachedExercise;
      this.isLoading = false;
      
      this.preloadExerciseImage();
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
  

  workoutNext() {
    if (this.step === 'exercise') {
      // Passa da esercizio a timer (1:30)
      this.step = 'exercise-time';
      this.startTimer(1, 30); // 1 minuto e 30 secondi
    } else if (this.step === 'exercise-time') {
      // Passa a recupero
      this.step = 'rest';
      this.startTimer(1, 30); // 1 minuto e 30 secondi di recupero
    } else if (this.step === 'rest') {
      // Torna all'esercizio o vai al prossimo
      this.step = 'exercise';
      this.clearTimer();
    }
  }

  timerRestart() {
    if (this.step === 'exercise-time' || this.step === 'rest') {
      this.startTimer(1, 30); // 1:30 per ora, poi integreremo la logica corretta
    }
  }
  
  timerStop() {
    this.clearTimer();
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

  /**
   * Precarica l'immagine dell'esercizio per migliorare le performance
   */
  private preloadExerciseImage(): void {
    if (!this.exercise?.thumb) return;

    this.imagePreloader.preloadImage(this.exercise.thumb).then(() => {
    });
  }

  /**
   * Avvia il timer con minuti e secondi specificati
   */
  startTimer(minutes: number, seconds: number): void {
    this.clearTimer();
    this.timerMinutes = minutes;
    this.timerSeconds = seconds;
    this.isTimerRunning = true;
    
    this.timerInterval = window.setInterval(() => {
      if (this.timerSeconds > 0) {
        this.timerSeconds--;
      } else if (this.timerMinutes > 0) {
        this.timerMinutes--;
        this.timerSeconds = 59;
      } else {
        // Timer finito
        this.clearTimer();
        this.onTimerComplete();
      }
    }, 1000);
  }

  /**
   * Ferma e pulisce il timer
   */
  clearTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = undefined;
    }
    this.isTimerRunning = false;
  }

  /**
   * Chiamata quando il timer arriva a zero
   */
  private onTimerComplete(): void {
    // Per ora non facciamo nulla, poi aggiungeremo logica
    console.log('Timer completato!');
  }

  /**
   * Formatta il tempo per il display
   */
  getFormattedTime(): string {
    const mins = this.timerMinutes.toString().padStart(2, '0');
    const secs = this.timerSeconds.toString().padStart(2, '0');
    return `${mins}:${secs}`;
  }

}