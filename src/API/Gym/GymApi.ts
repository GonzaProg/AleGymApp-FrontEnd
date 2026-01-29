import api from '../axios';

export interface GymDTO {
    id: number;
    nombre: string;
    codigoAcceso: string;
    activo: boolean; // Importante para el switch
    logoUrl?: string;
}

export const GymApi = {
    create: async (data: GymDTO) => {
        const response = await api.post('/gyms', data);
        return response.data;
    },

    getAll: async () => {
        const response = await api.get('/gyms');
        return response.data;
    },

    // Bloquear / Desbloquear
    toggleStatus: async (id: number, activo: boolean) => {
        const response = await api.patch(`/gyms/${id}/status`, { activo });
        return response.data;
    }
};