import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthApi, type LoginDTO } from "../../API/Auth/AuthApi";

export const useLogin = () => {
  const navigate = useNavigate();

  // --- ESTADOS ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
    setLoading(true);

    try {
      // 1. Preparamos los datos usando la interfaz DTO
      const credentials: LoginDTO = {
        email: email,
        contraseña: password,
      };

      // 2. Llamada a la API limpia
      const data = await AuthApi.login(credentials);

      // 3. Guardar Token y Usuario
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // 4. Feedback y Redirección
      navigate("/home"); 
      
    } catch (err: any) {
      // Manejo de errores
      if (err.response) {
        setError(err.response.data.error || "Credenciales incorrectas");
      } else {
        setError("Error al conectar con el servidor");
      }
    } finally {
        setLoading(false);
    }
  };

  return {
    email,
    password,
    error,
    loading, 
    handleEmailChange,
    handlePasswordChange,
    handleLogin
  };
};