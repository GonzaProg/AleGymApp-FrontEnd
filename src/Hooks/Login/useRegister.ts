import { useState } from "react";
import { AuthApi } from "../../API/Auth/AuthApi";
import { useAuthUser } from "../Auth/useAuthUser";
import { useGymConfig } from "../../Context/GymConfigContext";
import { showError, showSuccess } from "../../Helpers/Alerts";

export const useRegister = (onSuccess: () => void) => {
    const { login } = useAuthUser(); // Para autologuear al terminar
    const { gymCode } = useGymConfig(); // Obtenemos el código de la PC

    const [formData, setFormData] = useState({
        dni: "",
        nombre: "",
        apellido: "",
        contraseña: "",
        confirmarContrasena: "",
        telefono: "",
        fechaNacimiento: ""
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!gymCode) return showError("Error de configuración: Sin código de gimnasio.");
        if (formData.contraseña !== formData.confirmarContrasena) return showError("Las contraseñas no coinciden.");
        if (formData.contraseña.length < 6) return showError("La contraseña debe tener al menos 6 caracteres.");

        setLoading(true);
        try {
            // Preparamos el DTO
            const payload = {
                ...formData,
                rol: "Alumno",
                codigoGym: gymCode // Enviamos el código del gym configurado en la PC
            };

            const response = await AuthApi.createUser(payload);
            
            // Autologin con la respuesta del registro
            login(response.user, response.token, response.refreshToken);
            
            await showSuccess("¡Cuenta creada! Tienes un Plan de Prueba de 1 día 🎁");
            onSuccess(); // Navegar o cerrar form

        } catch (error: any) {
            showError(error.response?.data?.error || "Error al registrarse");
        } finally {
            setLoading(false);
        }
    };

    return {
        formData,
        handleChange,
        handleRegister,
        loading
    };
};