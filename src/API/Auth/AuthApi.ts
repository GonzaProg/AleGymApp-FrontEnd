import api from '../axios';

// DTO para tener tipado seguro al crear usuario
export interface CreateUserDTO {
    nombre: string;
    apellido: string;
    nombreUsuario: string;
    email: string;
    contraseña: string;
    rol: string;
}

// DTO para el Login
export interface LoginDTO {
    email: string;
    contraseña: string;
}

// Interfaz de respuesta del login
export interface LoginResponse {
    token: string;
    user: {
        id: number;
        nombre: string;
        apellido: string;
        rol: string;
        // otros campos...
    };
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
    }
}