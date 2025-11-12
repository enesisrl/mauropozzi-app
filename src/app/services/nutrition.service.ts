import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
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
   * Carica le schede nutrizionali con paginazione
   */
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

  /**
   * Carica tutte le pagine fino a quella specificata (per infinite scroll)
   */
  loadPages(upToPage: number, pageSize: number = 10): Observable<NutritionItem[]> {
    const allItems: NutritionItem[] = [];
    const requests: Observable<NutritionResponse>[] = [];

    for (let i = 1; i <= upToPage; i++) {
      requests.push(this.getNutritionList(i, pageSize));
    }

    return new Observable(observer => {
      let completed = 0;
      
      requests.forEach((request, index) => {
        request.subscribe({
          next: (response) => {
            if (response.success && response.items) {
              // Inserisci gli elementi nella posizione corretta
              const startIndex = index * pageSize;
              response.items.forEach((item, itemIndex) => {
                allItems[startIndex + itemIndex] = item;
              });
            }
          },
          complete: () => {
            completed++;
            if (completed === requests.length) {
              // Filtra gli elementi undefined e restituisci il risultato
              observer.next(allItems.filter(item => item !== undefined));
              observer.complete();
            }
          }
        });
      });
    });
  }

  /**
   * Svuota la cache delle schede nutrizionali (usato durante logout)
   */
  clearCache(): void {
    this.cache.clear();
    this.loadingSubject.next(false);
  }

  /**
   * Apre il file PDF della scheda
   */
  openNutritionFile(fileName: string): void {
    if (fileName) {
      // Assumiamo che i file siano in una directory specifica del server
      const fileUrl = `${environment.api.baseUrl}/files/nutrition/${fileName}`;
      window.open(fileUrl, '_blank');
    }
  }
}