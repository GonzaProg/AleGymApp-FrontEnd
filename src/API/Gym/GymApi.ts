import api from '../axios';

// Interfaz para MOSTRAR datos (Lectura)
export interface GymDTO {
    id: number;
    nombre: string;
    codigoAcceso: string;
    activo: boolean;
    logoUrl?: string;
}

// Interfaz para CREAR datos (Escritura)
// Solo pedimos lo que el usuario ingresa en el formulario
export interface CreateGymDTO {
    nombre: string;
    codigoAcceso: string;
}

export const GymApi = {
    // 1. Crear: Ahora acepta CreateGymDTO (sin id ni activo)
    create: async (data: CreateGymDTO) => {
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
    }
};