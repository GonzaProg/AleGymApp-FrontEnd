import { useState, useEffect, useCallback } from 'react';
import { authTokenService } from '../API/Auth/AuthTokenService';
import { AuthApi } from '../API/Auth/AuthApi';

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
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [refreshToken, setRefreshToken] = useState<string | null>(null);

    // Función para refresh de tokens
    const refreshTokens = useCallback(async () => {
        try {
            const refreshToken = authTokenService.getRefreshToken();
            if (!refreshToken) throw new Error('No refresh token');

            const response = await AuthApi.refresh(refreshToken);
            
            // Actualizar tokens
            authTokenService.setTokens({
                accessToken: response.accessToken,
                refreshToken: response.refreshToken,
                expiresIn: response.expiresIn
            });

            setAccessToken(response.accessToken);
            setRefreshToken(response.refreshToken);

            // Reconfigurar auto-refresh
            authTokenService.setupAutoRefresh(refreshTokens);

        } catch (error) {
            console.error('Error refreshing tokens:', error);
            // Si falla, hacer logout
            logout();
        }
    }, []);

    // Callback para logout
    const logout = useCallback(async () => {
        try {
            const token = authTokenService.getRefreshToken();
            if (token) {
                // Llamar al endpoint de logout para revocar el token en la BD
                // await AuthApi.logout(token);
            }
        } catch (error) {
            console.error("Error en logout:", error);
        } finally {
            // Limpiar todo
            authTokenService.clearTokens();
            localStorage.removeItem("user");
            localStorage.removeItem("remember_dni");
            localStorage.removeItem("remember_pass");
            
            setCurrentUser(null);
            setAccessToken(null);
            setRefreshToken(null);
            setIsAdmin(false);
            setIsEntrenador(false);
        }
    }, []);

    useEffect(() => {
        const userStr = localStorage.getItem("user");
        const tokenInfo = authTokenService.getTokens();

        if (userStr) {
            try {
                const userObj: User = JSON.parse(userStr);
                setCurrentUser(userObj);
                
                // Determinamos roles
                const admin = userObj.rol === "Admin";
                setIsAdmin(admin);
                setIsEntrenador(userObj.rol === "Entrenador" || admin); 

            } catch (error) {
                console.error("Error sesión:", error);
                setIsAdmin(false);
                setIsEntrenador(false);
                setCurrentUser(null);
            }
        }
        
        if (tokenInfo.accessToken) {
            setAccessToken(tokenInfo.accessToken);
        }

        if (tokenInfo.refreshToken) {
            setRefreshToken(tokenInfo.refreshToken);
        }

        // Inicializar sesión con auto-refresh
        const sessionInitialized = authTokenService.initializeSession(refreshTokens);
        
        // Si no se pudo inicializar y hay tokens, intentar refresh inmediato
        if (!sessionInitialized && tokenInfo.accessToken && tokenInfo.refreshToken) {
            refreshTokens();
        }

        setIsLoading(false);

    }, [refreshTokens]);

    return { 
        isAdmin,
        isEntrenador, 
        currentUser,
        accessToken,
        refreshToken,
        isLoading,
        logout
    };
};
