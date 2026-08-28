import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { TokensServices } from '../../services/tokens-services';
import { AuthServices } from '../../services/auth-services';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ServicesWebsocket } from '../../services/services-websocket';
import { NotificationServices } from '../../services/notification-services';
import { Notification } from '../../interfaces/Notification';

@Component({
  selector: 'app-topbar',
  imports: [CommonModule],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css',
})
export class Topbar implements OnInit{

  public nombre:string = '';

  public menuAbierto: boolean = false;

  public unreadCount: number = 0;

  public notifications: Notification[] = [];

  public isOpen = false;

  constructor(private tokenService: TokensServices, 
    private authService: AuthServices,
    private router: Router,
    private websocket: ServicesWebsocket,
    private notificationService: NotificationServices) {}
  
  ngOnInit(): void {
    
    this.nombre = this.tokenService.getName() ?? '';

    this.notificationService.notifications$
      .subscribe(notifications => {

        this.notifications = notifications;

        this.unreadCount = this.notifications
        .filter(notification => !notification.read)
        .length;

      });
    
  }

  public cerrarSesion(){

    this.authService.logout();
    this.router.navigate(['/login']);

  }

  public toggleMenu(): void {

    this.menuAbierto = this.menuAbierto === false ? true : false;

  }

   toggleNotifications(): void {

    this.isOpen = !this.isOpen;

  }


  deleteNotification(id: string): void {

    this.notificationService
      .deleteNotification(id);

  }


  deleteAll(): void {

    this.notificationService.deleteAll();

  }

}
