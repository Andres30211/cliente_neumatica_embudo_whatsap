import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoginRequest } from '../interfaces/LoginRequest';
import { Observable, tap } from 'rxjs';
import { AuthResponse } from '../interfaces/AuthResponse';
import { RegisterRequest } from '../interfaces/RegisterRequest';
import { TokensServices } from './tokens-services';

@Injectable({
  providedIn: 'root',
})
export class AuthServices {

  // private apiUrl:string = 'http://localhost:8080/api/auth';
  private apiUrl:string = 'https://security-service-neumatica.onrender.com/api/auth';

  constructor(private http: HttpClient, private tokensServices: TokensServices){}

  public despertar(): Observable<any>{
    return this.http.get(`${this.apiUrl}/despertar`, {responseType: 'text'});
  }

  public register(request: RegisterRequest): Observable<AuthResponse> {

    return this.http.post<AuthResponse>(`${this.apiUrl}/register`,request).pipe(
        tap(response => {

          this.tokensServices.saveTokens(response.accessToken, response.refreshToken);

        })

      );
  }

  public login(request: LoginRequest): Observable<AuthResponse> {

    return this.http.post<AuthResponse>(`${this.apiUrl}/login`,request).pipe(
        tap(response => {

          this.tokensServices.saveTokens(response.accessToken, response.refreshToken);

        })

      );
  }

  public refreshToken(): Observable<AuthResponse> {

    const refreshToken = this.tokensServices.getRefreshToken();

    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh`,{refreshToken: refreshToken});
  }

  public isAuthenticated(): boolean {

    const token = localStorage.getItem('access_token');

    return !!token;
  }

  public logout(): void {

    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
  
}
