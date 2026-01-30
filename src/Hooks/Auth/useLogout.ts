import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthApi } from '../../API/Auth/AuthApi';
import { authTokenService } from '../../API/Auth/AuthTokenService';

/**
 * HOOK PARA LOGOUT
 * Maneja la limpieza segura de tokens y redirección
 */
export const useLogout = () => {
    const navigate = useNavigate();

    const handleLogout = useCallback(async (redirectToLogin = true) => {
        try {
            // 1. Intentar revocar el refresh token en el backend
            const refreshToken = authTokenService.getRefreshToken();
            if (refreshToken) {
                try {
                    await AuthApi.logout(refreshToken);
                } catch (error) {
                    // Continuar aunque falle, el token se limpia localmente
                    console.warn('Error revocando token en backend:', error);
                }
            }
        } catch (error) {
            console.error('Error en logout:', error);
        } finally {
            // 2. Limpiar tokens locales
            authTokenService.clearTokens();
            
            // 3. Limpiar datos del usuario
            localStorage.removeItem('user');
            localStorage.removeItem('remember_dni');
            localStorage.removeItem('remember_pass');
            sessionStorage.clear();
            
            // 4. Redireccionar a login
            if (redirectToLogin) {
                navigate('/login', { replace: true });
            }
        }
    }, [navigate]);

    const handleLogoutAll = useCallback(async (redirectToLogin = true) => {
        try {
            // 1. Revocar todos los refresh tokens en el backend
            await AuthApi.logoutAll();
        } catch (error) {
            console.error('Error en logout de todos los dispositivos:', error);
        } finally {
            // 2. Limpiar todo
            authTokenService.clearTokens();
            localStorage.clear();
            sessionStorage.clear();
            
            // 3. Redireccionar
            if (redirectToLogin) {
                navigate('/login', { replace: true });
            }
        }
    }, [navigate]);

    return {
        handleLogout,
        handleLogoutAll
    };
};
