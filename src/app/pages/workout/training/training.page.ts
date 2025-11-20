import { ActivatedRoute, Router } from '@angular/router';
import { Auth } from '../../../services/auth';
import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { FormsModule } from '@angular/forms';
import { ModalController, AlertController } from '@ionic/angular/standalone';
import { WorkoutCalendarService } from '../../../services/workout-calendar.service';
import { WorkoutExerciseExplanationPage } from '../exercise-explanation/exercise-explanation.page';
import { WorkoutService, WorkoutExerciseDetails } from '../../../services/workout.service';
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

  step: 'exercise' | 'rest' | 'end' = 'exercise';
  hasTimer: boolean = false;
  currentSeries: number = 1;

  // Superset
  isSuperset: boolean = false;
  supersetExercises: WorkoutExerciseDetails[] = [];
  currentSupersetIndex: number = 0;

  // Log progresso
  private progressStartTime: Date | null = null;
  
  // Timer properties
  timerSeconds: number = 0;
  timerInterval?: number;
  isTimerRunning: boolean = false;
  isPaused: boolean = false;
  
  isLoading = true;
  isOpeningModal = false;
  environment = environment;

  constructor(
    private alertController: AlertController,
    private auth: Auth,
    private modalController: ModalController,
    private route: ActivatedRoute,
    private router: Router,
    private workoutCalendarService: WorkoutCalendarService,
    private workoutService: WorkoutService,
  ) {}

  ngOnInit() {
    // Recupera i parametri dalla route
    this.route.params.subscribe(async params => {
      this.workoutId = params['workoutId'];
      this.exerciseId = params['exerciseId'];
      if (this.workoutId && this.exerciseId) {
        this.isLoading = true;
        const exerciseDetails = await this.workoutService.loadWorkoutExerciseDetails(this.workoutId, this.exerciseId);
        this.setExercise(exerciseDetails);
        this.isLoading = false;
        this.workoutTimer();
      }
    });
  }

  ngOnDestroy() {
    this.stopTimer();
  }
  
  
  /* UI
  ------------------------------------------------------------ */

  workoutNextStep() {
    if(this.step == 'exercise' && this.exercise && this.exercise.recupero_s > 0) {
        this.step = 'rest';
    }

    else if(this.nextExercise) {
        this.step = 'exercise';
        this.setExercise(this.nextExercise);
    } 
    
    else {
      this.storeProgress();

      this.step = 'end';
      this.exercise = null;
      this.exerciseId = '';
      this.currentSeries = 1;
      this.supersetExercises = [];
      this.isSuperset = false;
      this.currentSupersetIndex = 0;
    }

    return this.workoutTimer();
  }
  
  private storeProgress() {
    if (!this.progressStartTime) {
      return;
    }

    this.workoutCalendarService.storeWorkoutExerciseProgress(
      this.workoutId,
      this.supersetExercises.map(element => element.id),
      this.progressStartTime,
      new Date(),
      this.currentSeries,
      // weight_kg @todok
    ).subscribe();
  }

  workoutNextSeries() {
    this.step = 'exercise';
    this.currentSeries++;

    if(this.isSuperset) {
      this.setExercise(this.supersetExercises[0]);
    }

    this.workoutTimer();
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
    this.auth.loadProfile().subscribe();
    this.router.navigate(['/workout-details', this.workoutId]);
  }
  

  /* Logic
  ------------------------------------------------------------ */

  hasNextExercise() : boolean {
    // Prossimo esercizio se sono in esercizio senza recupero 
    // o sono in recupero e c'è un esercizio successivo
    return !this.hasNextSupersetExercise() && (this.step == 'exercise' && !(this.exercise?.recupero_s ?? 0) || this.step == 'rest') && this.nextExercise != null;
  }
  hasNextRest() : boolean {
    // Prossimo recupero se sono in esercizio e c'è un recupero
    return this.step == 'exercise' && (this.exercise?.recupero_s ?? 0) > 0;
  }
  hasNextSupersetExercise(): boolean {
    // Esiste un altro esercizio nel superset
    return this.isSuperset && this.currentSupersetIndex + 1 < this.supersetExercises.length;
  }
  hasNextSeries(): boolean {
    // Prossima serie se sono in esercizio senza recupero o in recupero
    // o se sono in superset e ho finito tutti gli esercizi del superset
    return (this.exercise && !(this.exercise?.recupero_s ?? 0) || this.step == 'rest') && (!this.isSuperset || this.isSuperset && this.currentSupersetIndex + 1 >= this.supersetExercises.length)
  }
  hasEnding(): boolean {
    // Allenamento finito se sono in recupero e non c'è un esercizio successivo
    return (this.step == 'exercise' && !(this.exercise?.recupero_s ?? 0) || this.step == 'rest') && !this.nextExercise;
  }

  private setExercise(exercise: WorkoutExerciseDetails | null) {
    if(!exercise) {
      return;
    }

    if(this.supersetExercises.findIndex(ex => ex.id === exercise.id) < 0) {
      if(this.exercise) {
        this.storeProgress();
      }

      this.currentSeries = 1;
      this.progressStartTime = new Date();
    }
    
    this.exercise = exercise;
    this.exerciseId = this.exercise.id;
    this.nextExercise = this.workoutService.getNextExercise(this.workoutId, this.exercise.id);

    this.supersetExercises = this.workoutService.getSupersetExercises(this.workoutId, this.exerciseId);
    this.isSuperset = this.supersetExercises.length > 1;
    this.currentSupersetIndex = this.isSuperset ? this.supersetExercises.findIndex(ex => ex.id === this.exerciseId) : 0;
  }

  private workoutTimer() {
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