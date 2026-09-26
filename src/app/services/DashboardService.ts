import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardSummary } from '../interfaces/DashboardSummary';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private readonly baseUrl =
    'http://localhost:8080/api/dashboard';

  constructor(
    private readonly http: HttpClient
  ) {}

  getSummary(
    from: string,
    to: string
  ): Observable<DashboardSummary> {

    const params = new HttpParams()
      .set('from', from)
      .set('to', to);

    return this.http.get<DashboardSummary>(
      `${this.baseUrl}/summary`,
      { params }
    );
  }
}