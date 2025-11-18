import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Auth } from './auth';
import { AppEvents } from './app-events.service';

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

    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', pageSize.toString());

    const url = `${environment.api.baseUrl}${environment.api.endpoints.nutritionList}`;

    return this.http.post<NutritionResponse>(url, {}, {
      headers: this.auth.getAuthHeaders(),
      params: params
    }).pipe(
      tap(response => {
        if (response.success && response.items) {
          this.cache.set(page, response.items);
        }
      })
    );
  }

  clearCache(): void {
    this.cache.clear();
  }

}