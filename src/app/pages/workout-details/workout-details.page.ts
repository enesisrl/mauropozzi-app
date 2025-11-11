import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, AlertController, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { WorkoutService, WorkoutDetail, WorkoutDay } from '../../services/workout.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
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
  IonCol,
  IonRow,
  IonGrid,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  IonCardSubtitle
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
    IonCol,
    IonRow,
    IonGrid,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonRefresher,
    IonRefresherContent,
    IonSpinner,
    IonCardSubtitle
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
    private alertController: AlertController,
    private toastController: ToastController
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
   * Verifica se la scheda è scaduta
   */
  isExpired(): boolean {
    if (!this.workout?.data_scadenza_ymd) return false;
    const today = new Date();
    const expiryDate = new Date(this.workout.data_scadenza_ymd);
    return expiryDate < today;
  }

  /**
   * Verifica se la scheda è attiva
   */
  isActive(): boolean {
    if (!this.workout?.data_inizio_ymd) return false;
    const today = new Date();
    const startDate = new Date(this.workout.data_inizio_ymd);
    return startDate <= today && !this.isExpired();
  }

  /**
   * TrackBy functions per ottimizzare il rendering
   */
  trackByDay(index: number, day: WorkoutDay): number {
    return day.seduta;
  }

  trackByGroup(index: number, group: any): number {
    return group.gruppo;
  }

  trackByExercise(index: number, exercise: any): string {
    return exercise.id;
  }
}