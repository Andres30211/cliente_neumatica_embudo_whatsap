import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CheckInRequest {
  latitude: number;
  longitude: number;
  accuracy: number;
}


export interface AttendanceResponse {

  id: string;

  latitude: number;

  longitude: number;

  accuracy: number;

  checkInAt: string;

  checkOutAt?: string | null;

  insideCompany: boolean;
}


export interface AttendanceAdminResponse {

  id: string;

  userId: string;

  userName: string;

  userEmail: string;

  latitude: number;

  longitude: number;

  accuracy: number;

  checkInAt: string;

  checkOutAt?: string | null;

  insideCompany: boolean;
}


@Injectable({
  providedIn: 'root'
})
export class AttendanceService {

  private readonly apiUrl = 'https://service-location-neumatica.onrender.com/api/attendance';


  constructor(
    private http: HttpClient
  ) {}


  /*
   * ==========================================
   * CHECK-IN
   * ==========================================
   */
  checkIn(
    request: CheckInRequest
  ): Observable<AttendanceResponse> {

    return this.http.post<AttendanceResponse>(
      `${this.apiUrl}/check-in`,
      request
    );
  }


  /*
   * ==========================================
   * CHECK-OUT
   * ==========================================
   */
  checkOut(): Observable<AttendanceResponse> {

    return this.http.post<AttendanceResponse>(
      `${this.apiUrl}/check-out`,
      {}
    );
  }


  /*
   * ==========================================
   * MI HISTORIAL
   * ==========================================
   */
  getMyAttendances():
    Observable<AttendanceResponse[]> {

    return this.http.get<AttendanceResponse[]>(
      `${this.apiUrl}/me`
    );
  }


  /*
   * ==========================================
   * MI ASISTENCIA ACTUAL
   * ==========================================
   */
  getCurrentAttendance():
    Observable<AttendanceResponse> {

    return this.http.get<AttendanceResponse>(
      `${this.apiUrl}/me/current`
    );
  }


  /*
   * ==========================================
   * NUEVO
   *
   * ASISTENCIAS DEL DÍA
   * ==========================================
   */
  getTodayAttendances():Observable<AttendanceAdminResponse[]> {

    return this.http.get<AttendanceAdminResponse[]>(`${this.apiUrl}/today`);
  }
}