import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LocationRequest {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface LocationResponse {
  id: string;
  userId: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  // private readonly API_URL = 'http://localhost:8082/api/locations';
  private readonly API_URL = 'https://service-location-neumatica.onrender.com/api/locations';


  constructor(
    private http: HttpClient
  ) {}


  /*
   * Guarda una ubicación.
   *
   * IMPORTANTE:
   * El JWT será enviado automáticamente
   * por el interceptor de autenticación que
   * ya deberías tener en tu proyecto.
   */
  createLocation(
    location: LocationRequest
  ): Observable<LocationResponse> {

    return this.http.post<LocationResponse>(
      this.API_URL,
      location
    );
  }


  /*
   * Obtener nuestras ubicaciones.
   */
  getMyLocations(): Observable<LocationResponse[]> {

    return this.http.get<LocationResponse[]>(
      `${this.API_URL}/me`
    );
  }


  /*
   * Obtener última ubicación.
   */
  getLastLocation(): Observable<LocationResponse> {

    return this.http.get<LocationResponse>(
      `${this.API_URL}/me/last`
    );
  }
}
