import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthUser } from "../useAuthUser"; 
import { AuthApi, type CreateUserDTO } from "../../API/Auth/AuthApi"; 

export const useCreateUser = () => {
  const navigate = useNavigate();
  
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
    if (!formData.email || !formData.contraseña || !formData.nombreUsuario) {
      return alert("Por favor completa los campos obligatorios");
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        return alert("⚠️ Por favor ingresa una dirección de correo válida (ej: usuario@email.com)");
    }

    // Validación de seguridad: Solo admin puede crear Entrenadores
    if (formData.rol === "Entrenador" && !isAdmin) {
        return alert("No tienes permisos para crear un Entrenador.");
    }

    setLoading(true);

    try {
      //  LLAMADA A LA API LIMPIA 
      await AuthApi.createUser(formData);

      alert(`Usuario ${formData.nombreUsuario} creado con éxito!`);
      navigate("/home");

    } catch (error: any) {
      const msg = error.response?.data?.error || error.response?.data?.message || "Error al crear usuario";
      alert("❌ Error: " + msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => navigate("/home");

  return {
    formData,
    isAdmin,
    loading,
    handleChange,
    handleSubmit,
    handleCancel
  };
};