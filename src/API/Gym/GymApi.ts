import api from '../axios';

export interface GymDTO {
    id?: number;
    nombre: string;
    codigoAcceso: string;
}

export const GymApi = {
    create: async (data: GymDTO) => {
        const response = await api.post('/gyms', data);
        return response.data;
    },
    getAll: async () => {
        const response = await api.get('/gyms');
        return response.data;
    }
};