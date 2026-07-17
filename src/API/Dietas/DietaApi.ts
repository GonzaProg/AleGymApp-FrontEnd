import api from '../axios';

export const DietaApi = {
    // ENTRENADOR

    crearDieta: async (usuarioId: number, dieta: any, comidas: any[]) => {
        const response = await api.post('/dietas', { usuarioId, dieta, comidas });
        return response.data;
    },

    obtenerDietaDeAlumno: async (usuarioId: number) => {
        try {
            const response = await api.get(`/dietas/alumno/${usuarioId}`);
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) return null;
            throw error;
        }
    },

    actualizarDieta: async (dietaId: number, dieta: any, comidas: any[]) => {
        const response = await api.put(`/dietas/${dietaId}`, { dieta, comidas });
        return response.data;
    },

    eliminarDieta: async (dietaId: number) => {
        const response = await api.delete(`/dietas/${dietaId}`);
        return response.data;
    },

    // ALUMNO

    obtenerRegistroHoy: async () => {
        const response = await api.get('/dietas/registros/hoy');
        return response.data;
    },

    obtenerHistorialRegistros: async (limit: number = 30) => {
        const response = await api.get(`/dietas/registros/historial?limit=${limit}`);
        return response.data;
    },

    agregarComidaConsumida: async (comida: any, aguaSumar: number = 0) => {
        const response = await api.post('/dietas/registros/comida', { comida, aguaSumar });
        return response.data;
    },

    eliminarComidaConsumida: async (comidaId: number) => {
        const response = await api.delete(`/dietas/registros/comida/${comidaId}`);
        return response.data;
    }
};
