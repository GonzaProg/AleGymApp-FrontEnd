import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const useCreateUser = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  
  // Obtenemos el usuario actual para saber si es Admin
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = currentUser.rol === "Admin";

  // --- ESTADOS DEL FORMULARIO ---
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    nombreUsuario: "",
    email: "",
    contraseña: "",
    rol: "Alumno" // Por defecto creamos Alumnos
  });

  // Manejador genérico para inputs y selects
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    // Validación simple
    if (!formData.email || !formData.contraseña || !formData.nombreUsuario) {
      return alert("Por favor completa los campos obligatorios");
    }

    try {
      let url = "";
      
      // Lógica para decidir a qué endpoint llamar
      if (formData.rol === "Entrenador") {
        url = "http://localhost:3000/api/auth/crear-entrenador";
      } else {
        // Asumimos que es Alumno
        url = "http://localhost:3000/api/auth/register";
      }

      await axios.post(url, formData, {
        headers: { Authorization: `Bearer ${token}` } // Importante para crear entrenadores
      });

      alert(`Usuario ${formData.nombreUsuario} creado con éxito!`);
      navigate("/home");

    } catch (error: any) {
      alert(error.response?.data?.error || "Error al crear usuario");
    }
  };

  // Función para cancelar y volver
  const handleCancel = () => navigate("/home");

  return {
    formData,
    isAdmin,
    handleChange,
    handleSubmit,
    handleCancel
  };
};