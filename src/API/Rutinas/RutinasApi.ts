import api from '../axios';

export const RutinasApi = {
    // Crear rutina nueva
    create: async (data: any) => {
        const response = await api.post('/rutinas', data);
        return response.data;
    },

    // Obtener rutinas de un usuario específico
    getByUser: async (userId: number) => {
        const response = await api.get(`/rutinas/usuario/${userId}`);
        return response.data;
    },

    // Eliminar rutina
    delete: async (id: number) => {
        await api.delete(`/rutinas/${id}`);
    },

    getGenerales: async () => {
        const response = await api.get('/rutinas/generales');
        return response.data;
    },

    // Asignar una rutina general a un alumno (Vinculación M:N)
    asignarGeneral: async (rutinaId: number, alumnoId: number) => {
        const response = await api.post('/rutinas/asignar-general', { rutinaId, alumnoId });
        return response.data;
    },

    update: async (id: number, data: any) => {
        const response = await api.put(`/rutinas/${id}`, data);
        return response.data;
    },
    getOne: async (id: number) => {
        const response = await api.get(`/rutinas/${id}`);
        return response.data;
    }
};