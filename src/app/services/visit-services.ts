import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface VisitRequest {

  companyName: string;

  comment: string;

  latitude: number;

  longitude: number;

  accuracy: number;
}


export interface VisitResponse {

  id: string;

  userId: string;

  userName: string;

  companyName: string;

  comment: string;

  imageUrl: string;

  latitude: number;

  longitude: number;

  accuracy: number;

  visitedAt: string;

  createdAt: string;
}


@Injectable({
  providedIn: 'root',
})
export class VisitServices {

  private readonly apiUrl =
    'https://service-location-neumatica.onrender.com/api/visits';


  constructor(
    private http: HttpClient
  ) {}


  /*
   * =========================================================
   * CREAR VISITA
   * =========================================================
   */
  createVisit(

    request: VisitRequest,

    image: File

  ): Observable<VisitResponse> {


    const formData =
      new FormData();


    /*
     * Datos de la visita.
     */
    const blob =
      new Blob(
        [
          JSON.stringify(request)
        ],
        {
          type: 'application/json'
        }
      );


    formData.append(
      'data',
      blob
    );


    /*
     * Imagen.
     */
    formData.append(
      'image',
      image
    );


    return this.http.post<VisitResponse>(
      this.apiUrl,
      formData
    );
  }


  /*
   * =========================================================
   * MIS VISITAS
   * =========================================================
   */
  getMyVisits():
    Observable<VisitResponse[]> {

    return this.http.get<VisitResponse[]>(
      `${this.apiUrl}/me`
    );
  }


  /*
   * =========================================================
   * TODAS LAS VISITAS
   * =========================================================
   */
  getAllVisits():
    Observable<VisitResponse[]> {

    return this.http.get<VisitResponse[]>(
      this.apiUrl
    );
  }


  /*
   * =========================================================
   * VISITA POR ID
   * =========================================================
   */
  getVisitById(
    id: string
  ): Observable<VisitResponse> {

    return this.http.get<VisitResponse>(
      `${this.apiUrl}/${id}`
    );
  }
  
}
