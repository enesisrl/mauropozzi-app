import { Auth } from '../../services/auth';
import { CommonModule } from '@angular/common';
import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { WorkoutCalendarService } from '../../services/workout-calendar.service';
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
    IonRippleEffect
  ]
})

export class CalendarWidgetComponent implements OnInit {
  calendarDays: CalendarDay[] = [];
  currentUser: any = null;
  
  @Input() workouts: any[] = [];
  
  constructor(
    private auth: Auth,
    private router: Router,
    private workoutCalendarService: WorkoutCalendarService,
  ) { }

  ngOnInit() {
    this.auth.user$.subscribe(async user => {
      this.currentUser = user;
      if (user) {
        // Carica i dati del calendario per il mese corrente
        const today = new Date();
        await this.workoutCalendarService.getWorkoutCalendar(today.getFullYear(), today.getMonth() + 1);
        this.generateCalendarDays();
      }
    });
  }

  /* UI
  ------------------------------------------------------------*/

  onDayClick(day: CalendarDay) {
    if (day.hasWorkout) {
      this.workoutCalendarService.showDayAlert(day.date);
    }
  }

  openCalendar() {
    this.router.navigate(['/main/calendar']);
  }


  /* Helpers
  ------------------------------------------------------------*/

  private generateCalendarDays() {
    const today = new Date();
    const days: CalendarDay[] = [];
    
    for (let i = 4; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      const dayNames = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];

      // Usa il servizio per verificare se ci sono workout
      const hasWorkout = this.workoutCalendarService.hasWorkoutOnDate(date);
      
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
}