import {
  HttpClient,
  HttpParams
} from '@angular/common/http';

import {
  Injectable
} from '@angular/core';

import {
  Observable
} from 'rxjs';

import {
  ContactPage
} from '../interfaces/ContactPage';


@Injectable({
  providedIn: 'root',
})
export class ServicesWhatsapp {


  // =========================================================
  // API
  // =========================================================

  private readonly urlWhatsapp ='https://neumatica-embudo-whatsap.onrender.com/webhook';

  // private readonly urlWhatsapp = 'http://localhost:8080/webhook';


  constructor(
    private http: HttpClient
  ) { }


  // =========================================================
  // CONTACTOS
  // =========================================================

  public getContacts(
    page: number = 0
  ): Observable<ContactPage> {

    const params =
      new HttpParams()
        .set(
          'page',
          page
        );

    return this.http.get<ContactPage>(
      `${this.urlWhatsapp}/contacts`,
      {
        params
      }
    );
  }


  // =========================================================
  // MULTIMEDIA
  // =========================================================

  /**
   * Obtiene el archivo multimedia asociado
   * a un mensaje de WhatsApp.
   *
   * IMPORTANTE:
   *
   * El backend busca por:
   *
   * whatsappMessageId
   *
   * NO por el UUID interno de Message.
   */
  public getMessageMedia(
    whatsappMessageId: string
  ): Observable<Blob> {

    return this.http.get(
      `${this.urlWhatsapp}/messages/${encodeURIComponent(
        whatsappMessageId
      )}/media`,
      {
        responseType: 'blob'
      }
    );
  }


  // =========================================================
  // CAMPAÑA
  // =========================================================

  public sendCampaing():
    Observable<string> {

    return this.http.post(
      `${this.urlWhatsapp}/sendCampaing`,
      {},
      {
        responseType: 'text'
      }
    );
  }


  // =========================================================
  // EXCEL
  // =========================================================

  public downloadExcel():
    Observable<Blob> {

    return this.http.get(
      `${this.urlWhatsapp}/export`,
      {
        responseType: 'blob'
      }
    );
  }

}