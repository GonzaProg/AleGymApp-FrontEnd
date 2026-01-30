import axios from "axios";
import { authTokenService } from "./Auth/AuthTokenService";
import { AuthApi } from "./Auth/AuthApi";

// Vite expone las variables de entorno en import.meta.env
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const api = axios.create({
    baseURL: baseURL,
});

// FLAG para evitar loops infinitos en refresh
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

/**
 * Suscribirse a eventos de refresh de token
 */
const subscribeTokenRefresh = (callback: (token: string) => void) => {
    refreshSubscribers.push(callback);
};

/**
 * Notificar a todos los suscriptores cuando el token se ha refrescado
 */
const onRefreshed = (newAccessToken: string) => {
    refreshSubscribers.forEach((callback) => callback(newAccessToken));
    refreshSubscribers = [];
};

/**
 * INTERCEPTOR DE REQUEST
 * Agrega el access token a todas las solicitudes
 */
api.interceptors.request.use(
    (config) => {
        const accessToken = authTokenService.getAccessToken();
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * INTERCEPTOR DE RESPONSE
 * Maneja la renovación automática de tokens
 */
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Si el error es 401 (No autorizado) y aún no hemos intentado refresh
        if (
            error.response?.status === 401 &&
            error.response?.data?.code === "TOKEN_EXPIRED" &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;

            // Si ya estamos refrescando, esperar y reintentar
            if (isRefreshing) {
                return new Promise((resolve) => {
                    subscribeTokenRefresh((newAccessToken: string) => {
                        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                        resolve(api(originalRequest));
                    });
                });
            }

            isRefreshing = true;

            try {
                const refreshToken = authTokenService.getRefreshToken();

                if (!refreshToken) {
                    // No hay refresh token, ir a login
                    window.location.href = "/login";
                    return Promise.reject(error);
                }

                // Llamar al endpoint de refresh
                const response = await AuthApi.refresh(refreshToken);

                // Guardar los nuevos tokens
                authTokenService.setTokens({
                    accessToken: response.accessToken,
                    refreshToken: response.refreshToken,
                    expiresIn: response.expiresIn,
                });

                // Actualizar el header de la solicitud original
                originalRequest.headers.Authorization = `Bearer ${response.accessToken}`;

                // Notificar a todos los suscriptores
                onRefreshed(response.accessToken);

                isRefreshing = false;

                // Reintentar la solicitud original
                return api(originalRequest);
            } catch (refreshError: any) {
                // Error en el refresh, ir a login
                console.error("Error refrescando token:", refreshError);
                authTokenService.clearTokens();
                window.location.href = "/login";
                isRefreshing = false;
                return Promise.reject(refreshError);
            }
        }

        // Otros errores 401 (credenciales inválidas, etc.)
        if (error.response?.status === 401) {
            authTokenService.clearTokens();
            window.location.href = "/login";
        }

        return Promise.reject(error);
    }
);

export default api;
