import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import Swal from 'sweetalert2';
import { Notification } from '../interfaces/Notification';
import { BrowserNotificationService } from './browser-notification-service';

@Injectable({
  providedIn: 'root',
})
export class NotificationServices {

  private readonly STORAGE_KEY = 'crm_notifications';

  constructor(private browserNotificationService: BrowserNotificationService){}
  
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

}
