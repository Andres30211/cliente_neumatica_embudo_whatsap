import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Contact } from '../interfaces/Contact';
import { ContactPage } from '../interfaces/ContactPage';

@Injectable({
  providedIn: 'root',
})
export class ServicesWhatsapp {
  
  private urlWhatsapp: string = 'https://neumatica-embudo-whatsap.onrender.com/webhook';

  constructor(private http: HttpClient){}

  public getContacts(page: number = 0): Observable<ContactPage> {

    const params = new HttpParams().set('page', page);

    return this.http.get<ContactPage>(`${this.urlWhatsapp}/contacts`,{ params });
  }

  public sendCampaing(): Observable<string>{
    return this.http.post(`${this.urlWhatsapp}/sendCampaing`, {}, {responseType: 'text'});
  }

  downloadExcel(): Observable<Blob> {
    return this.http.get(`${this.urlWhatsapp}/export`,{responseType: 'blob'});
  }
  
}
