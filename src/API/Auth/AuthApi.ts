import api from '../axios';

// DTO para crear usuario (Ahora incluye codigoGym opcional para enviarlo desde el front)
export interface CreateUserDTO {
    dni: string;          
    nombre: string;
    apellido: string;
    nombreUsuario: string;
    email: string;
    contraseña: string;
    telefono?: string;    
    fechaNacimiento?: string;
    rol: string;
    codigoGym?: string; // Para vincular el usuario al gym local
}

// DTO para el Login (Ahora incluye codigoGym)
export interface LoginDTO {
    dni: string;      
    contraseña: string;
    codigoGym?: string; 
}

// Interfaz de respuesta del login (Actualizada con datos del Gym)
export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: {
        id: number;
        dni: string;    
        nombre: string;
        apellido: string;
        rol: string;
        fotoPerfil?: string;
        gym?: { // <--- Info del gym
            id: number;
            nombre: string;
            logoUrl?: string;
        }
    };
}

// Interfaz para response de refresh
export interface RefreshResponse {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
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

    // NUEVO: Refresh token
    refresh: async (refreshToken: string): Promise<RefreshResponse> => {
        const response = await api.post('/auth/refresh', { refreshToken });
        return response.data;
    },

    // NUEVO: Logout
    logout: async (refreshToken: string) => {
        const response = await api.post('/auth/logout', { refreshToken });
        return response.data;
    },

    // NUEVO: Logout desde todos los dispositivos
    logoutAll: async () => {
        const response = await api.post('/auth/logout-all', {});
        return response.data;
    },

    // Solicitar recuperación
    forgotPassword: async (dni: string) => {
        const response = await api.post('/auth/forgot-password', { dni });
        return response.data;
    },

    // Establecer la nueva contraseña
    resetPassword: async (data: ResetPasswordDTO) => {
        const response = await api.post('/auth/reset-password', data);
        return response.data;
    }
}