import axios from "axios";

// Vite expone las variables de entorno en import.meta.env
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const api = axios.create({
    baseURL: baseURL,
    // Aquí puedes añadir headers comunes si quieres
});

// Interceptor opcional para añadir el token automáticamente
api.interceptors.request.use((config) => {
    
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;