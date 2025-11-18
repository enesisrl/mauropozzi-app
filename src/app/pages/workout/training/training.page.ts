import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController, AlertController } from '@ionic/angular/standalone';
import { WorkoutService, WorkoutExercise } from '../../../services/workout.service';
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private workoutService: WorkoutService,
    private alertController: AlertController,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    // Recupera i parametri dalla route
    this.route.params.subscribe(async params => {
      this.workoutId = params['workoutId'];
      this.exerciseId = params['exerciseId'];
      if (this.workoutId && this.exerciseId) {
        this.exercise = await this.workoutService.loadExercise(this.workoutId, this.exerciseId);
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy() {
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
    // TODO: Implementare controllo tempo step dal backend
    this.stopTimer();
    // TODO: Recuperare tempo dal backend per ogni step
    this.timerSeconds = 90;
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
}