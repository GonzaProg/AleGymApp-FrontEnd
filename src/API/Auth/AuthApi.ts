import api from '../axios';

// DTO para crear usuario (Actualizado con DNI, Telefono, Fecha)
export interface CreateUserDTO {
    dni: string;          
    nombre: string;
    apellido: string;
    nombreUsuario: string;
    email: string;
    contraseña: string;
    telefono?: string;    
    fechaNacimiento?: string; // (Opcional, string 'YYYY-MM-DD')
    rol: string;
}

// DTO para el Login 
export interface LoginDTO {
    dni: string;      
    contraseña: string;
}

// Interfaz de respuesta del login
export interface LoginResponse {
    token: string;
    user: {
        id: number;
        dni: string;    
        nombre: string;
        apellido: string;
        rol: string;
        fotoPerfil?: string;
    };
}

// DTO para Reset Password
export interface ResetPasswordDTO {
    token: string;
    nuevaContrasena: string;
}

export const AuthApi = {
    // La API decide la URL basada en el rol
    createUser: async (data: CreateUserDTO) => {
        let url = "";
        
        // Lógica de ruteo según el Rol
        if (data.rol === "Entrenador") {
            // endpoint: /api/auth/crear-entrenador
            url = "/auth/crear-entrenador"; 
        } else {
            // endpoint: /api/auth/register
            url = "/auth/register"; 
        }

        const response = await api.post(url, data);
        return response.data;
    },

    login: async (credentials: LoginDTO): Promise<LoginResponse> => {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    },

    // Solicitar recuperación (Ya no es por email, sino por DNI)
    forgotPassword: async (dni: string) => {
        // Enviamos { dni } en lugar de { email }
        const response = await api.post('/auth/forgot-password', { dni });
        return response.data;
    },

    // Establecer la nueva contraseña
    resetPassword: async (data: ResetPasswordDTO) => {
        const response = await api.post('/auth/reset-password', data);
        return response.data;
    }
}