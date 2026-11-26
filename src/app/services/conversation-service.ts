import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { NotificationServices } from './notification-services';

@Injectable({
  providedIn: 'root',
})
export class ConversationService {

  private readonly urlApi = 'https://neumatica-embudo-whatsap.onrender.com/api/conversations';
  // private readonly urlApi = 'http://localhost:8080/api/conversations';


  constructor(
    private http: HttpClient,
    private notificationService: NotificationServices
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

  public markConversationAsRead(conversationId: string): Observable<void> {

    return this.http.patch<void>(`${this.urlApi}/${conversationId}/read`,{});

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
  /*public sendMedia(conversationId: string, file: File, caption?: string | null): Observable<any> {

    const formData = new FormData();

    this.notificationService.info("FORM DATA",
      `
       'Existe archivo:', ${formData.has('file')}
       'Archivo en FormData:', ${formData.get('file')}
       'Nombre:', ${file.name}
       'Tipo:', ${file.type}
       'Tamaño:', ${file.size}
      `
    );

    /*
     * IMPORTANTE:
     *
     * Este nombre debe coincidir exactamente
     * con @RequestParam("file") de Spring.
     */
    /*formData.append('file', file, file.name);*/

    /*
     * Caption opcional.
     */
    /*if (caption && caption.trim()) {

      formData.append('caption', caption.trim());

    }

    return this.http.post<any>(`${this.urlApi}/${conversationId}/media`, formData);

  }*/

  public sendMedia(
    conversationId: string,
    file: File,
    caption?: string | null
  ): Observable<any> {

    const formData = new FormData();

    // Agregamos el archivo
    formData.append('file', file, file.name);

    if (caption && caption.trim()) {
      formData.append('caption', caption.trim());
    }

    // Diagnóstico: comprobar el FormData inmediatamente después del append
    const archivoFormData = formData.get('file');

    this.notificationService.info(
      'DIAGNÓSTICO FORM DATA iPhone',
      `
      Nombre original: ${file.name}
      Tipo MIME: ${file.type}
      Tamaño: ${file.size}

      ¿Es instancia de File?: ${file instanceof File}
      ¿Es instancia de Blob?: ${file instanceof Blob}

      FormData tiene archivo: ${formData.has('file')}
      FormData.get('file'): ${archivoFormData ? 'SÍ EXISTE' : 'NULL'}

      Tipo del objeto agregado: ${archivoFormData?.constructor?.name || 'Ninguno'}
      Nombre del objeto agregado: ${(archivoFormData as File)?.name || 'Sin nombre'}

      Claves del FormData: ${Array.from(formData.keys()).join(', ') || 'NINGUNA'}
      `
    );

    // No establecer Content-Type manualmente.
    return this.http.post<any>(
      `${this.urlApi}/${conversationId}/media`,
      formData
    );
  }

  
  /**
   * Envía un audio grabado a una conversación.
   */
  public sendAudio(conversationId: string, file: File): Observable<any> {

    const formData = new FormData();

    formData.append('file', file, file.name);

    return this.http.post<any>(`${this.urlApi}/${conversationId}/media`, formData);
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