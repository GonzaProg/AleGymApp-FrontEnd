import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom"; // Para leer token
import { AuthApi } from "../../API/Auth/AuthApi";

export const useResetPassword = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams(); // Hook de Router para query params
    
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Obtenemos el token de la URL
    const token = searchParams.get("token");

    // Validación inicial: Si no hay token, redirigir o mostrar error
    useEffect(() => {
        if (!token) {
            setError("Token inválido o faltante.");
        }
    }, [token]);

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value);
    const handleConfirmChange = (e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        if (!token) return;

        setLoading(true);
        setError(null);

        try {
            await AuthApi.resetPassword({ token, nuevaContrasena: password });
            setSuccess(true);
            // Opcional: Redirigir automáticamente después de unos segundos
            setTimeout(() => navigate("/login"), 3000);
        } catch (err: any) {
            setError(err.response?.data?.error || "El enlace ha expirado o es inválido.");
        } finally {
            setLoading(false);
        }
    };

    return {
        password,
        confirmPassword,
        loading,
        error,
        success,
        isValidToken: !!token,
        handlePasswordChange,
        handleConfirmChange,
        handleSubmit
    };
};