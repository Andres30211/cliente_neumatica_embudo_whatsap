import {
  Injectable
} from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';

import {
  Observable,
  from,
  switchMap
} from 'rxjs';


/*
 * =========================================================
 * RESPONSE
 * =========================================================
 */

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


/*
 * =========================================================
 * SERVICE
 * =========================================================
 */

@Injectable({
  providedIn: 'root'
})
export class VisitService {


  private readonly apiUrl =
    'https://service-location-neumatica.onrender.com/api/visits';


  constructor(
    private http: HttpClient
  ) { }


  /*
   * =========================================================
   * CREAR VISITA
   * =========================================================
   *
   * Recibe un FormData completo:
   *
   * companyName
   * comment
   * latitude
   * longitude
   * accuracy
   * image
   *
   * La imagen se comprime antes de enviarla.
   * =========================================================
   */

  createVisit(
    formData: FormData
  ): Observable<VisitResponse> {

    /*
     * =========================================================
     * OBTENER IMAGEN ORIGINAL
     * =========================================================
     */

    const image =
      formData.get('image');


    /*
     * La imagen es obligatoria.
     */

    if (!(image instanceof File)) {

      throw new Error(
        'La imagen es obligatoria.'
      );

    }


    /*
     * =========================================================
     * COMPRIMIR SOLAMENTE LA IMAGEN
     * =========================================================
     *
     * La petición NO se comprime.
     *
     * Primero reducimos la imagen y después
     * construimos el multipart/form-data.
     */

    return from(
      this.compressImage(image)
    ).pipe(

      switchMap(
        compressedImage => {


          /*
           * =====================================================
           * DATOS DE LA VISITA
           * =====================================================
           */

          const data = {

            companyName:
              formData
                .get('companyName')
                ?.toString() || '',

            comment:
              formData
                .get('comment')
                ?.toString() || '',

            latitude:
              Number(
                formData.get('latitude')
              ),

            longitude:
              Number(
                formData.get('longitude')
              ),

            accuracy:
              Number(
                formData.get('accuracy')
              )

          };


          /*
           * =====================================================
           * CREAR NUEVO FORMDATA
           * =====================================================
           */

          const requestData =
            new FormData();


          /*
           * =====================================================
           * PARTE "data"
           * =====================================================
           *
           * Spring Boot espera:
           *
           * @RequestPart("data")
           * VisitRequest request
           *
           */

          const jsonBlob =
            new Blob(
              [
                JSON.stringify(data)
              ],
              {
                type: 'application/json'
              }
            );


          requestData.append(
            'data',
            jsonBlob
          );


          /*
           * =====================================================
           * PARTE "image"
           * =====================================================
           *
           * Aquí enviamos la imagen YA COMPRIMIDA.
           */

          requestData.append(
            'image',
            compressedImage,
            'visit-image.jpg'
          );


          /*
           * =====================================================
           * ENVIAR PETICIÓN
           * =====================================================
           */

          return this.http.post<VisitResponse>(
            this.apiUrl,
            requestData
          );

        }
      )

    );

  }


  /*
   * =========================================================
   * COMPRIMIR IMAGEN
   * =========================================================
   */

  private compressImage(
    file: File
  ): Promise<Blob> {

    return new Promise(
      (
        resolve,
        reject
      ) => {


        const reader =
          new FileReader();


        /*
         * Error leyendo archivo.
         */

        reader.onerror =
          () => {

            reject(
              new Error(
                'No fue posible leer la imagen.'
              )
            );

          };


        /*
         * Archivo cargado.
         */

        reader.onload =
          (event: ProgressEvent<FileReader>) => {


            const result =
              event.target?.result;


            if (
              typeof result !== 'string'
            ) {

              reject(
                new Error(
                  'No fue posible procesar la imagen.'
                )
              );

              return;

            }


            const image =
              new Image();


            /*
             * Error cargando imagen.
             */

            image.onerror =
              () => {

                reject(
                  new Error(
                    'No fue posible cargar la imagen.'
                  )
                );

              };


            /*
             * Imagen cargada.
             */

            image.onload =
              () => {


                /*
                 * Tamaño máximo.
                 */

                const maxWidth =
                  1280;

                const maxHeight =
                  1280;


                let width =
                  image.width;

                let height =
                  image.height;


                /*
                 * Mantener proporción.
                 */

                if (
                  width > maxWidth ||
                  height > maxHeight
                ) {

                  const ratio =
                    Math.min(
                      maxWidth / width,
                      maxHeight / height
                    );


                  width =
                    Math.round(
                      width * ratio
                    );


                  height =
                    Math.round(
                      height * ratio
                    );

                }


                /*
                 * Crear canvas.
                 */

                const canvas =
                  document.createElement(
                    'canvas'
                  );


                canvas.width =
                  width;

                canvas.height =
                  height;


                const context =
                  canvas.getContext(
                    '2d'
                  );


                if (!context) {

                  reject(
                    new Error(
                      'No fue posible procesar la imagen.'
                    )
                  );

                  return;

                }


                /*
                 * Dibujar imagen.
                 */

                context.drawImage(
                  image,
                  0,
                  0,
                  width,
                  height
                );


                /*
                 * Convertir a JPEG.
                 *
                 * 0.70 = 70% calidad.
                 *
                 * Esto ayuda a reducir considerablemente
                 * el tamaño de la petición.
                 */

                canvas.toBlob(
                  blob => {

                    if (!blob) {

                      reject(
                        new Error(
                          'No fue posible comprimir la imagen.'
                        )
                      );

                      return;

                    }


                    resolve(
                      blob
                    );

                  },

                  'image/jpeg',

                  0.70
                );

              };


            /*
             * Cargar imagen.
             */

            image.src =
              result;

          };


        /*
         * Leer archivo.
         */

        reader.readAsDataURL(
          file
        );

      }
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
      `${this.apiUrl}`
    );

  }

  getImageUrl(imageUrl: string): string {

    if (!imageUrl) {
      return '';
    }

    if (imageUrl.startsWith('http://') ||
      imageUrl.startsWith('https://')) {
      return imageUrl;
    }

    return `https://service-location-neumatica.onrender.com/${imageUrl}`;
  }


  /*
   * =========================================================
   * BUSCAR POR ID
   * =========================================================
   */

  getById(
    id: string
  ): Observable<VisitResponse> {

    return this.http.get<VisitResponse>(
      `${this.apiUrl}/${id}`
    );

  }

}