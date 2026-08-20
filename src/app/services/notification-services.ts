import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class NotificationServices {
  
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
