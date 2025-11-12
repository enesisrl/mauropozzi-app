
import { Auth } from '../../../../services/auth';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkoutListComponent } from '../../../../components/workout-list/workout-list.component';
import { CalendarWidgetComponent } from '../../../../components/calendar-widget/calendar-widget.component';
import { WorkoutService, WorkoutListItem } from '../../../../services/workout.service';
import { environment } from '../../../../../environments/environment';
import { 
  IonContent, 
  IonHeader,
  IonToolbar,
  IonRefresher,
  IonRefresherContent,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonSpinner
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-workouts',
  templateUrl: './workouts.page.html',
  styleUrls: ['./workouts.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonRefresher,
    IonRefresherContent,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonSpinner,
    WorkoutListComponent,
    CalendarWidgetComponent
  ]
})
export class WorkoutsPage implements OnInit {

  workoutItems: WorkoutListItem[] = [];
  isLoading: boolean = false;
  initialLoad: boolean = true;
  hasMoreData: boolean = true;
  currentPage: number = 1;
  pageSize: number = 10;
  environment = environment;
  
  constructor(
    private auth: Auth,
    private workoutService: WorkoutService
  ) { }

  ngOnInit() {
    this.loadWorkoutData();
  }

  /**
   * Carica i dati della scheda
   */
  loadWorkoutData(reset: boolean = false) {
    if (reset) {
      this.workoutItems = [];
      this.currentPage = 1;
      this.hasMoreData = true;
      this.workoutService.clearWorkoutListCache();
    }

    this.isLoading = true;

    this.workoutService.getWorkoutList(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.initialLoad = false;

        if (response.success && response.items) {
          if (reset) {
            this.workoutItems = response.items;
          } else {
            this.workoutItems = [...this.workoutItems, ...response.items];
          }

          // Controlla se ci sono più dati
          this.hasMoreData = response.items.length === this.pageSize;
        }
      },
      error: (error) => {
        console.error('Errore nel caricamento delle schede:', error);
        this.isLoading = false;
        this.initialLoad = false;
        this.hasMoreData = false;
      }
    });
  }

  /**
   * Gestisce il refresh pull-to-refresh
   */
  onRefresh(event: any) {
    this.loadWorkoutData(true);
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }

  /**
   * Gestisce l'infinite scroll
   */
  onInfiniteScroll(event: any) {
    if (this.hasMoreData && !this.isLoading) {
      this.currentPage++;
      this.loadWorkoutData();
    }
    
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }

  /**
   * TrackBy function per ottimizzare il rendering delle liste
   */
  trackById(index: number, item: WorkoutListItem): string {
    return item.id;
  }

}
