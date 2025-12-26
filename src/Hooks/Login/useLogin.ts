import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
      // 1. Llamada al Backend
      const response = await axios.post("http://localhost:3000/api/auth/login", {
        email: email,
        contraseña: password, // Asegúrate de que coincida con el backend
      });

      // 2. Guardar Token y Usuario
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // 3. Feedback y Redirección
      // (Opcional: Podrías quitar el alert para una UX más fluida, pero lo dejamos como pediste)
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