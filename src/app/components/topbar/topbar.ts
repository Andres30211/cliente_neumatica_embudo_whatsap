import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { TokensServices } from '../../services/tokens-services';
import { AuthServices } from '../../services/auth-services';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ServicesWebsocket } from '../../services/services-websocket';
import { NotificationServices } from '../../services/notification-services';
import { Notification } from '../../interfaces/Notification';
import { PushNotificationService } from '../../services/push-notification.service';

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
    private notificationService: NotificationServices,
    private pushService: PushNotificationService ) {}
  
  ngOnInit(): void {
    
    this.nombre = this.tokenService.getName() ?? '';

  }

  public cerrarSesion(){

    this.authService.logout();
    this.router.navigate(['/login']);

  }

  public toggleMenu(): void {

    this.menuAbierto = this.menuAbierto === false ? true : false;

  }

  obtenerIniciales(nombre: string | null | undefined): string {

    if (!nombre) {
      return 'US';
    }

    const palabras = nombre
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (palabras.length === 1) {
      return palabras[0].substring(0, 2).toUpperCase();
    }

    return (
      palabras[0].charAt(0) +
      palabras[1].charAt(0)
    ).toUpperCase();
  }

  async activarNotificaciones(): Promise<void> {
    try {
      
      const result = await this.notificationService.confirm('Activar Notificaciones', 'Deséa activar las notificaciones');
      
      if (result.isConfirmed) {
        
        await this.pushService.subscribeToNotifications();
        this.notificationService.success('Activar Notificaciones', 'Notificaciones Activadas');
      }
    } catch (error) {
      console.error('Error activando notificaciones:', error);

      alert('No fue posible activar las notificaciones.');
    }
  }

}
