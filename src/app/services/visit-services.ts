import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, switchMap } from 'rxjs';


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
   */

  createVisit(
    companyName: string,
    comment: string,
    latitude: number,
    longitude: number,
    accuracy: number,
    image: File
  ): Observable<VisitResponse> {

    /*
     * Primero comprimimos la imagen.
     */

    return from(
      this.compressImage(image)
    ).pipe(

      /*
       * Cuando termina la compresión,
       * enviamos la imagen resultante.
       */

      switchMap(
        (compressedImage) => {

          const formData =
            new FormData();


          formData.append(
            'companyName',
            companyName
          );


          formData.append(
            'comment',
            comment
          );


          formData.append(
            'latitude',
            latitude.toString()
          );


          formData.append(
            'longitude',
            longitude.toString()
          );


          formData.append(
            'accuracy',
            accuracy.toString()
          );


          formData.append(
            'image',
            compressedImage,
            'visit-image.jpg'
          );


          return this.http.post<VisitResponse>(
            this.apiUrl,
            formData
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
      (resolve, reject) => {

        const reader =
          new FileReader();


        reader.onload = (
          event: any
        ) => {

          const image =
            new Image();


          image.onload = () => {

            /*
             * Tamaño máximo.
             */

            const maxWidth = 1280;

            const maxHeight = 1280;


            let width =
              image.width;

            let height =
              image.height;


            /*
             * Redimensionar manteniendo
             * proporción.
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
             * Canvas.
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
             * 0.75 = 75% de calidad.
             */

            canvas.toBlob(
              (blob) => {

                if (!blob) {

                  reject(
                    new Error(
                      'No fue posible comprimir la imagen.'
                    )
                  );

                  return;
                }


                resolve(blob);

              },

              'image/jpeg',

              0.75
            );
          };


          image.onerror = () => {

            reject(
              new Error(
                'No fue posible cargar la imagen.'
              )
            );

          };


          image.src =
            event.target.result;
        };


        reader.onerror = () => {

          reject(
            new Error(
              'No fue posible leer la imagen.'
            )
          );

        };


        reader.readAsDataURL(file);
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
      `${this.apiUrl}/today`
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