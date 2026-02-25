import api from '../axios';

export const AsistenciaApi = {
    // Registra la entrada del usuario actual a su gimnasio
    registrarEntrada: async (gymId: number): Promise<void> => {
        await api.post('/asistencias/checkin', { gymId });
    },

    // Obtiene cuánta gente hay en las últimas horas
    obtenerConcurrencia: async (gymId: number): Promise<number> => {
        const response = await api.get(`/asistencias/concurrencia/${gymId}`);
        return response.data.estimacion;
    },

    registrarEntradaManual: async (dni: string): Promise<void> => {
        await api.post('/asistencias/manual', { dni });
    }
};