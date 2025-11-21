import { AppEvents } from './app-events.service';
import { Auth } from './auth';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';
import { AlertController } from '@ionic/angular/standalone';

@Injectable({
  providedIn: 'root' 
})

export class WorkoutCalendarService {
  private serverCallsCache = new Set<string>(); // Array chiamate server (anno-mese)
  private loadedMonthsCache = new Set<string>(); // Array mesi caricati nel sistema
  private data = new Map<string, { descrizione: string; seduta: number }[]>(); // Array dati calendario per data
  private dayNames: string[] = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
  
  constructor(
    private appEvents: AppEvents,
    private auth: Auth,
    private http: HttpClient,
    private alertController: AlertController
  ) {
    this.appEvents.onLogout$.subscribe(() => {
      this.clearCache();
    });
  }
  
  async getWorkoutCalendar(year: number, month: number): Promise<{ [date: string]: { descrizione: string; seduta: number }[] }> {
    const requestKey = `${year}-${month}`;
    
    // 1. CONTROLLO SERVER CALLS - Se non ho mai chiamato il server per questo mese, la faccio
    if (!this.serverCallsCache.has(requestKey)) {
      try {
        const body: any = {
          year: year.toString(),
          month: month.toString()
        };

        const url = `${environment.api.baseUrl}${environment.api.endpoints.workoutCalendar}`;
          
        const response = await firstValueFrom(
          this.http.post<{ success: boolean; dates: { [date: string]: { descrizione: string; seduta: number }[] } }>(
            url,
            body,
            {
              headers: this.auth.getAuthHeaders()
            }
          )
        );
        
        if (response?.success && response.dates) {
          // Segno la chiamata come fatta
          this.serverCallsCache.add(requestKey);
          
          // Salvo i dati e segno i mesi come caricati
          this.saveCalendarData(response.dates, year, month);
        } else {
          // Anche se fallisce, segno la chiamata come tentata per evitare loop
          this.serverCallsCache.add(requestKey);
        }
      } catch (error) {
        console.error('Error loading workout calendar:', error);
        // Anche se fallisce, segno la chiamata come tentata per evitare loop
        this.serverCallsCache.add(requestKey);
      }
    }
    
    // 2. RITORNO SEMPRE I DATI DALLA CACHE DATA (che vince sempre)
    return this.getDataFromCache();
  }

  isMonthDataAvailable(year: number, month: number): boolean {
    const monthKey = `${year}-${month}`;
    return this.loadedMonthsCache.has(monthKey);
  }

  hasWorkoutOnDate(date: Date): boolean {
    const dateStr = this.formatDateLocal(date); // Fuso orario Roma
    const workouts = this.data.get(dateStr);
    return workouts ? workouts.length > 0 : false;
  }
  
  getWorkoutsForDate(date: Date): { descrizione: string; seduta: number }[] {
    const dateStr = this.formatDateLocal(date);
    return this.data.get(dateStr) || [];
  }

  async showDayAlert(date: Date): Promise<void> {
    const workouts = this.getWorkoutsForDate(date);
    
    let message = '';
    if (workouts.length > 0) {
      message = workouts.map(w => `${w.descrizione} (Giorno ${w.seduta})`).join('\n');
    } else {
      return;
    }
    
    const alert = await this.alertController.create({
      header: this.dayNames[(date.getDay() + 6) % 7] + ' ' + date.getDate(),
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }

  public storeWorkoutExerciseProgress(workoutId: string, exerciseId: Array<string>, start_time: Date, end_time: Date, series: number, weight_kg: number | null = null): Observable<any> {
    const body: any = {
      id: workoutId,
      ix: exerciseId,
      ts: this.formatDate(start_time),
      te: this.formatDate(end_time),
      sr: series
    };

    if (weight_kg !== null) {
      body.kg = weight_kg.toString();
    }

    const url = `${environment.api.baseUrl}${environment.api.endpoints.storeWorkoutExerciseProgress}`;
    
    return this.http.post<any>(url, body, {
      headers: this.auth.getAuthHeaders()
    });
  }


  /* Helpers
  ------------------------------------------------------------*/

  private formatDateLocal(date: Date): string {
    // Formato YYYY-MM-DD mantenendo fuso orario locale (Roma)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
  
  private getDataFromCache(): { [date: string]: { descrizione: string; seduta: number }[] } {
    const result: { [date: string]: { descrizione: string; seduta: number }[] } = {};
    
    // DATA VINCE SEMPRE - ritorno tutti i dati che ho
    for (const [dateStr, workouts] of this.data.entries()) {
      result[dateStr] = workouts;
    }
    
    return result;
  }
  
  private saveCalendarData(dates: { [date: string]: { descrizione: string; seduta: number }[] }, requestYear: number, requestMonth: number): void {
    // Salva tutti i dati ricevuti
    for (const [dateStr, workouts] of Object.entries(dates)) {
      this.data.set(dateStr, workouts);
    }
    
    // Segna come caricati il mese richiesto e quelli adiacenti
    const prevMonth = requestMonth === 1 ? 12 : requestMonth - 1;
    const prevYear = requestMonth === 1 ? requestYear - 1 : requestYear;
    const nextMonth = requestMonth === 12 ? 1 : requestMonth + 1;
    const nextYear = requestMonth === 12 ? requestYear + 1 : requestYear;
    
    this.loadedMonthsCache.add(`${prevYear}-${prevMonth}`);
    this.loadedMonthsCache.add(`${requestYear}-${requestMonth}`);
    this.loadedMonthsCache.add(`${nextYear}-${nextMonth}`);
  }

  public clearCache(): void {
    this.serverCallsCache.clear();
    this.loadedMonthsCache.clear();
    this.data.clear();
  }
}
  