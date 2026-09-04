import { Injectable } from '@angular/core';
import { AppNotification } from '../interfaces/AppNotification';

@Injectable({
  providedIn: 'root',
})
export class BrowserNotificationService {

  async requestPermission(): Promise<void> {

    if (!('Notification' in window)) {
      console.warn('Este navegador no soporta notificaciones');
      return;
    }

    if (Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }

  showNotification(notification: AppNotification): void {

    if (!('Notification' in window)) {
      return;
    }

    if (Notification.permission !== 'granted') {
      return;
    }

    const browserNotification =
      new window.Notification(
        notification.title,
        {
          body: notification.message,
          icon: 'assets/icons/notification.png',
          tag: notification.id
        }
      );

    browserNotification.onclick = () => {
      window.focus();
      browserNotification.close();
    };
  }
  
}
