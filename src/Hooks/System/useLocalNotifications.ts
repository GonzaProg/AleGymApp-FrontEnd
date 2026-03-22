import { useEffect } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export const useLocalNotifications = () => {
  useEffect(() => {
    // Solo ejecutamos en dispositivos nativos (Android/iOS)
    if (Capacitor.isNativePlatform()) {
      setupNotifications();
    }
  }, []);

  const setupNotifications = async () => {
    try {
      // 1. Verificar o pedir permisos
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

      // 2. Limpiar notificaciones programadas previamente para no duplicar
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel(pending);
      }

      // 2.5 Crear un canal de notificación (Requerido para Android 8+ y evita bugs de Xiaomi)
      await LocalNotifications.createChannel({
        id: 'gymmate_channel_v2', // ID nuevo para reiniciar las configuraciones cacheadas por Android
        name: 'Recordatorios de GymMate',
        description: 'Canal principal para los recordatorios de la aplicación',
        importance: 5, // 5 = High importance (Pop-up en pantalla)
        visibility: 1, // 1 = Public
      });

      // 3. Programar la notificación (Para pruebas: a los 10 segundos!)
      await LocalNotifications.schedule({
        notifications: [
          {
            title: '¡GymMate te necesita! 🚀',
            body: '¡Utiliza la app Diariamente!', 
            largeBody: 'Entra a la app un ratito al día para ayudarnos a terminar la prueba cerrada y así poder publicarlo en la Play Store. Y cualquier duda o error que encuentres hazmelo saber. ¡Muchas Gracias!',
            largeIcon: 'gymmate512x512',
            smallIcon: 'gymmate_silueta512x512', 
            iconColor: '#FF6B00', 
            id: 2, // ID cambiado a 2 por si el 1 fue bloqueado por el sistema antes
            channelId: 'gymmate_channel_v2', 
            schedule: {
              on: { hour: 10, minute: 0 }, // Suena todos los días exactamente a las 10:00 AM
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
