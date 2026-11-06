import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PushNotificationService {

  private readonly swPush = inject(SwPush);
  private readonly http = inject(HttpClient);

  // private readonly apiUrl = 'http://localhost:8080/api/push/subscriptions';
  private readonly apiUrl = 'https://neumatica-crm.netlify.app/api/push/subscriptions';

  // Aquí debes colocar la CLAVE PÚBLICA VAPID
  private readonly vapidPublicKey = 'BHQeAHPtUccBCSTJ9dYmSccc9B9RqCAfE1ggFNxGw576EBxcwe0RZq-Tbxgqs-UcmjoHw-HBonuxvrYbAoqZ5EE';

  constructor() {

    // Detectar cambios en la suscripción del navegador
    if (this.swPush.isEnabled) {
      this.swPush.pushSubscriptionChanges.subscribe({
        next: ({ newSubscription }) => {
          if (newSubscription) {
            this.registerSubscription(newSubscription)
              .catch(error => console.error(
                'Error sincronizando nueva suscripción:', error
              ));
          }
        },
        error: error => console.error('Error Push:', error)
      });
    }
  }

  // 1. Suscripción inicial: requiere acción del usuario
  async subscribeToNotifications(): Promise<void> {

    if (!this.swPush.isEnabled) {
      throw new Error('Service Worker no está habilitado');
    }

    const subscription = await this.swPush.requestSubscription({
      serverPublicKey: this.vapidPublicKey
    });

    await this.registerSubscription(subscription);
  }

  // 2. Sincronizar una suscripción que ya existe
  async syncSubscription(): Promise<void> {

    if (!this.swPush.isEnabled) {
      return;
    }

    const subscription = await firstValueFrom(
      this.swPush.subscription
    );

    if (subscription) {
      await this.registerSubscription(subscription);
    }
  }

  // Método reutilizable para registrar/sincronizar en Spring Boot
  private async registerSubscription(
    subscription: PushSubscription
  ): Promise<void> {

    const json = subscription.toJSON();

    const request = {
      endpoint: subscription.endpoint,
      p256dh: json.keys?.['p256dh'],
      auth: json.keys?.['auth']
    };

    if (!request.p256dh || !request.auth) {
      throw new Error('La suscripción no contiene las claves necesarias');
    }

    await firstValueFrom(
      this.http.post(this.apiUrl, request)
    );
  }
  
}
