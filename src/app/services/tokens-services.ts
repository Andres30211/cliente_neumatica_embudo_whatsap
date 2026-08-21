import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  roles: string[];
  exp: number;
  iat: number;
  iss: string;
}

@Injectable({
  providedIn: 'root',
})
export class TokensServices {
  
  private readonly ACCESS_TOKEN = 'access_token';
  private readonly REFRESH_TOKEN = 'refresh_token';


  public saveTokens(accessToken: string,refreshToken: string): void {

    localStorage.setItem(this.ACCESS_TOKEN,accessToken);

    localStorage.setItem(this.REFRESH_TOKEN,refreshToken);
  }

  getToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN);
  }

  getPayload(): JwtPayload | null {

    const token = this.getToken();

    if (!token) {
      return null;
    }

    try {
      return jwtDecode<JwtPayload>(token);
    } catch (error) {
      console.error('Token inválido', error);
      return null;
    }
  }

  getName(): string | null {
    return this.getPayload()?.name ?? null;
  }

  getRoles(): string[] {
    return this.getPayload()?.roles ?? [];
  }

  hasRole(role: string): boolean {
    return this.getRoles().includes(role);
  }

  public getRefreshToken(): string | null {

    return localStorage.getItem(this.REFRESH_TOKEN);
  }

  public clearTokens(): void {

    localStorage.removeItem(this.ACCESS_TOKEN);

    localStorage.removeItem(this.REFRESH_TOKEN);
  }

  public hasAccessToken(): boolean {

    return !!this.getToken();
  }

}
