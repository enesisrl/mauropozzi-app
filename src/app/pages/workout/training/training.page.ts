import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController, AlertController } from '@ionic/angular/standalone';
import { WorkoutService, WorkoutExerciseDetails } from '../../../services/workout.service';
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
  exercise: WorkoutExerciseDetails | null = null;
  nextExercise: WorkoutExerciseDetails | null = null;

  step: 'exercise' | 'rest' = 'exercise';
  hasTimer: boolean = false;
  currentSeries: number = 1;

  // Superset
  exercises: WorkoutExerciseDetails[] = [];
  isSuperset: boolean = false;
  currentSupersetIndex: number = 0;
  hasNextSupersetExercise(): boolean {
    return this.isSuperset && this.currentSupersetIndex + 1 < this.exercises.length;
  }
  
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
        this.isLoading = true;
        this.exercise = await this.workoutService.loadWorkoutExerciseDetails(this.workoutId, this.exerciseId);
        this.nextExercise = this.workoutService.getNextExercise(this.workoutId, this.exerciseId);
        this.loadSuperset();
        this.isLoading = false;
        this.workoutNext();
      }
    });
  }

  ngOnDestroy() {
    this.stopTimer();
  }
  
  
  /* UI
  ------------------------------------------------------------ */

  workoutNextSeries() {
    this.step = 'exercise';
    this.currentSeries++;

    if(this.isSuperset) {
      this.currentSupersetIndex = 0;
      this.exercise = this.exercises[0];
      this.exerciseId = this.exercise.id;
    }

    this.workoutNext();
  }

  workoutNextSuperset() {
    this.step = 'exercise';
    if(this.isSuperset) {
      this.currentSupersetIndex++;
      this.exercise = this.exercises[this.currentSupersetIndex];
      this.exerciseId = this.exercise.id;
    }
    this.workoutNext();
  }

  workoutNextExercise() {
    if(!this.exercise) {
      return;
    }

    this.step = 'exercise';
    this.currentSeries = 1;

    if(this.nextExercise){
      this.exercise = this.nextExercise;
      this.nextExercise = this.workoutService.getNextExercise(this.workoutId, this.exercise.id);
      this.loadSuperset();
      this.workoutNext();
    }
  }

  workoutNextRest() {
    this.step = 'rest';
    this.workoutNext();
  }

  workoutEnd() {
    // @todok allenamento completato
  }

  private loadSuperset() {
    if(!this.exercise) {
      return;
    }

    this.exercises = this.workoutService.getSupersetExercises(this.workoutId, this.exerciseId);
    this.isSuperset = this.exercises.length > 1;
    console.log('Superset exercises:', this.exercises);
    
    if (this.isSuperset) {
      this.currentSupersetIndex = this.exercises.findIndex(ex => ex.id === this.exerciseId);
      if (this.currentSupersetIndex < 0) this.currentSupersetIndex = 0;
    } else {
      this.currentSupersetIndex = 0;
    }
  }

  private workoutNext() {
    if(!this.exercise) {
      return;
    }

    this.stopTimer();

    if(
      this.step == 'exercise' && this.exercise.tipo == 'time' && this.exercise.durata_s > 0 ||
      this.step == 'rest' && this.exercise.recupero_s > 0
    ) {
        this.startTimer();
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
    if(!this.exercise) {
      return;
    }

    this.stopTimer();
    
    this.hasTimer = true;
    if(this.step == 'exercise'){
      this.timerSeconds = this.exercise.durata_s;
    } else if(this.step == 'rest'){
      this.timerSeconds = this.exercise.recupero_s;
    }

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
        // this.stopTimer();
        this.isTimerRunning = false;
        this.isPaused = false;
      }
    }, 1000);
  }
  
  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = undefined;
    }
    this.hasTimer = false;
    this.timerSeconds = 0;
    this.isTimerRunning = false;
    this.isPaused = false;
  }
}