import axios from "axios";

// Helper para obtener rol sin romper tipos
const getUserRole = () => {
    try {
        const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
        if (!userStr) return null;
        return JSON.parse(userStr).rol;
    } catch (error) { return null; }
};

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// --- VARIABLES PARA EL MANEJO DE CONCURRENCIA ---
let isRefreshing = false;
let failedQueue: any[] = [];

// Función para procesar la cola de peticiones en espera
const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

let isSessionExpiredAlertShown = false;
let isAccessDeniedAlertShown = false;

const api = axios.create({
    baseURL: baseURL,
    headers: { "Content-Type": "application/json" }
});

// 1. Request Interceptor
api.interceptors.request.use((config) => {
    // Leemos siempre del storage para tener el token más fresco
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// 2. Response Interceptor
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const status = error.response?.status;
        const errorCode = error.response?.data?.code; 

        // --- CASO 1: BLOQUEOS DE NEGOCIO (403) ---
        // (Tu lógica aquí estaba perfecta, la mantengo igual)
        if (status === 403) {
            if (errorCode === "GYM_LOCKED") {
                const rol = getUserRole();
                if (rol === "Entrenador") {
                    console.warn("⛔ GIMNASIO BLOQUEADO.");
                    sessionStorage.setItem("IS_GYM_LOCKED", "true");
                    window.dispatchEvent(new CustomEvent("GYM_LOCKED_EVENT"));
                    return Promise.reject(error);
                } else {
                    limpiarSesion(); // Helper abajo
                    alert("⚠️ El gimnasio se encuentra momentáneamente fuera de servicio.");
                    window.location.href = "/login";
                    return Promise.reject(error);
                }
            }
            if (errorCode === "USER_LOCKED" || errorCode === "USER_EXPIRED") {
                limpiarSesion();
                const msg = error.response?.data?.error || "Tu cuenta no está activa.";
                if (!isAccessDeniedAlertShown) {
                    isAccessDeniedAlertShown = true;
                    alert(`⛔ Acceso denegado: ${msg}`);
                    window.location.href = "/login";
                    setTimeout(() => { isAccessDeniedAlertShown = false; }, 5000);
                }
                return Promise.reject(error);
            }
        }

        // --- CASO 2: TOKEN VENCIDO (401) ---
        // Si falla el login, no hacemos refresh, devolvemos error directo
        if (originalRequest.url.includes('/auth/login')) {
            return Promise.reject(error);
        }

        if (status === 401 && !originalRequest._retry) {
            
            // SI YA SE ESTÁ REFRESCANDO: Ponemos la petición en cola
            if (isRefreshing) {
                return new Promise(function(resolve, reject) {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers['Authorization'] = 'Bearer ' + token;
                    return api(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = localStorage.getItem("refreshToken") || sessionStorage.getItem("refreshToken");

                if (!refreshToken) throw new Error("No refresh token");

                // endpoint corregido según tu backend (/refresh-token)
                const response = await axios.post(`${baseURL}/auth/refresh-token`, { refreshToken });

                const { token: newAccessToken } = response.data;

                // Actualizamos storage
                if (localStorage.getItem("token")) {
                    localStorage.setItem("token", newAccessToken);
                } else {
                    sessionStorage.setItem("token", newAccessToken);
                }

                // Importante: Actualizamos el header de la petición que falló
                api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

                // Procesamos la cola de peticiones que estaban esperando
                processQueue(null, newAccessToken);
                
                return api(originalRequest);

            } catch (refreshError) {
                // Si el refresh falla (ej: pasaron 30 días o token inválido)
                processQueue(refreshError, null);
                
                limpiarSesion();

                if (!window.location.pathname.includes("/login") && !isSessionExpiredAlertShown) {
                    isSessionExpiredAlertShown = true;
                    // Opcional: Podrías usar un Toast en vez de alert
                    // alert("Tu sesión ha caducado."); 
                    window.location.href = "/login"; 
                    setTimeout(() => { isSessionExpiredAlertShown = false; }, 5000);
                }
                return Promise.reject(refreshError);

            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

// Helper para no repetir código de limpieza
function limpiarSesion() {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    sessionStorage.clear();
}

export default api;