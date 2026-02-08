import { useEffect } from 'react';
import { showSuccess } from '../../Helpers/Alerts';

export const useUpdateListener = () => {
  useEffect(() => {
    // Accedemos a la API segura que expusimos en el preload
    // Usamos (window as any) para evitar errores de TS rápido
    const electron = (window as any).electronAPI;

    if (electron) {
      console.log("Escuchando actualizaciones...");

      const handleUpdateReady = () => {
        showSuccess(
          "¡Actualización Lista! 🚀. La nueva versión se instalará automáticamente al cerrar la app."
        );
      };

      // Usamos nuestra función segura 'on'
      electron.on('update_ready', handleUpdateReady);

      // Limpieza
      return () => {
        electron.removeAllListeners('update_ready');
      };
    }
  }, []);
};