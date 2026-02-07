import { useEffect } from 'react';
import { showSuccess } from '../../Helpers/Alerts'; // Usamos tus alertas existentes

export const useUpdateListener = () => {
  useEffect(() => {
    // Verificamos si estamos en un entorno que soporta 'require' (Electron)
    if (window.require) {
      const { ipcRenderer } = window.require('electron');

      // Definimos la función que maneja el evento
      const handleUpdateReady = () => {
        showSuccess(
          "¡Actualización Lista! 🚀. La nueva versión se instalará automáticamente al reiniciar la aplicación."
        );
      };

      // Escuchamos el evento que enviamos desde el backend
      ipcRenderer.on('update_ready', handleUpdateReady);

      // Limpieza: dejamos de escuchar si el componente se desmonta
      return () => {
        ipcRenderer.removeListener('update_ready', handleUpdateReady);
      };
    }
  }, []);
};