import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import Swal from 'sweetalert2';
import { Notification } from '../interfaces/Notification';

@Injectable({
  providedIn: 'root',
})
export class NotificationServices {

  private readonly STORAGE_KEY = 'crm_notifications';

  private notificationsSubject = new BehaviorSubject<Notification[]>(this.getNotifications());

  public notifications$ = this.notificationsSubject.asObservable();
  
  public success(title: string,message: string): void {

    Swal.fire({
      icon: 'success',
      title: title,
      text: message,
      confirmButtonText: 'Aceptar'
    });
  }


  public error(title: string,message: string): void {

    Swal.fire({
      icon: 'error',
      title: title,
      text: message,
      confirmButtonText: 'Aceptar'
    });
  }


  public warning(title: string,message: string): void {

    Swal.fire({
      icon: 'warning',
      title: title,
      text: message,
      confirmButtonText: 'Aceptar'
    });
  }


  public info(title: string,message: string): void {

    Swal.fire({
      icon: 'info',
      title: title,
      text: message,
      confirmButtonText: 'Aceptar'
    });
  }


  public confirm(title: string,message: string) {

    return Swal.fire({
      icon: 'question',
      title: title,
      text: message,
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar'
    });
  }

  // ==========================
  // OBTENER NOTIFICACIONES
  // ==========================

  getNotifications(): Notification[] {

    const notifications =
      localStorage.getItem(this.STORAGE_KEY);

    if (!notifications) {
      return [];
    }

    try {

      return JSON.parse(notifications);

    } catch (error) {

      console.error(
        'Error leyendo las notificaciones',
        error
      );

      return [];

    }
  }


  // ==========================
  // AGREGAR NOTIFICACIÓN
  // ==========================

  addNotification(notification: Notification): void {

    const notifications = this.getNotifications();

    notifications.unshift(notification);

    localStorage.setItem(
      this.STORAGE_KEY,
      JSON.stringify(notifications)
    );

    this.notificationsSubject.next(notifications);
  }


  // ==========================
  // ELIMINAR UNA
  // ==========================

  deleteNotification(id: string): void {

    const notifications =
      this.getNotifications();

    const updatedNotifications =
      notifications.filter(
        notification => notification.id !== id
      );

    localStorage.setItem(
      this.STORAGE_KEY,
      JSON.stringify(updatedNotifications)
    );

    this.notificationsSubject.next(
      updatedNotifications
    );
  }


  // ==========================
  // ELIMINAR TODAS
  // ==========================

  deleteAll(): void {

    localStorage.removeItem(
      this.STORAGE_KEY
    );

    this.notificationsSubject.next([]);
  }


  // ==========================
  // CONTADOR
  // ==========================

  getUnreadCount(): number {

    return this.getNotifications()
      .filter(notification => !notification.read)
      .length;
  }

}
