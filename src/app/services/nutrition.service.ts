import { AppEvents } from './app-events.service';
import { Auth } from './auth';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface NutritionItem {
    id: string;
    periodo: string;
    descrizione: string;
    file_scheda: string;
}

export interface NutritionResponse {
  success: boolean;
  items: NutritionItem[];
  hasMore?: boolean;
  total?: number;
  page?: number;
}

@Injectable({
  providedIn: 'root'
})

export class NutritionService {
  private cache = new Map<number, NutritionItem[]>();
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor(
    private http: HttpClient, 
    private auth: Auth,
    private appEvents: AppEvents
  ) {
    // Ascolta eventi di logout per pulire la cache
    this.appEvents.onLogout$.subscribe(() => {
      this.clearNutritionListCache();
    });
  }
  
  getNutritionList(page: number = 1, pageSize: number = 10): Observable<NutritionResponse> {
    // Controllo cache
    if (this.cache.has(page)) {
      return new Observable(observer => {
        observer.next({
          success: true,
          items: this.cache.get(page) || [],
          page: page
        });
        observer.complete();
      });
    }

    this.loadingSubject.next(true);

    const url = `${environment.api.baseUrl}${environment.api.endpoints.nutritionList}`;

    return this.http.post<NutritionResponse>(url, { page: page, limit: pageSize }, { headers: this.auth.getAuthHeaders() }).pipe(
      tap(response => {
        // Salviamo in cache
        if (response.success && response.items) {
          this.cache.set(page, response.items);
        }
        this.loadingSubject.next(false);
      })
    );
  }

  clearNutritionListCache(): void {
    this.cache.clear();
    this.loadingSubject.next(false);
  }

}