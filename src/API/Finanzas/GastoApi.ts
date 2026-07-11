import api from '../axios';

export interface GastoDTO {
    id: number;
    monto: number;
    concepto: string;
    fechaGasto: Date;
}

export const GastoApi = {
    // 1. Obtener historial (ej. últimos 10 o todos)
    obtenerHistorial: async (limit?: number): Promise<GastoDTO[]> => {
        const url = limit ? `/gastos?limit=${limit}` : `/gastos`;
        const response = await api.get(url);
        return response.data;
    },

    // 2. Crear gasto
    crearGasto: async (datos: { monto: number; concepto: string; fechaGasto?: Date }): Promise<GastoDTO> => {
        const response = await api.post('/gastos', datos);
        return response.data;
    },

    // 3. Revertir / Eliminar gasto
    revertirGasto: async (id: number): Promise<{ message: string }> => {
        const response = await api.delete(`/gastos/${id}`);
        return response.data;
    }
};
