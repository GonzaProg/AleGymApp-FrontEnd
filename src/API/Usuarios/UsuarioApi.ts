import api from '../axios';

// Interfaz completa del Alumno 
export interface AlumnoDTO {
    id: number;
    dni: string;            
    nombre: string;
    apellido: string;
    telefono?: string;      
    fechaNacimiento?: string; 
    fotoPerfil?: string;
    planActual?: {
        id: number;
        nombre: string;
        precio: number;
        duracionDias: number;
    };
    fechaVencimientoPlan?: string; 
    estadoMembresia?: string;
}

// Interfaz para Editar Perfil
export interface UpdateProfileDTO {
    nombre: string;
    dni: string;
    apellido: string;
    fotoPerfil: string;
    telefono?: string;       
    fechaNacimiento?: string; 
}

export interface ChangePasswordDTO {
    currentPassword: string;
    newPassword: string;
    confirmPassword?: string;
}

export const UsuarioApi = {
    // Obtener alumnos
    getAlumnos: async (includePlan: boolean = false) => {
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