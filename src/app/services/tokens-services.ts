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

  /**
   * Guarda los tokens dependiendo de la opción
   * "Recordarme en este dispositivo".
   *
   * rememberMe = true
   *  -> localStorage
   *
   * rememberMe = false
   *  -> sessionStorage
   */
  public saveTokens(
    accessToken: string,
    refreshToken: string,
    rememberMe?: boolean
  ): void {

    /*
     * Si se está guardando después del login,
     * rememberMe vendrá definido.
     *
     * Si se está guardando después de un refresh,
     * rememberMe será undefined y detectaremos
     * dónde estaba almacenada la sesión.
     */

    let storage: Storage;

    if (rememberMe !== undefined) {

      storage = rememberMe
        ? localStorage
        : sessionStorage;

    } else {

      /*
       * Estamos renovando tokens.
       *
       * Si ya existía en localStorage,
       * debemos mantenerlo allí.
       *
       * Si existía en sessionStorage,
       * debemos mantenerlo allí.
       */

      if (localStorage.getItem(this.REFRESH_TOKEN)) {

        storage = localStorage;

      } else {

        storage = sessionStorage;
      }
    }

    /*
     * Eliminamos posibles tokens anteriores
     * de ambos storages para evitar tener
     * sesiones duplicadas.
     */
    this.clearTokens();

    /*
     * Guardamos los nuevos tokens en el storage
     * correspondiente.
     */
    storage.setItem(this.ACCESS_TOKEN, accessToken);
    storage.setItem(this.REFRESH_TOKEN, refreshToken);
  }

  /**
   * Obtiene el Access Token.
   *
   * Primero busca en localStorage.
   * Si no existe, busca en sessionStorage.
   */
  public getAccesToken(): string | null {

    return (
      localStorage.getItem(this.ACCESS_TOKEN) ??
      sessionStorage.getItem(this.ACCESS_TOKEN)
    );
  }

  /**
   * Obtiene la información contenida dentro
   * del JWT.
   */
  public getPayload(): JwtPayload | null {

    const token = this.getAccesToken();

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

  /**
   * Obtiene el nombre del usuario.
   */
  public getName(): string | null {

    return this.getPayload()?.name ?? null;
  }

  /**
   * Obtiene los roles del usuario.
   */
  public getRoles(): string[] {

    return this.getPayload()?.roles ?? [];
  }

  /**
   * Comprueba si el usuario tiene un determinado rol.
   */
  public hasRole(role: string): boolean {

    return this.getRoles().includes(role);
  }

  /**
   * Obtiene el Refresh Token.
   */
  public getRefreshToken(): string | null {

    return (
      localStorage.getItem(this.REFRESH_TOKEN) ??
      sessionStorage.getItem(this.REFRESH_TOKEN)
    );
  }

  /**
   * Elimina los tokens de ambos storages.
   *
   * Esto se utiliza al cerrar sesión o cuando
   * el Refresh Token deja de ser válido.
   */
  public clearTokens(): void {

    localStorage.removeItem(this.ACCESS_TOKEN);
    localStorage.removeItem(this.REFRESH_TOKEN);

    sessionStorage.removeItem(this.ACCESS_TOKEN);
    sessionStorage.removeItem(this.REFRESH_TOKEN);
  }

  /**
   * Comprueba si existe un Access Token.
   */
  public hasAccessToken(): boolean {

    return !!this.getAccesToken();
  }

  /**
   * Comprueba si el Access Token está expirado.
   *
   * exp viene expresado en segundos desde Unix Epoch.
   */
  public isAccessTokenExpired(): boolean {

    const payload = this.getPayload();

    if (!payload?.exp) {
      return true;
    }

    const currentTime = Math.floor(Date.now() / 1000);

    return payload.exp <= currentTime;
  }
}