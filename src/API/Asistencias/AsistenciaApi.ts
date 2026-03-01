import api from '../axios';

export const AsistenciaApi = {
    // Registra la entrada del usuario actual a su gimnasio
    registrarEntrada: async (gymId: number): Promise<{ message: string, excedido: boolean }> => {
        const response = await api.post('/asistencias/checkin', { gymId });
        return response.data;
    },

    // Obtiene cuánta gente hay en las últimas horas
    obtenerConcurrencia: async (gymId: number): Promise<number> => {
        const response = await api.get(`/asistencias/concurrencia/${gymId}`);
        return response.data.estimacion;
    },

    registrarEntradaManual: async (dni: string): Promise<void> => {
        await api.post('/asistencias/manual', { dni });
    },

    obtenerReporteAdmin: async (): Promise<{ concurrenciaActual: number, excedidosHoy: any[], excedidosMes: any[] }> => {
        const response = await api.get('/asistencias/reporte-admin');
        return response.data;
    },

    obtenerHistorialUsuario: async (usuarioId: number): Promise<any[]> => {
        const response = await api.get(`/asistencias/historial/${usuarioId}`);
        return response.data;
    },

    obtenerAlertasHoy: async (): Promise<number> => {
        const response = await api.get('/asistencias/alertas-hoy');
        return response.data.cantidad;
    }
};