import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, tap, firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { Auth } from './auth';
import { AppEvents } from './app-events.service';
import { ImagePreloaderService } from './image-preloader.service';

export interface WorkoutListItem {
  id: string;
  descrizione: string;
  durata?: string;
  data_consegna?: string;
  data_inizio?: string;
  data_scadenza?: string;
  note?: string;
}

export interface WorkoutListResponse {
  success: boolean;
  items: WorkoutListItem[];
  hasMore?: boolean;
  total?: number;
  page?: number;
}

export interface WorkoutDetail {
  id: string;
  descrizione: string;
  durata?: string;
  data_consegna?: string;
  data_inizio?: string;
  data_scadenza?: string;
  note?: string;
  sedute: WorkoutDay[];
}

export interface WorkoutDay {
  seduta: number;
  descrizione: string;
  info?: string;
  gruppi: WorkoutGroup[];
}

export interface WorkoutGroup {
  gruppo: number;
  esercizi: WorkoutExerciseDetails[];
}

export interface WorkoutExerciseDetails {
  id: string;
  thumb: string;
  images: any[];
  video: string;
  descrizione: string;
  testo: string;
  tipo: string;
  serie: string;
  durata: string;
  durata_s: number;
  recupero: string;
  recupero_s: number;
  kg: number;
  note: string;
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
  
  // Lista
  private workoutListCache = new Map<number, WorkoutListItem[]>();

  // Dettaglio
  private workoutDetailsCache = new Map<string, WorkoutDetail>();
  private workoutDetailsCacheTimestamps = new Map<string, number>();

  constructor(
    private appEvents: AppEvents,
    private auth: Auth,
    private http: HttpClient, 
    private imagePreloader: ImagePreloaderService
  ) {
    // Ascolta eventi di logout per pulire la cache
    this.appEvents.onLogout$.subscribe(() => {
      this.clearCache();
    });
  }
  

  /* Lista
  ------------------------------------------------------------*/

  public getWorkoutList(page: number = 1, pageSize: number = 10): Observable<WorkoutListResponse> {
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

    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', pageSize.toString());

    const url = `${environment.api.baseUrl}${environment.api.endpoints.workoutList}`;

    return this.http.post<WorkoutListResponse>(url, {}, {
      headers: this.auth.getAuthHeaders(),
      params: params
    }).pipe(
      tap(response => {
        if (response.success && response.items) {
          this.workoutListCache.set(page, response.items);
        }
      })
    );
  }


  /* Dettaglio
  ------------------------------------------------------------*/

  public async loadWorkoutDetails(workoutId: string, reset: boolean = false): Promise<WorkoutDetail | null> {
    try {
      if (reset) {
        this.workoutDetailsCache.clear();
        this.workoutDetailsCacheTimestamps.clear();
      }

      const response = await firstValueFrom(this.getWorkoutDetails(workoutId));
      if (response?.success && response.item) {
        this.preloadWorkoutDetailsImages(response.item);
        return response.item;
      }
    } catch (error) {}

    return null;
  }
  
  private preloadWorkoutDetailsImages(workout: WorkoutDetail): void {
    if (!workout?.sedute) return;

    const exerciseImages: string[] = [];
    
    // Raccoglie tutte le immagini degli esercizi
    workout.sedute.forEach((giorno) => {
      if (giorno.gruppi) {
        giorno.gruppi.forEach(gruppo => {
          if (gruppo.esercizi) {
            gruppo.esercizi.forEach((esercizio) => {
              if (esercizio.thumb) {
                exerciseImages.push(esercizio.thumb);
              }
            });
          }
        });
      }
    });

    // Precarica le immagini in batch
    if (exerciseImages.length > 0) {
      this.imagePreloader.preloadImages(exerciseImages);
    }
  }
  
  private getWorkoutDetails(workoutId: string): Observable<WorkoutResponse> {
    if (this.isWorkoutDetailsCached(workoutId)) {
      const cachedWorkout = this.workoutDetailsCache.get(workoutId);
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
            this.workoutDetailsCache.set(workoutId, response.item);
            this.workoutDetailsCacheTimestamps.set(workoutId, Date.now());
          }
        })
      );
  }

  private isWorkoutDetailsCached(workoutId: string): boolean {
    if (!this.workoutDetailsCache.has(workoutId) || !this.workoutDetailsCacheTimestamps.has(workoutId)) {
      return false;
    }

    const cacheTime = this.workoutDetailsCacheTimestamps.get(workoutId)!;
    const now = Date.now();
    
    // Controlla se la cache è scaduta
    if (now - cacheTime > environment.cache.workoutDetailsData) {
      this.workoutDetailsCache.delete(workoutId);
      this.workoutDetailsCacheTimestamps.delete(workoutId);
      return false;
    }

    return true;
  }
  

  /* Esercizio 
  ------------------------------------------------------------*/

  public async loadWorkoutExerciseDetails(workoutId: string, exerciseId: string, reset: boolean = false): Promise<WorkoutExerciseDetails | null> {
    if (reset) {
      this.workoutDetailsCache.clear();
      this.workoutDetailsCacheTimestamps.clear();
    } 

    const response = await firstValueFrom(this.getWorkoutDetails(workoutId));
    if (response?.success && response.item) {
      let exercise = this.getCachedExerciseById(workoutId, exerciseId);
      if (exercise) {
        if (exercise.thumb) {
          this.imagePreloader.preloadImage(exercise.thumb);
        }
        return exercise;
      }
    }

    return null;
  }

  public getSupersetExercises(workoutId: string, exerciseId: string): WorkoutExerciseDetails[] {
    if (!this.isWorkoutDetailsCached(workoutId)) {
      return [];
    }
    
    const workout = this.workoutDetailsCache.get(workoutId);
    if (!workout || !workout.sedute) {
      return [];
    }

    // Trova il gruppo che contiene l'esercizio
    for (const giorno of workout.sedute) {
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

  public getNextExercise(workoutId: string, currentExerciseId: string): WorkoutExerciseDetails | null {
    if (!this.isWorkoutDetailsCached(workoutId)) {
      return null;
    }

    const workout = this.workoutDetailsCache.get(workoutId);
    if (!workout || !workout.sedute) {
      return null;
    }

    for (const giorno of workout.sedute) {
      if (!giorno.gruppi) continue;

      let allExercisesInDay: WorkoutExerciseDetails[] = [];
      
      for (const gruppo of giorno.gruppi) {
        if (gruppo.esercizi) {
          allExercisesInDay.push(...gruppo.esercizi);
        }
      }

      const currentIndex = allExercisesInDay.findIndex(ex => ex.id === currentExerciseId);
      
      if (currentIndex !== -1) {
        const nextIndex = currentIndex + 1;
        return nextIndex < allExercisesInDay.length ? allExercisesInDay[nextIndex] : null;
      }
    }

    return null;
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
  
  private getCachedExerciseById(workoutId: string, exerciseId: string): WorkoutExerciseDetails | null {
    if (!this.isWorkoutDetailsCached(workoutId)) {
      return null;
    }
    
    const workout = this.workoutDetailsCache.get(workoutId);
    if (!workout || !workout.sedute) {
      return null;
    }

    // Cerca l'esercizio nell'array multidimensionale
    for (const giorno of workout.sedute) {
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

  public clearCache(): void {
    this.workoutListCache.clear();
    this.workoutDetailsCache.clear();
    this.workoutDetailsCacheTimestamps.clear();
  }
}