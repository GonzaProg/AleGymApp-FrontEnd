import api from '../axios';

export const EvolucionApi = {
    registrar: async (datos: any) => {
        const response = await api.post('/evolucion', datos);
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
    },
    actualizar: async (id: number, datos: any) => {
        const response = await api.patch(`/evolucion/${id}`, datos);
        return response.data;
    }
};