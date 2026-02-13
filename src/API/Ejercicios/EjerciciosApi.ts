import api from '../axios';

export interface Ejercicio {
    id: number;
    nombre: string;
    urlVideo?: string;
    imagenUrl?: string;
    fechaActualizacion?: Date;
}

export interface EjercicioDTO {
    nombre: string;
    urlVideo?: string;
    imagenUrl?: string;
}

export const EjerciciosApi = {
    // 1. Obtener todos
    getAll: async (): Promise<Ejercicio[]> => {
        const response = await api.get('/ejercicios'); 
        return response.data;
    },

    // 2. Crear (completo - solo admin)
    create: async (data: EjercicioDTO): Promise<Ejercicio> => {
        const response = await api.post('/ejercicios', data);
        return response.data;
    },

    // 2b. Crear básico (solo nombre - admin y entrenador)
    createBasic: async (nombre: string): Promise<Ejercicio> => {
        const response = await api.post('/ejercicios/basico', { nombre });
        return response.data;
    },

    // 3. Modificar
    update: async (id: number, data: Partial<EjercicioDTO>): Promise<Ejercicio> => {
        const response = await api.put(`/ejercicios/${id}`, data);
        return response.data;
    },

    // 4. Eliminar
    delete: async (id: number): Promise<void> => {
        await api.delete(`/ejercicios/${id}`);
    }
};