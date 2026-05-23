import api from '../axios';

// Para que los usuarios puedan modificar peso, repeticiones y series de sus rutinas
export const DetallesEjerciciosApi = {
    update: async (id: number, data: { series?: number; repeticiones?: string; peso?: string }) => {
        const response = await api.put(`/detalles/${id}`, data);
        return response.data;
    }
};
