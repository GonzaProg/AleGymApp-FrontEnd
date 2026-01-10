import api from '../axios';

// Esto define qué datos trae un alumno para que el autocompletado funcione bien
export interface AlumnoDTO {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    nombreUsuario: string;
    fotoPerfil?: string;
    // Estos campos son importantes para la lógica de planes
    planActual?: {
        id: number;
        nombre: string;
        precio: number;
        duracionDias: number;
    };
    fechaVencimientoPlan?: string; // Viene como string del JSON
    estadoMembresia?: string;
}

// Interfaces para tipado seguro
export interface UpdateProfileDTO {
    nombre: string;
    apellido: string;
    nombreUsuario: string;
    email: string;
    fotoPerfil: string;
}

export interface ChangePasswordDTO {
    currentPassword: string;
    newPassword: string;
    confirmPassword?: string; // Opcional en el DTO de envío, pero útil en el form
}

export const UsuarioApi = {
    // Obtener alumnos
    getAlumnos: async (includePlan: boolean = false) => {
        // Si includePlan es true, añade "?includePlan=true" a la URL
        const query = includePlan ? '?includePlan=true' : '';
        const response = await api.get(`/users/alumnos${query}`); 
        return response.data;
    },

    // Actualizar Perfil
    update: async (id: number, data: UpdateProfileDTO) => {
        const response = await api.put(`/users/${id}`, data);
        return response.data;
    },

    // Cambiar Contraseña
    changePassword: async (id: number, data: ChangePasswordDTO) => {
        const response = await api.patch(`/users/${id}/password`, data);
        return response.data;
    }
};