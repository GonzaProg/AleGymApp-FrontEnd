import api from '../axios';

// Interfaz completa del Alumno 
// Definición de la suscripción individual
export interface UserPlanInfo {
    id: number;
    activo: boolean;
    fechaInicio: string;
    fechaVencimiento: string;
    plan: {
        id: number;
        nombre: string;
        tipo: 'Gym' | 'Natacion';
        precio: number;
    }
}

export interface AlumnoDTO {
    id: number;
    dni: string;            
    nombre: string;
    apellido: string;
    telefono?: string;      
    fechaNacimiento?: string; 
    fotoPerfil?: string;
    // CAMBIO: Ahora es una lista de planes
    userPlans?: UserPlanInfo[]; 
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