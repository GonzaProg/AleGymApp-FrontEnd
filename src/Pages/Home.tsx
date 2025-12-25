import { useNavigate } from "react-router-dom";
import { Navbar } from "../Components/Navbar";

export const Home = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isEntrenador = user.rol === "Entrenador" || user.rol === "Admin";

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="container mx-auto p-4 mt-10">
        <h1 className="text-3xl font-bold text-gray-800">Hola, {user.nombre} 👋</h1>
        <p className="text-gray-600 mt-2">Bienvenido a tu panel de control.</p>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Tarjeta: Mis Rutinas (Para todos) */}
          <div 
          onClick={() => navigate("/my-routines")}
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer border-l-4 border-green-500">
            <h3 className="text-xl font-bold mb-2">Mis Rutinas</h3>
            <p className="text-gray-500 text-sm">Ver las rutinas asignadas</p>
          </div>

          {/* Tarjeta: Crear Rutina (Solo Entrenadores) */}
          {isEntrenador && (
            <div 
              onClick={() => navigate("/create-routine")}
              className="bg-green-600 text-white p-6 rounded-lg shadow-md hover:bg-green-700 transition cursor-pointer"
            >
              <h3 className="text-xl font-bold mb-2">+ Crear Nueva Rutina</h3>
              <p className="text-green-100 text-sm">Asignar ejercicios a un alumno.</p>
            </div>
          )}

          {/* Tarjeta: REGISTRAR USUARIO (Visible para Entrenador y Admin) */}
          {isEntrenador && (
            <div 
              onClick={() => navigate("/create-user")}
              className="bg-blue-600 text-white p-6 rounded-lg shadow-md hover:bg-blue-700 transition cursor-pointer"
            >
              <h3 className="text-xl font-bold mb-2">👤 Nuevo Usuario</h3>
              <p className="text-blue-100 text-sm">Registrar un nuevo Usuario en el sistema.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};