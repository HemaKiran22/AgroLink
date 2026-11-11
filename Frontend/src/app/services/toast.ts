import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
  duration: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  private nextId = 0;

  // All visible toasts
  toasts = signal<ToastMessage[]>([]);

  show(message: string, type: ToastType = 'info', duration = 5000): void {
    const id = ++this.nextId;

    this.toasts.update(list => [...list, { id, message, type, duration }]);

    // Remove automatically after the duration
    setTimeout(() => this.dismiss(id), duration);
  }

  success(message: string, duration = 5000): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration = 5000): void {
    this.show(message, 'error', duration);
  }

  dismiss(id: number): void {
    this.toasts.update(list => list.filter(toast => toast.id !== id));
  }
}