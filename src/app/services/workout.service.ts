import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, tap, BehaviorSubject, forkJoin } from 'rxjs';
import { environment } from '../../environments/environment';
import { Auth } from './auth';
import { AppEvents } from './app-events.service';

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
  data_inizio?: string;
  data_scadenza?: string;
  note?: string;
  esercizi: WorkoutDay[];
}

export interface WorkoutListItem {
  id: string;
  descrizione: string;
  durata?: string;
  data_consegna?: string;
  data_inizio?: string;
  data_scadenza?: string;
  note?: string;
}

export interface WorkoutResponse {
  success: boolean;
  item?: WorkoutDetail;
  message?: string;
}

export interface WorkoutListResponse {
  success: boolean;
  items: WorkoutListItem[];
  hasMore?: boolean;
  total?: number;
  page?: number;
}

@Injectable({
  providedIn: 'root' 
})
export class WorkoutService {
  
  // Cache per i dettagli workout
  private workoutCache = new Map<string, WorkoutDetail>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minuti
  private cacheTimestamps = new Map<string, number>();
  
  // Cache per la lista workout
  private workoutListCache = new Map<number, WorkoutListItem[]>();
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();
  
  constructor(
    private http: HttpClient, 
    private auth: Auth,
    private appEvents: AppEvents
  ) {
    // Ascolta eventi di logout per pulire la cache
    this.appEvents.onLogout$.subscribe(() => {
      this.clearCache();
    });
  }

  
  /**
   * Lista
   */

  getWorkoutList(page: number = 1, pageSize: number = 10): Observable<WorkoutListResponse> {
    // Controllo cache
    if (this.workoutListCache.has(page)) {
      return new Observable(observer => {
        observer.next({
          success: true,
          items: this.workoutListCache.get(page) || [],
          page: page
        });
        observer.complete();
      });
    }

    this.loadingSubject.next(true);

    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', pageSize.toString());

    const url = `${environment.api.baseUrl}${environment.api.endpoints.workoutList}`;

    return this.http.post<WorkoutListResponse>(url, {}, {
      headers: this.auth.getAuthHeaders(),
      params: params
    }).pipe(
      tap(response => {
        this.loadingSubject.next(false);
        if (response.success && response.items) {
          this.workoutListCache.set(page, response.items);
        }
      })
    );
  }
  
  loadWorkoutPages(upToPage: number, pageSize: number = 10): Observable<WorkoutListResponse[]> {
    const requests: Observable<WorkoutListResponse>[] = [];
    
    for (let i = 1; i <= upToPage; i++) {
      requests.push(this.getWorkoutList(i, pageSize));
    }

    return forkJoin(requests);
  }
  
  clearWorkoutListCache(): void {
    this.workoutListCache.clear();
  }


  /**
   * Dettaglio scheda
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
  
  clearWorkoutDetailsCache(): void {
    this.workoutCache.clear();
    this.cacheTimestamps.clear();
  }
  
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
  
  private cacheWorkout(workoutId: string, workout: WorkoutDetail): void {
    this.workoutCache.set(workoutId, workout);
    this.cacheTimestamps.set(workoutId, Date.now());
  }
  
  getCachedWorkout(workoutId: string): WorkoutDetail | null {
    if (this.isWorkoutCached(workoutId)) {
      return this.workoutCache.get(workoutId) || null;
    }
    return null;
  }
  
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


  /**
   * Cache
   */

  clearCache(): void {
    this.clearWorkoutListCache();
    this.clearWorkoutDetailsCache();
  }
}