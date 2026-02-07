import { useNavigate } from "react-router-dom";

export const useLogout = () => {
    const navigate = useNavigate();

    const logout = () => {
        // 1. Limpiar LOCAL STORAGE (Si marcó "Recordar")
        // Borramos tokens y datos de sesión, PERO dejamos 'remember_dni' por comodidad
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");

        // 2. Limpiar SESSION STORAGE (Si NO marcó "Recordar")
        // Aquí podemos borrar todo sin miedo porque es memoria temporal
        sessionStorage.clear();

        // 3. Forzar recarga o redirección limpia
        // Usamos replace: true para que no puedan volver atrás con el botón del navegador
        navigate("/login", { replace: true });
        
    };

    return { logout };
};