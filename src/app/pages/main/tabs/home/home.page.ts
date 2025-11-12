
import { 
  IonContent,
  IonHeader,
  IonToolbar,
} from '@ionic/angular/standalone';
import { Auth } from '../../../../services/auth';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WorkoutListComponent } from '../../../../components/workout-list/workout-list.component';
import { CalendarWidgetComponent } from '../../../../components/calendar-widget/calendar-widget.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    CommonModule,
    FormsModule,
    WorkoutListComponent,
    CalendarWidgetComponent,
    IonHeader,
    IonToolbar,
  ]
})
export class HomePage implements OnInit {

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
