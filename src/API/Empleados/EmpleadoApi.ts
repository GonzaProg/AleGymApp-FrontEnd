import api from "../axios";

export interface EmpleadoDTO {
    id: number;
    nombre: string;
    apellido: string;
    telefono: string | null;
    fechaCreacion: string;
    fotoPerfil: string | null;
    activo: boolean;
    pagoMesActual: boolean;
}

export interface PagoEmpleadoDTO {
    id: number;
    monto: number;
    metodoPago: string;
    concepto: string | null;
    fechaPago: string;
}

export const EmpleadoApi = {
    getEmpleados: async (gymId: number): Promise<EmpleadoDTO[]> => {
        const response = await api.get(`/empleados/${gymId}`);
        return response.data;
    },

    getEmpleadoById: async (gymId: number, id: number): Promise<EmpleadoDTO> => {
        const response = await api.get(`/empleados/${gymId}/${id}`);
        return response.data;
    },

    crearEmpleado: async (gymId: number, data: Partial<EmpleadoDTO>): Promise<EmpleadoDTO> => {
        const response = await api.post(`/empleados/${gymId}`, data);
        return response.data;
    },

    modificarEmpleado: async (gymId: number, id: number, data: Partial<EmpleadoDTO>): Promise<EmpleadoDTO> => {
        const response = await api.put(`/empleados/${gymId}/${id}`, data);
        return response.data;
    },

    bajaLogicaEmpleado: async (gymId: number, id: number): Promise<EmpleadoDTO> => {
        const response = await api.delete(`/empleados/${gymId}/${id}`);
        return response.data.empleado;
    },

    asignarPago: async (gymId: number, empleadoId: number, data: { monto: number, metodoPago: string, concepto?: string, fechaPago?: string }): Promise<PagoEmpleadoDTO> => {
        const response = await api.post(`/empleados/${gymId}/${empleadoId}/pagos`, data);
        return response.data;
    },

    obtenerHistorialPagos: async (gymId: number, id: number): Promise<PagoEmpleadoDTO[]> => {
        const response = await api.get(`/empleados/${gymId}/${id}/pagos`);
        return response.data;
    },

    obtenerUltimosPagos: async (gymId: number): Promise<PagoEmpleadoDTO[]> => {
        const response = await api.get(`/empleados/${gymId}/pagos/ultimos`);
        return response.data;
    }
};
