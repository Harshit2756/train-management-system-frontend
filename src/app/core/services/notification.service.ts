import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type NotificationType = 'success' | 'error';

export interface Notification {
  message: string;
  type: NotificationType;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notificationSubject = new BehaviorSubject<Notification | null>(null);

  notification$: Observable<Notification | null> =
    this.notificationSubject.asObservable();

  show(message: string, type: NotificationType = 'success'): void {
    this.notificationSubject.next({ message, type });
  }

  clear(): void {
    this.notificationSubject.next(null);
  }
}
