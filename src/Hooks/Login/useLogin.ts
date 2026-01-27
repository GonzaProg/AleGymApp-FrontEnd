import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthApi } from "../../API/Auth/AuthApi";
import { useGymConfig } from "../../Context/GymConfigContext";

export const useLogin = () => {
  const navigate = useNavigate();
  const { gymCode } = useGymConfig(); // Obtenemos el código local (Ej: "IRON-GYM")

  // ESTADOS 
  const [dni, setDni] = useState(""); 
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false); 
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // EFECTO: CARGAR CREDENCIALES GUARDADAS AL INICIAR 
  useEffect(() => {
    const savedDni = localStorage.getItem("remember_dni"); 
    const savedPass = localStorage.getItem("remember_pass");
    
    if (savedDni && savedPass) {
      setDni(savedDni);
      setPassword(savedPass);
      setRememberMe(true);
    }
  }, []);

  // HANDLERS PARA INPUTS 
  const handleDniChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^\d*$/.test(val)) { 
        setDni(val);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleRememberMeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRememberMe(e.target.checked);
  };

  // LOGICA DE LOGIN 
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1. Preparamos los datos INCLUYENDO EL CÓDIGO DEL GYM
      // Nota: Asegúrate de actualizar la interfaz LoginDTO en AuthApi para aceptar 'codigoGym' opcional
      const credentials: any = { // Usamos any temporalmente o actualiza tu DTO
        dni: dni, 
        contraseña: password,
        codigoGym: gymCode //  Vincula el login a esta PC
      };

      // 2. Llamada a la API
      const data = await AuthApi.login(credentials);

      // Si el backend devuelve "requireGymSelection", aquí deberías manejarlo.
      // Pero como enviamos 'codigoGym', debería entrar directo.

      // 3. Guardar Token y Usuario (Sesión actual)
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // 4. LÓGICA RECORDAR USUARIO (Persistencia futura)
      if (rememberMe) {
        localStorage.setItem("remember_dni", dni); 
        localStorage.setItem("remember_pass", password); 
      } else {
        localStorage.removeItem("remember_dni");
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
    dni,      
    password,
    rememberMe, 
    error,
    loading, 
    handleDniChange,
    handlePasswordChange,
    handleRememberMeChange, 
    handleLogin
  };
};