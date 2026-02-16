import api from '../axios';

export interface ProductoDTO {
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    stock: number;
    imagenUrl: string;
    activo: boolean;
}

export const ProductosApi = {
    // Obtener activos
    getAll: async (): Promise<ProductoDTO[]> => {
        const response = await api.get('/productos');
        return response.data;
    },

    // Obtener papelera
    getArchived: async (): Promise<ProductoDTO[]> => {
        const response = await api.get('/productos/archived');
        return response.data;
    },

    // Crear
    create: async (data: Partial<ProductoDTO>) => {
        const response = await api.post('/productos', data);
        return response.data;
    },

    // Editar
    update: async (id: number, data: Partial<ProductoDTO>) => {
        const response = await api.put(`/productos/${id}`, data);
        return response.data;
    },

    // Eliminar (Lógico)
    delete: async (id: number) => {
        const response = await api.delete(`/productos/${id}`);
        return response.data;
    },

    // Reactivar
    reactivate: async (id: number, data?: Partial<ProductoDTO>) => {
        const response = await api.patch(`/productos/${id}/reactivate`, data);
        return response.data;
    }
};