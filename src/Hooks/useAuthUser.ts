import { useState, useEffect, useCallback } from 'react';
import { authTokenService } from '../API/Auth/AuthTokenService';
import { AuthApi } from '../API/Auth/AuthApi';
import { useLogout } from './Auth/useLogout'; // Reutilizamos el hook de logout

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
    
    // Importamos logout para usarlo si falla el refresh
    const { handleLogout } = useLogout(); 

    const refreshTokens = useCallback(async () => {
        try {
            const refreshToken = authTokenService.getRefreshToken();
            if (!refreshToken) throw new Error('No refresh token');

            const response = await AuthApi.refresh(refreshToken);
            
            // Al refrescar, mantenemos la persistencia donde estaba (Local o Session)
            // Verificamos dónde estaba el token viejo para guardar el nuevo en el mismo lugar
            const wasRemembered = !!localStorage.getItem('refreshToken');
            
            // Actualizamos user y tokens
            // Nota: El backend en refresh a veces no devuelve el objeto user completo, 
            // si es así, mantenemos el que ya teníamos en memoria/storage.
            const currentUser = authTokenService.getUser();

            authTokenService.setTokens({
                accessToken: response.accessToken,
                refreshToken: response.refreshToken,
                expiresIn: response.expiresIn
            }, currentUser, wasRemembered);

            authTokenService.setupAutoRefresh(refreshTokens);

        } catch (error) {
            console.error('Error refreshing tokens:', error);
            handleLogout(true); // Logout forzado si falla el refresh
        }
    }, [handleLogout]);

    useEffect(() => {
        // 1. Recuperar usuario INMEDIATAMENTE
        const userObj = authTokenService.getUser();
        const token = authTokenService.getAccessToken();
        
        if (userObj && token) {
            // Si hay usuario en storage, lo seteamos de una para que no parpadee el login
            setCurrentUser(userObj);
            setIsAdmin(userObj.rol === "Admin");
            setIsEntrenador(userObj.rol === "Entrenador" || userObj.rol === "Admin");
            
            // Inicializamos la lógica de refresh en segundo plano
            authTokenService.initializeSession(refreshTokens);
        } else {
            // Solo si no hay usuario, limpiamos
            setCurrentUser(null);
            setIsAdmin(false);
            setIsEntrenador(false);
        }

        // Dejamos de cargar inmediatamente
        setIsLoading(false);

    }, [refreshTokens]);

    return { isAdmin, isEntrenador, currentUser, isLoading };
};