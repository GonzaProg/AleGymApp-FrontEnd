import api from '../axios';

// Interfaz para MOSTRAR datos (Lectura)
export interface GymDTO {
    id: number;
    nombre: string;
    codigoAcceso: string;
    activo: boolean;
    logoUrl?: string;
}

// Interfaz para ACTUALIZAR datos
export interface CreateUpdateGymDTO {
    nombre: string;
    codigoAcceso: string;
    logoUrl?: string;
}

export const GymApi = {
    // 1. Crear: Ahora acepta CreateGymDTO (sin id ni activo)
    create: async (data: CreateUpdateGymDTO) => {
        const response = await api.post('/gyms', data);
        return response.data; // El backend nos devolverá el GymDTO completo (con ID)
    },

    // 2. Obtener todos
    getAll: async (): Promise<GymDTO[]> => {
        const response = await api.get('/gyms');
        return response.data;
    },

    // 3. Bloquear / Desbloquear
    toggleStatus: async (id: number, activo: boolean) => {
        const response = await api.patch(`/gyms/${id}/status`, { activo });
        return response.data;
    },

    // 4. Actualizar
    update: async (id: number, data: CreateUpdateGymDTO) => {
        const response = await api.put(`/gyms/${id}`, data);
        return response.data;
    }
};