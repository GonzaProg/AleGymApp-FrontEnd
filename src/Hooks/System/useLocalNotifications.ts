import { useEffect, useRef } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { UsuarioApi } from '../../API/Usuarios/UsuarioApi';
import { useAuthUser } from '../Auth/useAuthUser';

export const useLocalNotifications = () => {
  const { currentUser } = useAuthUser();
  const pushRegistered = useRef(false);

  // 1. Notificaciones Locales Programadas (Las de las 10AM) - No requieren login
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      setupLocalNotifications();
    }
  }, []);

  // 2. Notificaciones Push Remotas - Requieren Login para obtener el ID y guardar Token
  useEffect(() => {
    if (Capacitor.isNativePlatform() && currentUser && currentUser.rol === 'Alumno' && !pushRegistered.current) {
      pushRegistered.current = true;
      setupPushNotifications();
    }
  }, [currentUser]);

  const setupPushNotifications = async () => {
    try {
      // Pedimos permisos para recibir
      let permStatus = await PushNotifications.checkPermissions();

      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive !== 'granted') {
        console.warn('Permisos FCM no concedidos por el usuario');
        return;
      }

      // Nos registramos para obtener el Token desde el servidor FCM de Google
      await PushNotifications.register();

      // Cuando obtenemos el token de éxito
      PushNotifications.addListener('registration', async (token) => {
        console.log('✅ FCM Registration Success, token: ' + token.value);
        try {
           // Lo enviamos a nuestra Base de Datos!
           await UsuarioApi.saveFcmToken(token.value);
           console.log('✅ FCM Token guardado existosamente en la BD');
        } catch (e) {
           console.error('❌ Error guardando FCM token', e);
        }
      });

      // Manejo de errores de registro
      PushNotifications.addListener('registrationError', (error: any) => {
        console.error('Error FCM registration: ' + JSON.stringify(error));
      });

      // Recepción en primer plano (Foreground)
      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push received: ', notification);
        // Opcionalmente podemos forzar mostrar la notificación localmente si el push no la despliega sobre la app
        LocalNotifications.schedule({
            notifications: [{
                title: notification.title || "Gym Mate",
                body: notification.body || "",
                id: Math.floor(Math.random() * 1000000),
                channelId: 'gymmate_channel_v2', 
                smallIcon: 'gymmate_silueta512x512', 
                iconColor: '#FF6B00'
            }]
        });
      });

      // Acción al tocar la notificación push
      PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('Push action performed: ', notification);
      });

    } catch (e) {
      console.error('Error setup Push Notifications', e);
    }
  };

  const setupLocalNotifications = async () => {
    try {
      const checkResult = await LocalNotifications.checkPermissions();
      let permissions = checkResult.display;
      
      if (permissions !== 'granted') {
          const requestResult = await LocalNotifications.requestPermissions();
          permissions = requestResult.display;
      }

      if (permissions !== 'granted') {
        console.warn('Permisos de notificación no concedidos');
        return;
      }

      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel(pending);
      }

      await LocalNotifications.createChannel({
        id: 'gymmate_channel_v2',
        name: 'Recordatorios de GymMate',
        description: 'Canal principal para los recordatorios de la aplicación',
        importance: 5,
        visibility: 1,
      });

      await LocalNotifications.schedule({
        notifications: [
          {
            title: '¡GymMate te necesita! 🚀',
            body: '¡Utiliza la app Diariamente!', 
            largeBody: 'Entra a la app un ratito al día para ayudarnos a terminar la prueba cerrada y así poder publicarlo en la Play Store. Y cualquier duda o error que encuentres hazmelo saber. ¡Muchas Gracias!',
            largeIcon: 'gymmate512x512',
            smallIcon: 'gymmate_silueta512x512', 
            iconColor: '#FF6B00', 
            id: 2,
            channelId: 'gymmate_channel_v2', 
            schedule: {
              on: { hour: 10, minute: 0 },
              allowWhileIdle: true 
            }
          }
        ]
      });
      
      console.log('Notificación recurrente diaria programada con éxito.');

    } catch (error) {
      console.error('Error configurando LocalNotifications:', error);
    }
  };
};
