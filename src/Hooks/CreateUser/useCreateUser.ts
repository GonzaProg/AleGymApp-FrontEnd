import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../API/axios"; 

export const useCreateUser = () => {
  const navigate = useNavigate();
  
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = currentUser.rol === "Admin";

  // --- ESTADOS DEL FORMULARIO ---
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    nombreUsuario: "",
    email: "",
    contraseña: "",
    rol: "Alumno"
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    if (!formData.email || !formData.contraseña || !formData.nombreUsuario) {
      return alert("Por favor completa los campos obligatorios");
    }

    try {
      let url = "";
      
      // Usamos rutas relativas
      if (formData.rol === "Entrenador") {
        url = "/api/auth/crear-entrenador";
      } else {
        url = "/api/auth/register";
      }

      await api.post(url, formData);

      alert(`Usuario ${formData.nombreUsuario} creado con éxito!`);
      navigate("/home");

    } catch (error: any) {
      alert(error.response?.data?.error || "Error al crear usuario");
    }
  };

  const handleCancel = () => navigate("/home");

  return {
    formData,
    isAdmin,
    handleChange,
    handleSubmit,
    handleCancel
  };
};