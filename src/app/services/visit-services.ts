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
  ) {}


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
     * Obtener la imagen del FormData.
     */

    const image =
      formData.get('image');


    /*
     * Si no existe imagen,
     * enviamos directamente.
     */

    if (!(image instanceof File)) {

      return this.http.post<VisitResponse>(
        this.apiUrl,
        formData
      );

    }


    /*
     * Comprimir imagen.
     */

    return from(
      this.compressImage(image)
    ).pipe(

      switchMap(
        compressedImage => {


          /*
           * Crear un nuevo FormData.
           *
           * No modificamos el original.
           */

          const compressedFormData =
            new FormData();


          /*
           * Copiar datos.
           */

          const companyName =
            formData.get('companyName');


          const comment =
            formData.get('comment');


          const latitude =
            formData.get('latitude');


          const longitude =
            formData.get('longitude');


          const accuracy =
            formData.get('accuracy');


          if (companyName !== null) {

            compressedFormData.append(
              'companyName',
              companyName.toString()
            );

          }


          if (comment !== null) {

            compressedFormData.append(
              'comment',
              comment.toString()
            );

          }


          if (latitude !== null) {

            compressedFormData.append(
              'latitude',
              latitude.toString()
            );

          }


          if (longitude !== null) {

            compressedFormData.append(
              'longitude',
              longitude.toString()
            );

          }


          if (accuracy !== null) {

            compressedFormData.append(
              'accuracy',
              accuracy.toString()
            );

          }


          /*
           * Agregar imagen comprimida.
           */

          compressedFormData.append(
            'image',
            compressedImage,
            'visit-image.jpg'
          );


          /*
           * Enviar.
           */

          return this.http.post<VisitResponse>(
            this.apiUrl,
            compressedFormData
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