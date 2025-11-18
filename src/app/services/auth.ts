import { BehaviorSubject, Observable, throwError, firstValueFrom } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AppEvents } from './app-events.service';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  subscribed: boolean;
  profileCompleted: boolean;
  subscriptions: any[];
  latestWorkoutDates: any[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
}

export interface ProfileResponse {
  success: boolean;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private readonly TOKEN_KEY = 'at';
  private readonly USER_KEY = 'ud';
  private readonly USER_LAST_REFRESH = 'udlr';
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private appEvents: AppEvents
  ) {
    this.checkExistingAuth();
  }

  private checkExistingAuth(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const userData = localStorage.getItem(this.USER_KEY);
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        this.isAuthenticatedSubject.next(true);
        this.userSubject.next(user);
      } catch (error) {
        this.logout();
      }
    }
  }


  /* Azioni
  ------------------------------------------------------------*/

  login(email: string, password: string): Observable<LoginResponse> {
    const loginData: LoginRequest = { email, password };
    const url = `${environment.api.baseUrl}${environment.api.endpoints.login}`;
    
    return this.http.post<LoginResponse>(url, loginData).pipe(
      tap(response => {
        if (response.success && response.token) {
          this.saveUserData(response.token, response.user);
        }
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  loadProfile(): Observable<ProfileResponse> {
    const url = `${environment.api.baseUrl}${environment.api.endpoints.profile}`;
    return this.http.post<ProfileResponse>(url, {}, { headers: this.getAuthHeaders() }).pipe(
      tap(response => {
        if (response.success) {
          this.updateUserData(response.user);
        }
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  public async smartRefresh(): Promise<void> {
    const lastRefresh = localStorage.getItem(this.USER_LAST_REFRESH);
    const timeSinceLastRefresh = Date.now() - (lastRefresh ? parseInt(lastRefresh, 10) : 0);

    if (timeSinceLastRefresh > environment.cache.userData) {
      try {
        const response = await firstValueFrom(this.loadProfile());
    
        if (!(response?.success)) {
          this.logout();
        }
      } catch (error: any) {
        if (error?.status === 401 || error?.status === 403 || error?.error?.err) {
          this.logout();
        }
      }
    }
  }

  logout(): void {
    // Pulisce localStorage
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.USER_LAST_REFRESH);
    
    // Emette evento di logout per notificare altri servizi
    this.appEvents.emitLogout();
    
    // Reset stati
    this.isAuthenticatedSubject.next(false);
    this.userSubject.next(null);
    
    // Redirect al login
    this.router.navigate(['/login'], { replaceUrl: true });
  }


  /* Stati
  ------------------------------------------------------------*/

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getCurrentUser(): User | null {
    return this.userSubject.value;
  }


  /* User Data
  ------------------------------------------------------------*/

  private saveUserData(token: string, user: User): void {
    const now = Date.now();
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    localStorage.setItem(this.USER_LAST_REFRESH, now.toString());
    
    this.isAuthenticatedSubject.next(true);
    this.userSubject.next(user);
  }
  
  private updateUserData(userData: User): void {
    const now = Date.now();
    localStorage.setItem(this.USER_KEY, JSON.stringify(userData));
    localStorage.setItem(this.USER_LAST_REFRESH, now.toString());

    this.userSubject.next(userData);
    this.isAuthenticatedSubject.next(true);
  }


  /* Helpers
  ------------------------------------------------------------*/

  public getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

}