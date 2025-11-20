import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { 
  AlertController,
  IonButton,
  IonContent, 
  IonHeader,
  IonIcon,
  IonRippleEffect,
  IonToolbar,
} from '@ionic/angular/standalone';

interface CalendarDay {
  date: Date;
  dayNumber: number;
  dayName: string;
  isToday: boolean;
  hasWorkout: boolean;
  isCurrentMonth: boolean;
  isWeekend: boolean;
}

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.page.html',
  styleUrls: ['./calendar.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonButton,
    IonContent,
    IonHeader,
    IonIcon,
    IonRippleEffect,
    IonToolbar,
  ]
})

export class CalendarPage implements OnInit {
  
  currentDate: Date = new Date();
  calendarDays: CalendarDay[] = [];
  private isNavigating: boolean = false;
  
  monthNames: string[] = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
  ];
  dayNames: string[] = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

  constructor(
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.generateCalendar();
  }
  
  
  /* UI
  ------------------------------------------------------------ */


  previousMonth(): void {
    if (this.isNavigating) return;
    this.isNavigating = true;
    
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    this.generateCalendar();
    
    setTimeout(() => {
      this.isNavigating = false;
    }, 300);
  }

  nextMonth(): void {
    if (this.isNavigating) return;
    this.isNavigating = true;
    
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    this.generateCalendar();
    
    setTimeout(() => {
      this.isNavigating = false;
    }, 300);
  }

  onDayClick(day: CalendarDay): void {
    console.log('Day clicked:', day);
    // TODO: Implementare azione click giorno
    if(day.hasWorkout) {
      this.showWorkoutDetails(day);
    }
  }

  protected async showWorkoutDetails(day: CalendarDay): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Allenamento del ' + day.dayNumber + ' ' + this.monthNames[this.currentDate.getMonth()],
      message: 'Ecco i dettagli del tuo allenamento per questo giorno.',
      buttons: ['OK']
    });
    await alert.present();
  }


  /* Helpers
  ------------------------------------------------------------ */

  get currentMonthYear(): string {
    return `${this.monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
  }

  private generateCalendar(): void {
    this.calendarDays = [];
    
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = (firstDay.getDay() + 6) % 7; // Converte domenica=0 in domenica=6, lunedì=1 in lunedì=0
    
    // Giorni del mese precedente per completare la prima settimana
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      const dayNumber = prevMonthLastDay - i;
      const date = new Date(year, month - 1, dayNumber);
      this.calendarDays.push(this.createCalendarDay(date, false));
    }
    
    // Giorni del mese corrente
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      this.calendarDays.push(this.createCalendarDay(date, true));
    }
    
    // Giorni del mese successivo solo per completare l'ultima settimana
    const currentLength = this.calendarDays.length;
    const remainingInLastWeek = 7 - (currentLength % 7);
    
    // Solo se non è già un multiplo di 7 (settimana completa)
    if (remainingInLastWeek < 7) {
      for (let day = 1; day <= remainingInLastWeek; day++) {
        const date = new Date(year, month + 1, day);
        this.calendarDays.push(this.createCalendarDay(date, false));
      }
    }
  }

  private createCalendarDay(date: Date, isCurrentMonth: boolean): CalendarDay {
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    return {
      date: date,
      dayNumber: date.getDate(),
      dayName: this.dayNames[(date.getDay() + 6) % 7],
      isToday: isToday,
      hasWorkout: this.checkHasWorkout(date), // TODO: Implementare logica workout
      isCurrentMonth: isCurrentMonth,
      isWeekend: date.getDay() === 0 || date.getDay() === 6 // Sabato e domenica rimangono weekend
    };
  }

  private checkHasWorkout(date: Date): boolean {
    // TODO: Implementare controllo workout per questa data
    // Per ora ritorniamo false per tutti
    return false;
  }
}