import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const api = axios.create({
    baseURL: baseURL,
    headers: { "Content-Type": "application/json" }
});

// 1. Request Interceptor (Igual que antes)
api.interceptors.request.use((config) => {
    // Buscamos el Access Token (El corto)
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// 2. Response Interceptor (LA RENOVACIÓN AUTOMÁTICA)
api.interceptors.response.use(
    (response) => response, // Si todo sale bien, pasamos
    async (error) => {
        const originalRequest = error.config;

        // Si el error es 401 (No autorizado) y no es un reintento
        if (error.response?.status === 401 && !originalRequest._retry) {
            
            console.log("⚠️ Token vencido (401). Iniciando renovación automática...");
            // Evitamos bucle infinito
            originalRequest._retry = true;

            try {
                // A. Buscamos el Refresh Token
                // (Debes guardar este token en el login igual que guardas el normal)
                const refreshToken = localStorage.getItem("refreshToken") || sessionStorage.getItem("refreshToken");

                if (!refreshToken) {
                    // Si no hay refresh token, no hay nada que hacer -> Logout
                    throw new Error("No refresh token");
                }

                // B. Llamamos al endpoint de renovación
                // Nota: Usamos una instancia nueva de axios para evitar interceptores en esta llamada
                console.log("🔄 Pidiendo nuevo token al servidor...");
                const response = await axios.post(`${baseURL}/auth/refresh-token`, { refreshToken });
                console.log("✅ Token renovado con éxito. Reintentando petición original.");

                const { token: newAccessToken } = response.data;

                // C. Guardamos el nuevo token donde corresponda
                if (localStorage.getItem("token")) {
                    localStorage.setItem("token", newAccessToken);
                } else {
                    sessionStorage.setItem("token", newAccessToken);
                }

                // D. Actualizamos el header de la petición original fallida
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;

                // E. Reintentamos la petición original
                return api(originalRequest);

            } catch (refreshError) {
                // F. Si falla la renovación (Refresh vencido o inválido) -> LOGOUT FORZOSO
                console.error("Sesión expirada totalmente:", refreshError);
                localStorage.clear();
                sessionStorage.clear();
                alert("Tu sesión ha caducado por seguridad. Por favor, inicia sesión nuevamente.");
                window.location.href = "/login"; // Redirigimos al login
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;