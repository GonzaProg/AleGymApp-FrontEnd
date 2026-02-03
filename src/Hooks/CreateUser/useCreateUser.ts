import { useState } from "react";
import { useAuthUser } from "../Auth/useAuthUser"; 
import { AuthApi, type CreateUserDTO } from "../../API/Auth/AuthApi"; 
import { showSuccess, showError } from "../../Helpers/Alerts";
import { useGymConfig } from "../../Context/GymConfigContext"; 

export const useCreateUser = () => {
  
  const { isAdmin } = useAuthUser();
  const { gymCode } = useGymConfig(); // OBTENER CÓDIGO LOCAL

  // ESTADOS DEL FORMULARIO 
  const [formData, setFormData] = useState<CreateUserDTO>({
    dni: "",              
    nombre: "",
    apellido: "",
    nombreUsuario: "",
    email: "",
    contraseña: "",
    telefono: "",         
    fechaNacimiento: "",  
    rol: "Alumno"
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    // Validar campos vacíos
    if (!formData.dni || !formData.email || !formData.contraseña || !formData.nombreUsuario || !formData.nombre) {
      return showError("Por favor completa los campos obligatorios (*)");
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        return showError("⚠️ Por favor ingresa un email válido.");
    }

    // Validar formato DNI
    if (!/^\d+$/.test(formData.dni)) {
        return showError("⚠️ El DNI debe contener solo números.");
    }

    // Seguridad
    if (formData.rol === "Entrenador" && !isAdmin) {
        return showError("No tienes permisos para crear un Entrenador.");
    }

    setLoading(true);

    try {
      // INYECTAR EL CÓDIGO DEL GIMNASIO AL CREAR
      const dataToSend: any = {
          ...formData,
          codigoGym: gymCode || undefined
      };

      // No enviar fechaNacimiento si está vacío
      if (!dataToSend.fechaNacimiento) {
          delete dataToSend.fechaNacimiento;
      }

      // No enviar telefono si está vacío
      if (!dataToSend.telefono) {
          delete dataToSend.telefono;
      }

      await AuthApi.createUser(dataToSend);

      await showSuccess(`Usuario ${formData.nombreUsuario} creado con éxito!`);
      window.location.reload();

    } catch (error: any) {
      const msg = error.response?.data?.error || error.message || "Error al crear usuario";
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