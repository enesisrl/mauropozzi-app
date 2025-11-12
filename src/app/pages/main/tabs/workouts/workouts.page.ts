
import { Auth } from '../../../../services/auth';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkoutListComponent } from '../../../../components/workout-list/workout-list.component';
import { CalendarWidgetComponent } from '../../../../components/calendar-widget/calendar-widget.component';
import { 
  IonContent, 
  IonHeader,
  IonToolbar,
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
    WorkoutListComponent,
    CalendarWidgetComponent
  ]
})
export class WorkoutsPage implements OnInit {

  currentUser: any = null;
  
  constructor(
    private auth: Auth
  ) { }

  ngOnInit() {
    this.auth.user$.subscribe(user => {
      this.currentUser = user;
    });
  }

}
