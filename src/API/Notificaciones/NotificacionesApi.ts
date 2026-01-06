import api from "../axios";

export interface Notificacion {
  id: number;
  titulo: string;
  mensaje: string;
  leida: boolean;
  fechaCreacion: string;
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
  broadcast: async (titulo: string, mensaje: string): Promise<void> => {
    await api.post("/notificaciones/broadcast", { titulo, mensaje });
  },
};