import { useState, useEffect } from 'react';

export interface User {
    id?: number;
    dni: string;
    nombre?: string;
    apellido?: string;
    nombreUsuario?: string;
    telefono?: string;
    fechaNacimiento?: string;
    email?: string;
    fotoPerfil?: string;
    rol: string; 
    token?: string;
}

export const useAuthUser = () => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [isEntrenador, setIsEntrenador] = useState<boolean>(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const userLocal = localStorage.getItem("user");
        const tokenLocal = localStorage.getItem("token");
        const userSession = sessionStorage.getItem("user");
        const tokenSession = sessionStorage.getItem("token");

        const userStr = userLocal || userSession;
        const tokenStr = tokenLocal || tokenSession;

        if (userStr && tokenStr) {
            try {
                const userObj: User = JSON.parse(userStr);
                establecerEstadoUsuario(userObj, tokenStr);
            } catch (error) {
                console.error("Error sesión:", error);
                logout();
            }
        }
        setIsLoading(false);
    }, []);

    // Helper interno para setear estados
    const establecerEstadoUsuario = (user: User, token: string) => {
        setCurrentUser(user);
        setToken(token);
        const admin = user.rol === "Admin";
        setIsAdmin(admin);
        setIsEntrenador(user.rol === "Entrenador" || admin);
    };

    // Autologin al crear nuevo usuario
    const login = (user: User, accessToken: string, refreshToken: string, remember: boolean = true) => {
        const storage = remember ? localStorage : sessionStorage;
        
        storage.setItem("token", accessToken);
        storage.setItem("refreshToken", refreshToken);
        storage.setItem("user", JSON.stringify(user));

        establecerEstadoUsuario(user, accessToken);
    };

    const logout = () => {
        localStorage.clear();
        sessionStorage.clear();
        setIsAdmin(false);
        setIsEntrenador(false);
        setCurrentUser(null);
        setToken(null);
    };

    return { 
        isAdmin,
        isEntrenador, 
        currentUser,
        token,
        isLoading,
        login, // <--- AHORA SÍ EXISTE
        logout
    };
};