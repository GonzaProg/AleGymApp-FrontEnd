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

      // Eliminé la notificación diaria recurrente

    } catch (error) {
      console.error('Error configurando LocalNotifications:', error);
    }
  };
};
