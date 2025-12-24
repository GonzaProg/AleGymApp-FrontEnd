import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // 1. Llamada al Backend (Asegurate que tu backend esté corriendo en el puerto 3000)
      const response = await axios.post("http://localhost:3000/api/auth/login", {
        email: email,
        contraseña: password, // Ojo: debe coincidir con como lo espera tu backend (contraseña o password)
      });

      // 2. Guardar el Token en el almacenamiento del navegador
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // 3. Redirigir al usuario (Por ahora al home, luego crearemos esa página)
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

  return (
    // CONTENEDOR PRINCIPAL: Fondo degradado verde (from-green-800 to-green-600)
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-900 via-green-700 to-green-500">
      
      {/* TARJETA BLANCA */}
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-2xl">
        
        <div className="text-center">
          <h1 className="text-3xl font-bold text-green-800">Gym App</h1>
          <p className="text-gray-500">Inicia sesión para ver tu rutina</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          
          {/* Input Email */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
              placeholder="ejemplo@gym.com"
              required
            />
          </div>

          {/* Input Password */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
              placeholder="••••••••"
              required
            />
          </div>

          {/* Mensaje de Error */}
          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg">
              {error}
            </div>
          )}

          {/* Botón de Ingreso */}
          <button
            type="submit"
            className="w-full py-3 font-bold text-white transition duration-300 bg-green-600 rounded-lg hover:bg-green-700 hover:shadow-lg"
          >
            INGRESAR
          </button>
        </form>
        
        <p className="text-xs text-center text-gray-400">
          ¿Olvidaste tu contraseña? Pídele ayuda a tu entrenador.
        </p>
      </div>
    </div>
  );
};