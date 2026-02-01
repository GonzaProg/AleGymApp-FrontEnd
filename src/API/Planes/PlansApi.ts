import api from '../axios'; 

export interface PlanDTO {
    id?: number;
    nombre: string;
    precio: number;
    duracionDias: number;
    diasPorSemana: number;
    descripcion: string;
    fechaActualizacion?: Date;
}

export const PlansApi = {
    // 1. Obtener todos los planes disponibles
    getAll: async () => {
        const response = await api.get('/planes');
        return response.data;
    },

    // 2. Obtener mi plan activo (Usuario logueado)
    getMyPlan: async () => {
        const response = await api.get('/planes/mi-plan');
        return response.data;
    },

    // 3. Crear Plan (Solo Admin/Entrenador)
    create: async (data: PlanDTO) => {
        const response = await api.post('/planes/crear', data);
        return response.data;
    },

    // 4. Editar Plan (Solo Admin/Entrenador)
    update: async (id: number, data: PlanDTO) => {
        const response = await api.put(`/planes/${id}`, data);
        return response.data;
    },

    // 5. Suscribir Usuario (Admin/Entrenador)
    subscribeUser: async (userId: number, planId: number, metodoPago: string = "Transferencia") => {
        const response = await api.post('/planes/suscribir', { userId, planId, metodoPago });
        return response.data;
    },

    // 6. Renovar Plan (Solo Admin/Entrenador)
    renewPlan: async (userId: number, metodoPago: string = "Transferencia") => {
        const response = await api.post('/planes/renovar', { userId, metodoPago });
        return response.data;
    },

    // 7. Cancelar Plan (Solo Admin/Entrenador)
    cancelPlan: async (userId: number) => {
        const response = await api.post('/planes/cancelar', { userId });
        return response.data;
    }
};