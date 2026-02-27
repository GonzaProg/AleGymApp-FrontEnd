import api from '../axios';

export const EvolucionApi = {
    registrar: async (peso: number, fotoUrl?: string) => {
        const response = await api.post('/evolucion', { peso, fotoUrl });
        return response.data;
    },
    obtenerHistorial: async () => {
        const response = await api.get('/evolucion');
        return response.data;
    },
    eliminar: async (id: number) => {
        const response = await api.delete(`/evolucion/${id}`);
        return response.data;
    }
};