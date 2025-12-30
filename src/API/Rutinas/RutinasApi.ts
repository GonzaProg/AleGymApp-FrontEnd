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
    }
};