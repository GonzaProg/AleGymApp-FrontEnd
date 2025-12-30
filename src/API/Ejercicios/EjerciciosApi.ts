import api from '../axios';

export const EjerciciosApi = {
    // 1. Obtener todos
    getAll: async () => {
        // Axios ya pone la BaseURL y el Token por nosotros
        const response = await api.get('api/ejercicios'); 
        return response.data;
    },

    // 2. Crear (Admin)
    create: async (data: { nombre: string; urlVideo?: string }) => {
        const response = await api.post('api/ejercicios', data);
        return response.data;
    },

    // 3. Modificar (Admin)
    update: async (id: number, data: { nombre?: string; urlVideo?: string }) => {
        const response = await api.put(`api/ejercicios/${id}`, data);
        return response.data;
    },

    // 4. Eliminar (Admin)
    delete: async (id: number) => {
        const response = await api.delete(`api/ejercicios/${id}`);
        return response.data;
    }
};