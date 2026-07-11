import api from '../axios';

export interface NotaDTO {
    id: number;
    concepto: string;
    resuelta: boolean;
    fechaNota: string;
}

export const NotasApi = {
    obtenerHistorial: async (limit?: number): Promise<NotaDTO[]> => {
        const url = limit ? `/notas?limit=${limit}` : '/notas';
        const response = await api.get(url);
        return response.data;
    },

    crearNota: async (data: { concepto: string }) => {
        const response = await api.post('/notas', data);
        return response.data;
    },

    modificarNota: async (id: number, password?: string, data?: { concepto?: string, resuelta?: boolean }) => {
        const payload = {
            password,
            ...data
        };
        const response = await api.patch(`/notas/${id}`, payload);
        return response.data;
    },

    eliminarNota: async (id: number, password?: string) => {
        const response = await api.delete(`/notas/${id}`, {
            data: { password }
        });
        return response.data;
    }
};
