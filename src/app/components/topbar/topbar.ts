import { Component, OnInit } from '@angular/core';
import { TokensServices } from '../../services/tokens-services';
import { AuthServices } from '../../services/auth-services';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ServicesWebsocket } from '../../services/services-websocket';

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

  constructor(private tokenService: TokensServices, 
    private authService: AuthServices,
    private router: Router,
    private websocket: ServicesWebsocket) {}
  
  ngOnInit(): void {
    
    this.nombre = this.tokenService.getName() ?? '';

    this.websocket.notifications$.subscribe(
      notification => {

        this.unreadCount++;

        console.log('Nueva notificación', notification);

      }
    );
    
  }

  public cerrarSesion(){

    this.authService.logout();
    this.router.navigate(['/login']);

  }

  public toggleMenu(): void {

    this.menuAbierto = this.menuAbierto === false ? true : false;

  }
}
