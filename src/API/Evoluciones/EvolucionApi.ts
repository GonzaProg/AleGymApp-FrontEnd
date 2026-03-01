import api from '../axios';

export const EvolucionApi = {
    registrar: async (peso: number, fotoUrl?: string) => {
        const response = await api.post('/evolucion', { peso, fotoUrl });
        return response.data;
    },
    obtenerHistorial: async (limit?: number) => {
        const url = limit ? `/evolucion?limit=${limit}` : '/evolucion';
        const response = await api.get(url);
        return response.data;
    },
    eliminar: async (id: number) => {
        const response = await api.delete(`/evolucion/${id}`);
        return response.data;
    }
};