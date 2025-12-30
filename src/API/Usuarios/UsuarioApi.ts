import api from '../axios';

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
    getAlumnos: async () => {
        const response = await api.get('/users/alumnos'); 
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