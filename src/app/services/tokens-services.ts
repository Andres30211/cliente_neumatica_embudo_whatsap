import { Injectable } from '@angular/core';

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


  public getAccessToken(): string | null {

    return localStorage.getItem(this.ACCESS_TOKEN);
  }


  public getRefreshToken(): string | null {

    return localStorage.getItem(this.REFRESH_TOKEN);
  }


  public clearTokens(): void {

    localStorage.removeItem(this.ACCESS_TOKEN);

    localStorage.removeItem(this.REFRESH_TOKEN);
  }


  public hasAccessToken(): boolean {

    return !!this.getAccessToken();
  }

}
