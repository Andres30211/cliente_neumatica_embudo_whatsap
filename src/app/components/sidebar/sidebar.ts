import { Component } from '@angular/core';
import { RouterLink } from "@angular/router";
import { TokensServices } from '../../services/tokens-services';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {

  constructor(private tokensServices: TokensServices){}

  public meRol(rol: string): boolean{

    const roles = this.tokensServices.getRoles();

    return roles.includes(rol);
  }
}
