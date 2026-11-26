import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { NotificationServices } from './notification-services';
import { TokensServices } from './tokens-services';

@Injectable({
  providedIn: 'root',
})
export class ConversationService {

  private readonly urlApi = 'https://neumatica-embudo-whatsap.onrender.com/api/conversations';
  // private readonly urlApi = 'http://localhost:8080/api/conversations';


  constructor(
    private http: HttpClient,
    private notificationService: NotificationServices,
    private tokensServices: TokensServices
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

  }

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
  }*/

    public sendMediaXHR(
  conversationId: string,
  file: File,
  caption?: string | null
): Observable<any> {

  return new Observable(observer => {

    const formData = new FormData();

    // Agregar archivo
    formData.append('file', file, file.name);

    // Agregar descripción si existe
    if (caption?.trim()) {
      formData.append('caption', caption.trim());
    }

    // Crear petición nativa del navegador
    const xhr = new XMLHttpRequest();

    xhr.open(
      'POST',
      `${this.urlApi}/${conversationId}/media`,
      true
    );

    // Obtener token utilizando tu TokensServices
    const token = this.tokensServices.getAccesToken();

    if (!token) {
      observer.error({
        status: 401,
        message: 'No se encontró el token de autenticación.'
      });

      return;
    }

    // Agregar autenticación
    xhr.setRequestHeader(
      'Authorization',
      `Bearer ${token}`
    );

    // Diagnóstico temporal para iOS
    this.notificationService.info(
      'DIAGNÓSTICO XHR iOS',
      `
      Método: POST
      URL: ${xhr.responseURL || this.urlApi + '/' + conversationId + '/media'}

      Archivo: ${file.name}
      MIME: ${file.type}
      Tamaño: ${file.size} bytes

      FormData tiene archivo: ${formData.has('file')}

      Authorization: ${token ? 'PRESENTE' : 'AUSENTE'}

      Transporte: XMLHttpRequest
      `
    );

    xhr.onload = () => {

      if (xhr.status >= 200 && xhr.status < 300) {

        try {
          const response = xhr.responseText
            ? JSON.parse(xhr.responseText)
            : null;

          observer.next(response);
          observer.complete();

        } catch (error) {
          observer.error({
            status: xhr.status,
            message: 'No fue posible interpretar la respuesta del servidor.',
            response: xhr.responseText
          });
        }

      } else {

        observer.error({
          status: xhr.status,
          message: xhr.responseText || 'Error enviando archivo.'
        });

      }
    };

    xhr.onerror = () => {
      observer.error({
        status: xhr.status,
        message: 'Error de conexión durante el envío multimedia.'
      });
    };

    xhr.onabort = () => {
      observer.error({
        status: xhr.status,
        message: 'El envío del archivo fue cancelado.'
      });
    };

    xhr.upload.onloadstart = () => {
  this.notificationService.info(
    'XHR - INICIO DE ENVÍO',
    `
    El navegador comenzó a transmitir el archivo.

    Archivo: ${file.name}
    Tamaño esperado: ${file.size} bytes
    `
  );
};

xhr.upload.onprogress = (event) => {
  this.notificationService.info(
    'XHR - PROGRESO',
    `
    Archivo: ${file.name}

    Bytes enviados: ${event.loaded}

    Total reportado: ${event.total}

    Longitud computable: ${event.lengthComputable}
    `
  );
};

xhr.upload.onload = () => {
  this.notificationService.info(
    'XHR - ENVÍO FINALIZADO',
    `
    El navegador terminó de transmitir el cuerpo de la petición.
    Archivo: ${file.name}
    Tamaño: ${file.size} bytes
    `
  );
};

    // Enviar FormData sin configurar Content-Type
    xhr.send(formData);

    return () => {
      if (xhr.readyState !== XMLHttpRequest.DONE) {
        xhr.abort();
      }
    };

  });
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