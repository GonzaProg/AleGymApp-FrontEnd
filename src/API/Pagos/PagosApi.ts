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
    chartAnual: number[];
    chartMensual: number[];
}

export interface BreakdownItem {
    categoria: string;
    total: number;
}

export interface MetricsByTypeDTO {
    desgloseMensual: BreakdownItem[];
    desgloseAnual: BreakdownItem[];
}

export const PagosApi = {
    getHistorial: async (): Promise<PagoDTO[]> => {
        const response = await api.get('/pagos/historial');
        return response.data;
    },

    getMetrics: async (): Promise<FinancialMetricsDTO> => {
        const response = await api.get('/pagos/metrics');
        return response.data;
    },

    getMetricsByType: async (): Promise<MetricsByTypeDTO> => {
        const response = await api.get('/pagos/metrics/types');
        return response.data;
    },

    getHistorialPorUsuario: async (userId: number): Promise<PagoDTO[]> => {
        const response = await api.get(`/pagos/historial/${userId}`);
        return response.data;
    },

    // NUEVO: Revertir pago
    revertirPago: async (pagoId: number) => {
        const response = await api.post('/pagos/revertir', { pagoId });
        return response.data;
    },
    
venderCarrito: async (data: { usuarioId: number, metodoPago: string, items: { productoId: number, cantidad: number }[] }) => {
        // Usamos la misma ruta, pero el body ahora lleva 'items'
        const response = await api.post('/pagos/venta-producto', data);
        return response.data;
    }
};