import api from '../axios';

export interface DashboardMetrics {
    alumnosActivos?: number;
    alumnosTotales?: number;
    rutinasTotales?: number;
    ejerciciosTotales: number;
}

export interface TrainerMetrics extends DashboardMetrics {
    alumnosActivos: number;
    alumnosTotales: number;
    rutinasTotales: number;
}

export interface AdminMetrics {
    ejerciciosTotales: number;
}

export const DashboardApi = {
    getMetrics: async (userRole: string): Promise<DashboardMetrics> => {
        if (userRole === 'Entrenador') {
            // Entrenador: trae todas las métricas
            const response = await api.get('/dashboard/metrics');
            return response.data;
        } else {
            // Admin: solo trae ejercicios
            const response = await api.get('/dashboard/metrics/exercises');
            return response.data;
        }
    }
};