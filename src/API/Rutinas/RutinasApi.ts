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

    // Desvincular una rutina general de un alumno
    desvincularGeneral: async (rutinaId: number, alumnoId: number) => {
        const response = await api.post('/rutinas/desvincular-general', { rutinaId, alumnoId });
        return response.data;
    },

    update: async (id: number, data: any) => {
        const response = await api.put(`/rutinas/${id}`, data);
        return response.data;
    },
    getOne: async (id: number) => {
        const response = await api.get(`/rutinas/${id}`);
        return response.data;
    },

    // --- MULTI-DÍA ---
    createMultiDay: async (data: any) => {
        const response = await api.post('/rutinas/multi-day', data);
        return response.data;
    },
    deleteGrupo: async (grupoId: string) => {
        const response = await api.delete(`/rutinas/grupo/${grupoId}`);
        return response.data;
    },
    asignarGrupo: async (grupoId: string, alumnoId: number) => {
        const response = await api.post('/rutinas/asignar-grupo', { grupoId, alumnoId });
        return response.data;
    },
    desvincularGrupo: async (grupoId: string, alumnoId: number) => {
        const response = await api.post('/rutinas/desvincular-grupo', { grupoId, alumnoId });
        return response.data;
    },
    getGrupo: async (grupoId: string) => {
        const response = await api.get(`/rutinas/grupo/${grupoId}`);
        return response.data;
    },
    updateGrupo: async (grupoId: string, data: any) => {
        const response = await api.put(`/rutinas/grupo/${grupoId}`, data);
        return response.data;
    }
};