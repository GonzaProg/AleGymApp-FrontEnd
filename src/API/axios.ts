import axios from "axios";

// Vite expone las variables de entorno en import.meta.env
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const api = axios.create({
    baseURL: baseURL,
    headers: { "Content-Type": "application/json" }
});

// 1. Request Interceptor
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// 2. Response Interceptor (CORREGIDO)
api.interceptors.response.use(
    (response) => response, 
    async (error) => {
        const originalRequest = error.config;

        // --- CORRECCIÓN AQUÍ ---
        // Si el error 401 viene del endpoint de LOGIN, no intentamos hacer refresh.
        // Dejamos que falle para que el componente Login muestre "Credenciales inválidas".
        if (originalRequest.url.includes('/auth/login')) {
            return Promise.reject(error);
        }
        // -----------------------

        // Si el error es 401 y NO es el login, entonces sí es un token vencido
        if (error.response?.status === 401 && !originalRequest._retry) {
            
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem("refreshToken") || sessionStorage.getItem("refreshToken");

                if (!refreshToken) {
                    throw new Error("No refresh token");
                }

                // Llamamos al endpoint de renovación
                const response = await axios.post(`${baseURL}/auth/refresh`, { refreshToken });

                const { token: newAccessToken } = response.data;

                if (localStorage.getItem("token")) {
                    localStorage.setItem("token", newAccessToken);
                } else {
                    sessionStorage.setItem("token", newAccessToken);
                }

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;

                return api(originalRequest);

            } catch (refreshError) {
                console.error("Sesión expirada totalmente:", refreshError);
                
                // Limpiamos todo menos el 'remember_dni' y el GYMMATE_LOCAL_CODE
                localStorage.removeItem("token");
                localStorage.removeItem("refreshToken");
                localStorage.removeItem("user");
                sessionStorage.clear();

                // Solo mostramos alerta si NO estamos ya en el login
                if (!window.location.pathname.includes("/login")) {
                     alert("Tu sesión ha caducado por seguridad. Por favor, inicia sesión nuevamente.");
                     window.location.href = "/login"; 
                }
                
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;