import api from "../axios";

export interface Notificacion {
  id: number;
  titulo: string;
  mensaje: string;
  leida: boolean;
  fechaCreacion: string;
  activa: boolean;
  fechaExpiracion: string | null;
  usuario?: any;
}

export const NotificacionesApi = {
  // 1. Obtener mis notificaciones
  getMyNotifications: async (): Promise<Notificacion[]> => {
    const response = await api.get("/notificaciones/mis-notificaciones");
    return response.data;
  },

  // 2. Marcar como leída
  markAsRead: async (id: number): Promise<void> => {
    await api.put(`/notificaciones/${id}/leer`);
  },

  // 3. Crear notificación masiva (Solo admin/entrenador)
  broadcast: async (titulo: string, mensaje: string, duracionDias?: number): Promise<void> => {
    await api.post("/notificaciones/broadcast", { titulo, mensaje, duracionDias });
  },

  // 4. Crear notificación global (Solo admin - Todos los usuarios de la plataforma)
  broadcastGlobal: async (titulo: string, mensaje: string, duracionDias?: number): Promise<void> => {
    await api.post("/notificaciones/broadcast-global", { titulo, mensaje, duracionDias });
  },

  // 5. Obtener notificaciones del gimnasio (Para entrenador/admin)
  getGymNotifications: async (): Promise<Notificacion[]> => {
    const response = await api.get("/notificaciones/gym");
    return response.data;
  },

  // 6. Activar/Desactivar
  toggleActiva: async (id: number): Promise<Notificacion> => {
    const response = await api.put(`/notificaciones/${id}/toggle`);
    return response.data;
  },

  // 7. Eliminar
  deleteNotification: async (id: number): Promise<void> => {
    await api.delete(`/notificaciones/${id}`);
  }
};