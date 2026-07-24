import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Contact } from '../interfaces/Contact';

@Injectable({
  providedIn: 'root',
})
export class ServicesWhatsapp {
  
  private urlWhatsapp: string = 'https://neumatica-embudo-whatsap.onrender.com/webhook';

  constructor(private http: HttpClient){}

  public getContacts():Observable<any>{
    return this.http.get<Contact[]>(`${this.urlWhatsapp}/contacts`);
  }

  public sendCampaing(): Observable<string>{
    return this.http.post(`${this.urlWhatsapp}/sendCampaing`, {}, {responseType: 'text'});
  }

  downloadExcel(): Observable<Blob> {
    return this.http.get(`${this.urlWhatsapp}/export`,{responseType: 'blob'});
  }
  
}
