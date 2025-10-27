import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

export interface User {
  id: string;
  email: string;
  name: string;
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
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user_data';
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.checkExistingAuth();
  }

  private checkExistingAuth(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const userData = localStorage.getItem(this.USER_KEY);
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        this.userSubject.next(user);
        this.isAuthenticatedSubject.next(true);
      } catch (error) {
        this.logout();
      }
    }
  }


  // Azioni

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

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    
    this.userSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    
    this.router.navigate(['/login'], { replaceUrl: true });
  }


  // Stati

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getCurrentUser(): User | null {
    return this.userSubject.value;
  }


  // User Data

  private saveUserData(token: string, user: User): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    
    this.userSubject.next(user);
    this.isAuthenticatedSubject.next(true);
  }
  
  private updateUserData(userData: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(userData));
    this.userSubject.next(userData);
    this.isAuthenticatedSubject.next(true);
  }


  // Helpers

  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

}