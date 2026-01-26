import { useState } from "react";
import { AuthApi } from "../../API/Auth/AuthApi";
import { useNavigate } from "react-router-dom";
import { showSuccess } from "../../Helpers/Alerts";


export const useRecoverPassword = () => {
    const navigate = useNavigate();
    
    // Pasos: 1 = Pedir DNI, 2 = Pedir Código y Clave
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Datos
    const [dni, setDni] = useState("");
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Para guardar el teléfono del usuario que recibe el código
    const [telefonoDestino, setTelefonoDestino] = useState("");

    // PASO 1: ENVIAR DNI 
    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            // Guardamos la respuesta de la API
            const response = await AuthApi.forgotPassword(dni); 
            
            // Guardamos el teléfono recibido para mostrarlo
            if (response.telefono) {
                setTelefonoDestino(response.telefono);
            }
            
            setStep(2); 
        } catch (err: any) {
            setError(err.response?.data?.error || "Error al enviar código.");
        } finally {
            setLoading(false);
        }
    };

    // PASO 2: CAMBIAR CLAVE 
    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // 1. VALIDACIÓN: Campos vacíos
        if (!newPassword || !confirmPassword) {
            setError("Por favor completa ambos campos de contraseña.");
            return;
        }

        // 2. VALIDACIÓN: Coincidencia
        if (newPassword !== confirmPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        // 3. VALIDACIÓN: Longitud (Opcional pero recomendado)
        if (newPassword.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres.");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            await AuthApi.resetPassword({ token: code, nuevaContrasena: newPassword });
            showSuccess("¡Contraseña actualizada! Ingresa con tus nuevos datos.");
            navigate("/login");
        } catch (err: any) {
            setError(err.response?.data?.error || "Código inválido o expirado.");
        } finally {
            setLoading(false);
        }
    };

    return {
        step,
        loading,
        error,
        dni, setDni,
        code, setCode,
        newPassword, setNewPassword,
        confirmPassword, setConfirmPassword,
        telefonoDestino,
        handleSendCode,
        handleChangePassword
    };
};