import { useState } from "react";
import { AuthApi } from "../../API/Auth/AuthApi";

export const useForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null); // Éxito
    const [error, setError] = useState<string | null>(null);     // Error

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        if (error) setError(null); // Limpiar error al escribir
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            await AuthApi.forgotPassword(email);
            setMessage("¡Listo! Revisa tu correo electrónico (incluyendo spam).");
        } catch (err: any) {
            // Si el backend devuelve error, lo mostramos (o un genérico)
            const errorMsg = err.response?.data?.error || "Ocurrió un error al enviar la solicitud.";
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return {
        email,
        loading,
        message,
        error,
        handleEmailChange,
        handleSubmit
    };
};