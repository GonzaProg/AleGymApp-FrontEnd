import { useNavigate } from "react-router-dom";

export const Navbar = () => {
  const navigate = useNavigate();
  // Recuperamos el usuario guardado en el Login
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="bg-green-700 p-4 text-white shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold cursor-pointer" onClick={() => navigate("/home")}>
          GymApp
        </h1>
        
        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block"> {/* Oculto en celular, visible en PC */}
            <p className="font-semibold">{user.nombre}</p>
            <p className="text-xs text-green-200">{user.rol}</p>
          </div>
          
          <button 
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm transition"
          >
            Salir
          </button>
        </div>
      </div>
    </nav>
  );
};