import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class AppEvents {
  private logoutEvent = new Subject<void>();
  
  public onLogout$ = this.logoutEvent.asObservable();

  emitLogout(): void {
    this.logoutEvent.next();
  }
}