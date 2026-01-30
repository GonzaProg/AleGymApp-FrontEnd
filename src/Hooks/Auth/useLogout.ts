import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthApi } from '../../API/Auth/AuthApi';
import { authTokenService } from '../../API/Auth/AuthTokenService';

export const useLogout = () => {
    const navigate = useNavigate();

    const handleLogout = useCallback(async (redirectToLogin = true) => {
        try {
            const refreshToken = authTokenService.getRefreshToken();
            if (refreshToken) {
                // Avisamos al backend para que invalide el token en BD
                await AuthApi.logout(refreshToken);
            }
        } catch (error) {
            console.warn('Error revocando token en backend:', error);
        } finally {
            // Limpieza TOTAL del frontend
            authTokenService.clearTokens();
            
            // Limpiamos también inputs guardados si quieres ser estricto, 
            // o déjalos para comodidad del usuario.
            // localStorage.removeItem('remember_dni_input'); 
            
            if (redirectToLogin) {
                navigate('/login', { replace: true });
            }
        }
    }, [navigate]);

    const handleLogoutAll = useCallback(async (redirectToLogin = true) => {
        try {
            await AuthApi.logoutAll();
        } catch (error) {
            console.error('Error logout all:', error);
        } finally {
            authTokenService.clearTokens();
            if (redirectToLogin) navigate('/login', { replace: true });
        }
    }, [navigate]);

    return { handleLogout, handleLogoutAll };
};