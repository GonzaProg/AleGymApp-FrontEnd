import api from '../axios';

export interface PagoDTO {
    id: number;
    monto: number; // Desde el back el tipo decimal de TypeORM suele venir como string, pero lo convertiremos a number
    metodoPago: string;
    concepto: string;
    fechaPago: string;
    usuario: {
        nombre: string;
        apellido: string;
        dni: string;
    };
    plan?: {
        nombre: string;
    };
}

export interface FinancialMetricsDTO {
    ingresosMesActual: number;
    ingresosMesPasado: number;
    ingresosAnuales: number;
    porcentajeCrecimiento: number;
    cantidadVentasPlan: number;
    metodoPreferido: string;
    metodoPorcentaje: number;
}

export const PagosApi = {
    getHistorial: async (): Promise<PagoDTO[]> => {
        const response = await api.get('/pagos/historial');
        return response.data;
    },

    getMetrics: async (): Promise<FinancialMetricsDTO> => {
        const response = await api.get('/pagos/metrics');
        return response.data;
    }
};