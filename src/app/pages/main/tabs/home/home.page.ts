
import { 
  IonContent,
  IonRippleEffect,
  IonButton,
  IonIcon
} from '@ionic/angular/standalone';
import { Auth } from '../../../../services/auth';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface CalendarDay {
  date: Date;
  dayName: string;
  dayNumber: number;
  isToday: boolean;
  hasWorkout?: boolean;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonContent, IonRippleEffect, IonButton, IonIcon, CommonModule, FormsModule]
})
export class HomePage implements OnInit {

  calendarDays: CalendarDay[] = [];
  currentUser: any = null;

  constructor(
    private auth: Auth,
    private router: Router
  ) { }

  ngOnInit() {
    this.auth.user$.subscribe(user => {
      this.currentUser = user;
    });

    this.generateCalendarDays();
  }

  private generateCalendarDays() {
    const today = new Date();
    const days: CalendarDay[] = [];
    
    for (let i = 4; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      const dayNames = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];

      let hasWorkout = false;
      if(this.currentUser && this.currentUser.latestWorkouts) {
        hasWorkout = this.currentUser.latestWorkouts.includes(date.toISOString().split('T')[0]);
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


  onDayClick(day: CalendarDay) {
    this.router.navigate(['/main/calendar']);
  }

  openCalendar() {
    this.router.navigate(['/main/calendar']);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  }

}
