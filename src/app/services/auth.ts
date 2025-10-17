import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private readonly TOKEN_KEY = 'auth_token';
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private router: Router) {
    this.checkExistingAuth();
  }

  private checkExistingAuth(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    this.isAuthenticatedSubject.next(!!token);
    console.log('Auth: checkExistingAuth =', !!token);
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  // ✅ Fake login per testare
  fakeLogin(): void {
    const fakeToken = 'fake-token-' + Date.now();
    localStorage.setItem(this.TOKEN_KEY, fakeToken);
    this.isAuthenticatedSubject.next(true);
    console.log('Auth: fakeLogin eseguito, token =', fakeToken);
  }

  // ✅ Logout
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.isAuthenticatedSubject.next(false);
    console.log('Auth: logout eseguito');
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  // ✅ Get token 
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
}