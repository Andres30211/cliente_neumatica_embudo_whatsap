import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CheckInRequest {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface AttendanceResponse {

  id: string;

  userId: string;

  locationId: string;

  latitude: number;

  longitude: number;

  accuracy?: number;

  checkInAt: string;

  checkOutAt?: string;

  insideCompany: boolean;
}


@Injectable({
  providedIn: 'root'
})
export class AttendanceService {

  // private readonly API_URL = 'http://localhost:8082/api/attendance';
  private readonly API_URL = 'https://service-location-neumatica.onrender.com/api/attendance';


  constructor(
    private http: HttpClient
  ) {}


  /*
   * Registrar entrada.
   */
  checkIn(
    location: CheckInRequest
  ): Observable<AttendanceResponse> {

    return this.http.post<AttendanceResponse>(
      `${this.API_URL}/check-in`,
      location
    );
  }


  /*
   * Registrar salida.
   */
  checkOut(): Observable<AttendanceResponse> {

    return this.http.post<AttendanceResponse>(
      `${this.API_URL}/check-out`,
      {}
    );
  }


  /*
   * Obtener asistencia actual.
   */
  getCurrentAttendance(): Observable<AttendanceResponse> {

    return this.http.get<AttendanceResponse>(
      `${this.API_URL}/me/current`
    );
  }


  /*
   * Obtener historial.
   */
  getMyAttendances(): Observable<AttendanceResponse[]> {

    return this.http.get<AttendanceResponse[]>(
      `${this.API_URL}/me`
    );
  }
}
