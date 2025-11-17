import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, AlertController } from '@ionic/angular';
import { ModalController } from '@ionic/angular/standalone';
import { Subscription } from 'rxjs';
import { WorkoutService, WorkoutExercise } from '../../../services/workout.service';
import { ImagePreloaderService } from '../../../services/image-preloader.service';
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
    this.isOpeningModal = true;
    
    try {
      // Controllo aggiuntivo per modal esistenti
      const existingModal = await this.modalController.getTop();
      if (existingModal) {
        this.isOpeningModal = false;
        return;
      }
      
      const { WorkoutExerciseExplanationPage } = await import('../exercise-explanation/exercise-explanation.page');
      
      const modal = await this.modalController.create({
        component: WorkoutExerciseExplanationPage,
        componentProps: {
          workoutId: this.workoutId,
          exerciseId: this.exerciseId
        },
        presentingElement: await this.modalController.getTop()
      });
      
      await modal.present();
      
      // Reset flag quando il modal viene chiuso
      modal.onDidDismiss().then(() => {
        this.isOpeningModal = false;
      });
    } catch (error) {
      this.isOpeningModal = false;
    }
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

}