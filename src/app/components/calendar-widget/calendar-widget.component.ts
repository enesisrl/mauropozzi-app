import { Auth } from '../../services/auth';
import { CommonModule } from '@angular/common';
import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { 
  IonRippleEffect,
} from '@ionic/angular/standalone';
interface CalendarDay {
  date: Date;
  dayName: string;
  dayNumber: number;
  isToday: boolean;
  hasWorkout?: boolean;
}

@Component({
  selector: 'app-calendar-widget',
  templateUrl: './calendar-widget.component.html',
  styleUrls: ['./calendar-widget.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonRippleEffect,
  ]
})
export class CalendarWidgetComponent implements OnInit {

  calendarDays: CalendarDay[] = [];
  currentUser: any = null;
  
  @Input() workouts: any[] = [];
  
  constructor(
    private auth: Auth,
    private router: Router
  ) { }

  ngOnInit() {
    this.auth.user$.subscribe(user => {
      this.currentUser = user;
      this.generateCalendarDays();
    });
  }

  private generateCalendarDays() {
    const today = new Date();
    const days: CalendarDay[] = [];
    
    for (let i = 4; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      const dayNames = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];

      let hasWorkout = false;
      if(this.currentUser && this.currentUser.latestWorkoutDates) {
        hasWorkout = this.currentUser.latestWorkoutDates.includes(date.toISOString().split('T')[0]);
      }
      
      days.push({
        date: date,
        dayName: dayNames[date.getDay()],
        dayNumber: date.getDate(),
        isToday: i === 0,
        hasWorkout: hasWorkout
      });
    }
    
    this.calendarDays = days;
  }

  // Azioni

  onDayClick(day: CalendarDay) {
    this.router.navigate(['/main/calendar']);
  }

  openCalendar() {
    this.router.navigate(['/main/calendar']);
  }
}