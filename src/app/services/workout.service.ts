import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Auth } from './auth';

export interface WorkoutExercise {
  id: string;
  thumb: string;
  descrizione: string;
  tipo: string;
  serie: string;
  durata: string;
  durata_s: number;
  recupero: string;
  recupero_s: number;
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
  
  constructor(
      private http: HttpClient, 
      private auth: Auth
  ) {}

  /**
   * Carica i dettagli di una scheda di allenamento
   */
  getWorkoutDetails(workoutId: string): Observable<WorkoutResponse> {
    const url = `${environment.api.baseUrl}${environment.api.endpoints.workoutDetails}`;

    return this.http.post<WorkoutResponse>(url, { id: workoutId }, {headers: this.auth.getAuthHeaders()});
  }
}