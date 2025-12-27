import React from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../API/axios";

export const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.post("/api/users/logout");
    } catch (error) {
      console.error("Error al registrar salida", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  return (
    <nav className="fixed w-full z-50 top-0 start-0 bg-gradient-to-b from-gray-900 via-gray-900/80 to-transparent pb-8 transition-all">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4 relative">
        
        {/* --- IZQUIERDA: LOGO --- */}
        <div 
            onClick={() => navigate("/home")} 
            className="flex items-center space-x-1 cursor-pointer group z-20"
        >
            <span className="self-center text-2xl font-semibold whitespace-nowrap text-white group-hover:text-gray-200 transition-colors">
                Gym<span className="text-green-500 group-hover:text-green-400">App</span>
            </span>
        </div>

        {/* --- CENTRO: BOTONES DE NAVEGACIÓN --- */}
        {/* Uso 'absolute' y 'translate' para centrarlo perfectamente respecto a la pantalla */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 hidden md:flex gap-8 z-10">
            <Link 
              to="/home" 
              className="text-gray-300 hover:text-green-400 font-medium text-sm transition-colors tracking-wider hover:scale-125 transform duration-200"
            >
              Inicio
            </Link>
            <Link 
              to="/profile" 
              className="text-gray-300 hover:text-green-400 font-medium text-sm transition-colors tracking-wider hover:scale-125 transform duration-200"
            >
              Mi Perfil
            </Link>
        </div>
        
        {/* --- DERECHA: PERFIL + SALIR --- */}
        <div className="flex items-center gap-4 z-20">
          
          {/* Cápsula de Usuario */}
          <div 
            onClick={() => navigate("/profile")} 
            className="flex items-center gap-3 cursor-pointer hover:bg-white/10 border border-transparent hover:border-white/10 p-2 rounded-xl transition-all duration-300"
          >
            <div className="w-10 h-10 rounded-full bg-gray-700 border border-gray-600 overflow-hidden flex items-center justify-center text-white font-bold shadow-sm">
              {user.fotoPerfil ? (
                <img src={user.fotoPerfil} alt="User" className="w-full h-full object-cover" />
              ) : (
                <span className="text-lg">{user.nombre?.charAt(0)}</span>
              )}
            </div>

            <div className="hidden sm:block text-right">
              <p className="text-sm font-bold text-gray-200 leading-tight">{user.nombreUsuario}</p>
              <p className="text-xs text-green-400 font-medium">{user.rol}</p>
            </div>
          </div>

          {/* Botón Salir */}
          <button 
            onClick={handleLogout}
            className="text-white bg-red-600/70 hover:bg-red-600/90 border border-red-500/30 backdrop-blur-sm font-medium rounded-lg text-sm px-4 py-2 transition-all duration-300 shadow-lg hover:shadow-red-900/30"
          >
            Salir
          </button>
        </div>
      </div>
    </nav>
  );
};