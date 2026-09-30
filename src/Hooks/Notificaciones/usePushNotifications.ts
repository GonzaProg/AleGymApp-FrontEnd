import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications, type Token, type ActionPerformed, type PushNotificationSchema } from '@capacitor/push-notifications';
import { UsuarioApi } from '../../API/Usuarios/UsuarioApi';
import { useNotificaciones } from './useNotificaciones';

export const usePushNotifications = (currentUser: any) => {
  const { refresh } = useNotificaciones();

  useEffect(() => {
    // Solo ejecutamos en dispositivos nativos (Android/iOS) y si hay usuario logueado
    if (!Capacitor.isNativePlatform() || !currentUser) {
      return;
    }

    const setupPush = async () => {
      try {
        // 1. PRIMERO agregamos los Listeners (para no perdernos el evento si ocurre muy rápido)
        await PushNotifications.addListener('registration', async (token: Token) => {
          console.log('Push registration success, token:', token.value);
          try {
            await UsuarioApi.saveFcmToken(token.value);
          } catch (error) {
            console.error('Error guardando FCM token:', error);
          }
        });

        await PushNotifications.addListener('registrationError', (error: any) => {
          console.error('Error on push registration:', error);
        });

        await PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
          console.log('Push received:', notification);
          if (refresh) refresh();
        });

        await PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
          console.log('Push action performed:', notification);
        });

        // 2. Comprobamos permisos actuales
        let permStatus = await PushNotifications.checkPermissions();

        // 3. Si no los tenemos, los pedimos
        if (permStatus.receive === 'prompt') {
          permStatus = await PushNotifications.requestPermissions();
        }

        // 4. Si el permiso está concedido, registramos el dispositivo
        if (permStatus.receive === 'granted') {
          await PushNotifications.register();
        } else {
          console.log('Permisos de notificaciones push denegados por el usuario.');
        }

      } catch (error) {
        console.error('Error configurando Push Notifications:', error);
      }
    };

    setupPush();

    // Limpieza
    return () => {
      PushNotifications.removeAllListeners();
    };
  }, [currentUser]); // Dependencia: se vuelve a ejecutar si cambia el usuario (login/logout)
};
