import api from "../axios";

export const ActividadCardioApi = {
    registrarActividad: async (gymId: number, usuarioId: number, datos: any) => {
        const { data } = await api.post(`/cardio/${gymId}/usuarios/${usuarioId}`, datos);
        return data;
    },
    
    obtenerHistorial: async (usuarioId: number) => {
        const { data } = await api.get(`/cardio/usuarios/${usuarioId}`);
        return data;
    },
    
    eliminarActividad: async (usuarioId: number, actividadId: number) => {
        const { data } = await api.delete(`/cardio/usuarios/${usuarioId}/${actividadId}`);
        return data;
    },

    obtenerEstadisticas: async (usuarioId: number) => {
        const { data } = await api.get(`/cardio/usuarios/${usuarioId}/estadisticas`);
        return data;
    }
};
