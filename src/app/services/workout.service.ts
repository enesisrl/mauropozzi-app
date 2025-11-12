import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Auth } from './auth';

export interface WorkoutExercise {
  id: string;
  thumb: string;
  descrizione: string;
  testo: string;
  tipo: string;
  serie: string;
  durata: string;
  durata_s: number;
  durata_f: string;
  recupero: string;
  recupero_s: number;
  recupero_f: string;
  kg: number;
  note: string;
}

export interface WorkoutGroup {
  gruppo: number;
  esercizi: WorkoutExercise[];
}

export interface WorkoutDay {
  seduta: number;
  descrizione: string;
  gruppi: WorkoutGroup[];
}

export interface WorkoutDetail {
  id: string;
  descrizione: string;
  durata?: string;
  data_consegna?: string;
  data_consegna_ymd?: string;
  data_inizio?: string;
  data_inizio_ymd?: string;
  data_scadenza?: string;
  data_scadenza_ymd?: string;
  note?: string;
  esercizi: WorkoutDay[];
}

export interface WorkoutResponse {
  success: boolean;
  item?: WorkoutDetail;
  message?: string;
}

@Injectable({
  providedIn: 'root' 
})
export class WorkoutService {
  
  private workoutCache = new Map<string, WorkoutDetail>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minuti
  private cacheTimestamps = new Map<string, number>();
  
  constructor(
      private http: HttpClient, 
      private auth: Auth
  ) {}

  /**
   * Carica i dettagli di una scheda di allenamento
   */
  getWorkoutDetails(workoutId: string): Observable<WorkoutResponse> {
    // Controlla se i dati sono in cache e ancora validi
    if (this.isWorkoutCached(workoutId)) {
      const cachedWorkout = this.workoutCache.get(workoutId);
      return of({
        success: true,
        item: cachedWorkout
      });
    }

    const url = `${environment.api.baseUrl}${environment.api.endpoints.workoutDetails}`;

    return this.http.post<WorkoutResponse>(url, { id: workoutId }, {headers: this.auth.getAuthHeaders()})
      .pipe(
        tap(response => {
          // Salva in cache se la risposta è success
          if (response.success && response.item) {
            this.cacheWorkout(workoutId, response.item);
          }
        })
      );
  }

  /**
   * Controlla se un workout è presente in cache e ancora valido
   */
  private isWorkoutCached(workoutId: string): boolean {
    if (!this.workoutCache.has(workoutId) || !this.cacheTimestamps.has(workoutId)) {
      return false;
    }

    const cacheTime = this.cacheTimestamps.get(workoutId)!;
    const now = Date.now();
    
    // Controlla se la cache è scaduta
    if (now - cacheTime > this.cacheTimeout) {
      this.workoutCache.delete(workoutId);
      this.cacheTimestamps.delete(workoutId);
      return false;
    }

    return true;
  }

  /**
   * Salva un workout in cache
   */
  private cacheWorkout(workoutId: string, workout: WorkoutDetail): void {
    this.workoutCache.set(workoutId, workout);
    this.cacheTimestamps.set(workoutId, Date.now());
  }

  /**
   * Ottiene un workout dalla cache (per uso diretto da altre pagine)
   */
  getCachedWorkout(workoutId: string): WorkoutDetail | null {
    if (this.isWorkoutCached(workoutId)) {
      return this.workoutCache.get(workoutId) || null;
    }
    return null;
  }

  /**
   * Pulisce la cache dei workout
   */
  clearWorkoutCache(): void {
    this.workoutCache.clear();
    this.cacheTimestamps.clear();
  }

  /**
   * Ottiene un singolo esercizio da un workout cachato cercandolo per ID
   */
  getCachedExerciseById(workoutId: string, exerciseId: string): WorkoutExercise | null {
    const workout = this.getCachedWorkout(workoutId);
    if (!workout || !workout.esercizi) {
      return null;
    }

    // Cerca l'esercizio nell'array multidimensionale
    for (const giorno of workout.esercizi) {
      if (giorno.gruppi) {
        for (const gruppo of giorno.gruppi) {
          if (gruppo.esercizi) {
            for (const esercizio of gruppo.esercizi) {
              if (esercizio.id === exerciseId) {
                return esercizio;
              }
            }
          }
        }
      }
    }

    return null;
  }

  /**
   * Ottiene tutti gli esercizi di un gruppo (superset) dato un exerciseId
   */
  getSupersetExercises(workoutId: string, exerciseId: string): WorkoutExercise[] {
    const workout = this.getCachedWorkout(workoutId);
    if (!workout || !workout.esercizi) {
      return [];
    }

    // Trova il gruppo che contiene l'esercizio
    for (const giorno of workout.esercizi) {
      if (giorno.gruppi) {
        for (const gruppo of giorno.gruppi) {
          if (gruppo.esercizi) {
            const hasExercise = gruppo.esercizi.some(ex => ex.id === exerciseId);
            if (hasExercise) {
              return gruppo.esercizi;
            }
          }
        }
      }
    }

    return [];
  }
}