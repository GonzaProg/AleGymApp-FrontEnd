import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthApi, type LoginDTO } from "../../API/Auth/AuthApi";
import { useGymConfig } from "../../Context/GymConfigContext";

export const useLogin = () => {
  const navigate = useNavigate();
  const { gymCode } = useGymConfig(); // OBTENER CÓDIGO LOCAL

  // ESTADOS 
  const [dni, setDni] = useState(""); 
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false); 
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // NUEVO ESTADO: Para el modal de vencimiento
  const [showExpiredModal, setShowExpiredModal] = useState(false);

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
      // 1. Preparamos los datos INYECTANDO EL GYM CODE
      const credentials: LoginDTO = {
        dni: dni, 
        contraseña: password,
        codigoGym: gymCode || undefined // Enviamos el código local
      };

      // 2. Llamada a la API
      const data = await AuthApi.login(credentials);

      // --- LÓGICA DE PERSISTENCIA ---
            if (rememberMe) {
                // CASO A: PERSISTIR (LocalStorage)
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
                
                // Limpiamos sessionStorage por si acaso había basura vieja
                sessionStorage.removeItem("token");
                sessionStorage.removeItem("user");
            } else {
                // CASO B: SESIÓN TEMPORAL (SessionStorage)
                sessionStorage.setItem("token", data.token);
                sessionStorage.setItem("user", JSON.stringify(data.user));
                
                // Limpiamos localStorage de sesiones previas
                localStorage.removeItem("token");
                localStorage.removeItem("user");
            }
            
            navigate("/home");
      
    } catch (err: any) {
      // --- MANEJO DE ERRORES PERSONALIZADO (BLOQUEOS) ---
      if (err.response && err.response.data) {
          const { code, error: msg } = err.response.data;

          if (code === "GYM_LOCKED") {
              // MENSAJE AMIGABLE DE GYM BLOQUEADO
              setError("⚠️ Mantenimiento Temporal. El sistema está en una breve pausa administrativa. Contacta a tu gimnasio.");
          } else if (code === "USER_EXPIRED") {
              // ABRIMOS MODAL DE VENCIMIENTO
              setShowExpiredModal(true);
              setError(null); // Limpiamos el error rojo para que solo salga el modal
          } else if (code === "USER_LOCKED") {
               // USUARIO INACTIVO (DEUDA)
               setError("⛔ Acceso restringido. Tu cuenta está inactiva. Contacta a administración.");
          } else {
              // OTROS ERRORES (Pass incorrecta, etc)
              setError(msg || "Credenciales incorrectas");
          }
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
    showExpiredModal, // EXPORTAMOS EL ESTADO DEL MODAL
    setShowExpiredModal,
    handleDniChange,
    handlePasswordChange,
    handleRememberMeChange, 
    handleLogin
  };
};