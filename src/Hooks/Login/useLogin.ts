import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../API/axios";

export const useLogin = () => {
  const navigate = useNavigate();

  // --- ESTADOS ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  // --- HANDLERS PARA INPUTS ---
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  // --- LOGICA DE LOGIN ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // 1. Llamada a la API (URL relativa)
      const response = await api.post("/api/auth/login", {
        email: email,
        contraseña: password,
      });

      // 2. Guardar Token y Usuario
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // 3. Feedback y Redirección
      alert(`Bienvenido ${user.nombre}`);
      navigate("/home"); 

    } catch (err: any) {
      // Manejo de errores
      if (err.response) {
        setError(err.response.data.error || "Error de credenciales");
      } else {
        setError("Error al conectar con el servidor");
      }
    }
  };

  return {
    email,
    password,
    error,
    handleEmailChange,
    handlePasswordChange,
    handleLogin
  };
};