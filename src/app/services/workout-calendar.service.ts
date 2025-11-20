import { AppEvents } from './app-events.service';
import { Auth } from './auth';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root' 
})

export class WorkoutCalendarService {
  private serverCallsCache = new Set<string>(); // Array chiamate server (anno-mese)
  private loadedMonthsCache = new Set<string>(); // Array mesi caricati nel sistema
  private data = new Map<string, { descrizione: string; seduta: number }[]>(); // Array dati calendario per data

  constructor(
    private appEvents: AppEvents,
    private auth: Auth,
    private http: HttpClient, 
  ) {
    this.appEvents.onLogout$.subscribe(() => {
      this.clearCache();
    });
  }

  
  /* Calendario
  ------------------------------------------------------------*/

  async getWorkoutCalendar(year: number, month: number): Promise<{ [date: string]: { descrizione: string; seduta: number }[] }> {
    const requestKey = `${year}-${month}`;
    
    // 1. Controllo se ho già i dati per questo mese nel sistema
    if (this.loadedMonthsCache.has(requestKey)) {
      // Ho i dati, li restituisco dalla cache dati
      return this.getCalendarDataForMonth(year, month);
    }
    
    // 2. Controllo se ho già fatto una chiamata server per questo mese
    if (!this.serverCallsCache.has(requestKey)) {
      // Non ho fatto la chiamata, la faccio ora
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
        }
      } catch (error) {
        console.error('Error loading workout calendar:', error);
      }
    }
    
    // 3. Restituisco i dati che ho (potrebbero essere vuoti se la chiamata è fallita)
    return this.getCalendarDataForMonth(year, month);
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
  
  private getCalendarDataForMonth(year: number, month: number): { [date: string]: { descrizione: string; seduta: number }[] } {
    const result: { [date: string]: { descrizione: string; seduta: number }[] } = {};
    
    // Raccogli tutti i dati per le date del mese richiesto (inclusi mesi adiacenti per completare settimane)
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    // Aggiungi giorni del mese precedente per completare prima settimana
    const firstDay = new Date(year, month - 1, 1);
    const startDay = (firstDay.getDay() + 6) % 7;
    for (let i = startDay - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, -i);
      const dateStr = date.toISOString().split('T')[0];
      if (this.data.has(dateStr)) {
        result[dateStr] = this.data.get(dateStr)!;
      }
    }
    
    // Aggiungi giorni del mese corrente
    for (let day = 1; day <= endDate.getDate(); day++) {
      const date = new Date(year, month - 1, day);
      const dateStr = date.toISOString().split('T')[0];
      if (this.data.has(dateStr)) {
        result[dateStr] = this.data.get(dateStr)!;
      }
    }
    
    // Aggiungi giorni del mese successivo per completare ultima settimana
    const lastDay = new Date(year, month - 1, endDate.getDate());
    const endDay = (lastDay.getDay() + 6) % 7;
    if (endDay < 6) {
      for (let day = 1; day <= (6 - endDay); day++) {
        const date = new Date(year, month, day);
        const dateStr = date.toISOString().split('T')[0];
        if (this.data.has(dateStr)) {
          result[dateStr] = this.data.get(dateStr)!;
        }
      }
    }
    
    return result;
  }

  // Metodo per verificare se ho già i dati per un mese (senza fare chiamate)
  isMonthDataAvailable(year: number, month: number): boolean {
    const monthKey = `${year}-${month}`;
    return this.loadedMonthsCache.has(monthKey);
  }

  hasWorkoutOnDate(date: Date): boolean {
    const dateStr = date.toISOString().split('T')[0]; // Formato: YYYY-MM-DD
    const workouts = this.data.get(dateStr);
    return workouts ? workouts.length > 0 : false;
  }
  
  getWorkoutsForDate(date: Date): { descrizione: string; seduta: number }[] {
    const dateStr = date.toISOString().split('T')[0];
    return this.data.get(dateStr) || [];
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

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  private clearCache(): void {
    this.serverCallsCache.clear();
    this.loadedMonthsCache.clear();
    this.data.clear();
  }
}
  