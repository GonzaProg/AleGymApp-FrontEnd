import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthApi, type LoginDTO } from "../../API/Auth/AuthApi";

export const useLogin = () => {
  const navigate = useNavigate();

  // ESTADOS 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false); 
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // EFECTO: CARGAR CREDENCIALES GUARDADAS AL INICIAR 
  useEffect(() => {
    const savedEmail = localStorage.getItem("remember_email");
    const savedPass = localStorage.getItem("remember_pass");
    
    if (savedEmail && savedPass) {
      setEmail(savedEmail);
      setPassword(savedPass);
      setRememberMe(true);
    }
  }, []);

  // HANDLERS PARA INPUTS 
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  // Nuevo handler para el checkbox
  const handleRememberMeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRememberMe(e.target.checked);
  };

  // LOGICA DE LOGIN 
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1. Preparamos los datos
      const credentials: LoginDTO = {
        email: email,
        contraseña: password,
      };

      // 2. Llamada a la API
      const data = await AuthApi.login(credentials);

      // 3. Guardar Token y Usuario (Sesión actual)
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // 4. LÓGICA RECORDAR USUARIO (Persistencia futura)
      if (rememberMe) {
        localStorage.setItem("remember_email", email);
        localStorage.setItem("remember_pass", password); 
      } else {
        localStorage.removeItem("remember_email");
        localStorage.removeItem("remember_pass");
      }

      // 5. Redirección
      navigate("/home"); 
      
    } catch (err: any) {
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
    rememberMe, 
    error,
    loading, 
    handleEmailChange,
    handlePasswordChange,
    handleRememberMeChange, 
    handleLogin
  };
};