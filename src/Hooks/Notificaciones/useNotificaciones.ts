import { useState, useEffect, useCallback } from "react";
import { NotificacionesApi, type Notificacion } from "../../API/Notificaciones/NotificacionesApi";
import { showError, showSuccess } from "../../Helpers/Alerts";

export const useNotificaciones = () => {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Cargar notificaciones
  const fetchNotificaciones = useCallback(async () => {
    try {
      const data = await NotificacionesApi.getMyNotifications();
      setNotificaciones(data);
      // Contar no leídas
      setUnreadCount(data.filter((n) => !n.leida).length);
    } catch (error) {
      console.error("Error cargando notificaciones", error);
    }
  }, []);

  // Marcar como leída
  const markAsRead = async (id: number) => {
    try {
      // Optimistic update: Actualizamos la UI antes de que responda el server
      setNotificaciones((prev) =>
        prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      
      await NotificacionesApi.markAsRead(id);
    } catch (error) {
      console.error("Error al marcar como leída", error);
      fetchNotificaciones(); // Revertir si falla
    }
  };

  // Crear notificación (Broadcast)
  const sendBroadcast = async (titulo: string, mensaje: string) => {
    setLoading(true);
    try {
      await NotificacionesApi.broadcast(titulo, mensaje);
      showSuccess("✅ Notificación enviada a todos los usuarios.");
    } catch (error: any) {
      showError("❌ Error al enviar: " + (error.response?.data?.error || "Desconocido"));
    } finally {
      setLoading(false);
    }
  };

  // Cargar al montar el hook
  useEffect(() => {
    fetchNotificaciones();
    // Opcional: Podrías poner un setInterval aquí para polling cada 60s
  }, [fetchNotificaciones]);

  return {
    notificaciones,
    unreadCount,
    loading,
    markAsRead,
    sendBroadcast,
    refresh: fetchNotificaciones,
  };
};