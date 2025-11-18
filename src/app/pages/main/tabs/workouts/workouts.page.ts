import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
import { Auth } from '../../../../services/auth';
import { CalendarWidgetComponent } from '../../../../components/calendar-widget/calendar-widget.component';
import { WorkoutListComponent } from '../../../../components/workout-list/workout-list.component';
import { WorkoutService, WorkoutListItem } from '../../../../services/workout.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-workouts',
  templateUrl: './workouts.page.html',
  styleUrls: ['./workouts.page.scss'],
  standalone: true,
  imports: [
    CalendarWidgetComponent,
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonRefresher,
    IonRefresherContent,
    IonSpinner,
    IonToolbar,
    WorkoutListComponent
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
  
  loadWorkoutData(reset: boolean = false) {
    if (reset) {
      this.workoutItems = [];
      this.currentPage = 1;
      this.hasMoreData = true;
      this.workoutService.clearCache();
    }

    if (this.isLoading || !this.hasMoreData) {
      return;
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

          this.hasMoreData = response.hasMore || false;
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.initialLoad = false;
        this.hasMoreData = false;
        console.error('Error loading workout data:', error);
      },
      complete: () => {
        this.isLoading = false;
        this.initialLoad = false;
      }
    });
  }
  
  onRefresh(event: CustomEvent) {
    this.loadWorkoutData(true);
    setTimeout(() => {
      (event.target as any)?.complete();
    }, 1000);
  }
  
  onInfiniteScroll(event: CustomEvent) {
    if (this.hasMoreData && !this.isLoading) {
      this.currentPage++;
      this.loadWorkoutData();
    }
    
    setTimeout(() => {
      (event.target as any)?.complete();
    }, 1000);
  }
  
  /* Helpers
  ------------------------------------------------------------*/

  trackById(index: number, item: WorkoutListItem): string {
    return item.id;
  }

}