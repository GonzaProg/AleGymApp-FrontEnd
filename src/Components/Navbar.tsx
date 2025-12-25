import { useNavigate } from "react-router-dom";

export const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evita que el click se propague al contenedor del perfil
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="bg-green-700 p-3 text-white shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        
        {/* LOGO */}
        <h1 className="text-xl font-bold cursor-pointer" onClick={() => navigate("/home")}>
          GymApp
        </h1>
        
        {/* CONTENEDOR PERFIL + SALIR */}
        <div className="flex items-center gap-4">
          
          {/* CÁPSULA DE USUARIO (Clickeable) */}
          <div 
            onClick={() => navigate("/profile")}
            className="flex items-center gap-3 cursor-pointer hover:bg-green-600 p-2 rounded-lg transition duration-200"
          >
            {/* 1. Foto Redonda Pequeña */}
            <div className="w-10 h-10 rounded-full bg-green-200 border-2 border-white overflow-hidden flex items-center justify-center text-green-800 font-bold">
              {user.fotoPerfil ? (
                <img src={user.fotoPerfil} alt="User" className="w-full h-full object-cover" />
              ) : (
                <span>{user.nombre?.charAt(0)}</span>
              )}
            </div>

            {/* 2. Texto (Oculto en celular muy pequeño, visible en demás) */}
            <div className="hidden sm:block text-right">
              <p className="text-sm font-bold leading-tight">{user.nombre}</p>
              <p className="text-xs text-green-200">{user.rol}</p>
            </div>
          </div>

          {/* BOTÓN SALIR */}
          <button 
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-xs font-bold transition shadow"
          >
            Salir
          </button>
        </div>
      </div>
    </nav>
  );
};