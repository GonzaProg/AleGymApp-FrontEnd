import api from '../axios';

export interface DashboardMetrics {
    alumnosActivos: number;
    alumnosTotales: number;
    rutinasTotales: number;
    ejerciciosTotales: number;
}

export const DashboardApi = {
    getMetrics: async (): Promise<DashboardMetrics> => {
        const response = await api.get('/dashboard/metrics');
        return response.data;
    }
};