import { useState } from "react";
import { useAuthUser } from "../useAuthUser"; 
import { AuthApi, type CreateUserDTO } from "../../API/Auth/AuthApi"; 
import { showSuccess, showError } from "../../Helpers/Alerts";

export const useCreateUser = () => {
  
  const { isAdmin } = useAuthUser();

  //  ESTADOS DEL FORMULARIO 
  const [formData, setFormData] = useState<CreateUserDTO>({
    nombre: "",
    apellido: "",
    nombreUsuario: "",
    email: "",
    contraseña: "",
    rol: "Alumno"
  });

  const [loading, setLoading] = useState(false); // Agregamos estado de carga

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    // Validar campos vacíos
    if (!formData.email || !formData.contraseña || !formData.nombreUsuario || !formData.nombre) {
      return showError("Por favor completa los campos obligatorios");
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        return showError("⚠️ Por favor ingresa una dirección de correo válida (ej: usuario@email.com)");
    }

    // Validación de seguridad: Solo admin puede crear Entrenadores
    if (formData.rol === "Entrenador" && !isAdmin) {
        return showError("No tienes permisos para crear un Entrenador.");
    }

    setLoading(true);

    try {
      //  LLAMADA A LA API LIMPIA 
      await AuthApi.createUser(formData);

      showSuccess(`Usuario ${formData.nombreUsuario} creado con éxito!`);
      window.location.reload();

    } catch (error: any) {
      const msg = error.response?.data?.error || error.response?.data?.message || "Error al crear usuario";
      showError("❌ Error: " + msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => window.location.reload();

  return {
    formData,
    isAdmin,
    loading,
    handleChange,
    handleSubmit,
    handleCancel
  };
};