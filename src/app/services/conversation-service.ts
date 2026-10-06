import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ConversationService {

  private readonly urlApi = 'https://neumatica-embudo-whatsap.onrender.com/api/conversations';
  // private readonly urlApi = 'http://localhost:8080/api/conversations';


  constructor(
    private http: HttpClient
  ) {}


  /**
   * Toma una conversación.
   *
   * El interceptor agrega automáticamente:
   *
   * Authorization: Bearer JWT
   */
  public takeConversation(
    conversationId: string
  ): Observable<any> {

    return this.http.post(
      `${this.urlApi}/${conversationId}/take`,
      {}
    );
  }


  /**
   * Obtiene una conversación completa.
   */
  public getConversation(
    conversationId: string
  ): Observable<any> {

    return this.http.get(
      `${this.urlApi}/${conversationId}`
    );
  }


  /**
   * Envía un mensaje manual.
   */
  public sendMessage(
    conversationId: string,
    message: string
  ): Observable<any> {

    return this.http.post(
      `${this.urlApi}/${conversationId}/messages`,
      {
        message
      }
    );
  }

  /**
   * =====================================================
   * ENVIAR IMAGEN / DOCUMENTO
   * =====================================================
   */
  public sendMedia(
    conversationId: string,
    file: File,
    caption?: string | null
  ): Observable<any> {

    const formData =
      new FormData();

    /*
     * IMPORTANTE:
     *
     * Este nombre debe coincidir exactamente
     * con @RequestParam("file") de Spring.
     */
    formData.append(
      'file',
      file,
      file.name
    );


    /*
     * Caption opcional.
     */
    if (
      caption &&
      caption.trim()
    ) {

      formData.append(
        'caption',
        caption.trim()
      );

    }


    return this.http.post<any>(
      `${this.urlApi}/${conversationId}/media`,
      formData
    );

  }


  /**
   * Cierra conversación.
   */
  public closeConversation(
    conversationId: string
  ): Observable<any> {

    return this.http.post(
      `${this.urlApi}/${conversationId}/close`,
      {}
    );
  }


  /**
   * Devuelve conversación al BOT.
   */
  public returnToBot(
    conversationId: string
  ): Observable<any> {

    return this.http.post(
      `${this.urlApi}/${conversationId}/return-to-bot`,
      {}
    );
  }
}