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

    const registerPush = async () => {
      try {
        // 1. Pedir permisos
        const permission = await PushNotifications.requestPermissions();

        if (permission.receive === 'granted') {
          // 2. Registrar con Apple / Google para recibir tokens
          await PushNotifications.register();
        } else {
          console.log('Permisos de notificaciones push denegados');
        }
      } catch (error) {
        console.error('Error registrando Push Notifications:', error);
      }
    };

    // 3. Listeners
    const addListeners = async () => {
      // Registro exitoso, obtenemos el token
      await PushNotifications.addListener('registration', async (token: Token) => {
        console.log('Push registration success, token:', token.value);
        try {
          // Guardar el token en el backend
          await UsuarioApi.saveFcmToken(token.value);
        } catch (error) {
          console.error('Error guardando FCM token:', error);
        }
      });

      // Error en el registro
      await PushNotifications.addListener('registrationError', (error: any) => {
        console.error('Error on push registration:', error);
      });

      // Notificación recibida en primer plano (app abierta)
      await PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
        console.log('Push received:', notification);
        // Recargar las notificaciones in-app
        if (refresh) {
          refresh();
        }
      });

      // Acción sobre la notificación (el usuario la toca en la barra)
      await PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
        console.log('Push action performed:', notification);
        // Podrías navegar a una pantalla específica aquí si es necesario
      });
    };

    registerPush();
    addListeners();

    // Limpieza
    return () => {
      PushNotifications.removeAllListeners();
    };
  }, [currentUser]); // Dependencia: se vuelve a ejecutar si cambia el usuario (login/logout)
};
