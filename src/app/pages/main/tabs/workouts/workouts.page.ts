import { CalendarWidgetComponent } from '../../../../components/calendar-widget/calendar-widget.component';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { FormsModule } from '@angular/forms';
import { WorkoutListComponent } from '../../../../components/workout-list/workout-list.component';
import { WorkoutService, WorkoutListItem } from '../../../../services/workout.service';
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
    }, 500);
  }
  
  onInfiniteScroll(event: CustomEvent) {
    if (this.hasMoreData && !this.isLoading) {
      this.currentPage++;
      this.loadWorkoutData();
    }
    
    setTimeout(() => {
      (event.target as any)?.complete();
    }, 500);
  }
  
  /* Helpers
  ------------------------------------------------------------*/

  trackById(index: number, item: WorkoutListItem): string {
    return item.id;
  }

}