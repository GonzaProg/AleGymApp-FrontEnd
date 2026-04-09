import api from '../axios';

export interface FraseMotivacion {
    id: number;
    texto: string;
    imagenUrl?: string;
    fechaCreacion: string;
}

export type FraseMotivacionDTO = Pick<FraseMotivacion, 'texto' | 'imagenUrl'>;

export const FrasesApi = {
    getAll: async (): Promise<FraseMotivacion[]> => {
        const response = await api.get('/frases');
        return response.data;
    },

    getDaily: async (): Promise<FraseMotivacion> => {
        const response = await api.get('/frases/daily', {
            params: { t: Date.now() }
        });
        return response.data;
    },

    create: async (data: FraseMotivacionDTO): Promise<FraseMotivacion> => {
        const response = await api.post('/frases', data);
        return response.data;
    },

    update: async (id: number, data: Partial<FraseMotivacionDTO>): Promise<FraseMotivacion> => {
        const response = await api.put(`/frases/${id}`, data);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/frases/${id}`);
    }
};
