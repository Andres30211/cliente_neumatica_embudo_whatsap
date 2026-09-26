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