import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../Components/Navbar";

export const CreateUser = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  
  // Obtenemos el usuario actual para saber si es Admin y mostrar el selector de rol
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = currentUser.rol === "Admin";

  // --- ESTADOS DEL FORMULARIO ---
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    nombreUsuario: "",
    email: "",
    contraseña: "",
    rol: "Alumno" // Por defecto creamos Alumnos
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    // Validacion simple
    if (!formData.email || !formData.contraseña || !formData.nombreUsuario) {
      return alert("Por favor completa los campos obligatorios");
    }

    try {
      let url = "";
      
      // Lógica para decidir a qué endpoint llamar
      if (formData.rol === "Entrenador") {
        url = "http://localhost:3000/api/auth/crear-entrenador";
      } else {
        // Asumimos que es Alumno
        url = "http://localhost:3000/api/auth/register";
      }

      await axios.post(url, formData, {
        headers: { Authorization: `Bearer ${token}` } // Importante para crear entrenadores
      });

      alert(`Usuario ${formData.nombreUsuario} creado con éxito!`);
      navigate("/home");

    } catch (error: any) {
      alert(error.response?.data?.error || "Error al crear usuario");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="container mx-auto p-4 flex justify-center mt-10">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl">
          <h2 className="text-2xl font-bold text-green-800 mb-6 border-b pb-2">
            Registrar Nuevo Usuario
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Nombre */}
            <div>
              <label className="block text-sm font-bold text-gray-700">Nombre</label>
              <input 
                name="nombre" 
                value={formData.nombre} 
                onChange={handleChange}
                type="text" 
                className="w-full border p-2 rounded mt-1" 
              />
            </div>

            {/* Apellido */}
            <div>
              <label className="block text-sm font-bold text-gray-700">Apellido</label>
              <input 
                name="apellido" 
                value={formData.apellido} 
                onChange={handleChange}
                type="text" 
                className="w-full border p-2 rounded mt-1" 
              />
            </div>

            {/* Usuario */}
            <div>
              <label className="block text-sm font-bold text-gray-700">Nombre de Usuario</label>
              <input 
                name="nombreUsuario" 
                value={formData.nombreUsuario} 
                onChange={handleChange}
                type="text" 
                className="w-full border p-2 rounded mt-1" 
                placeholder="Ej: juanperez99"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-gray-700">Email</label>
              <input 
                name="email" 
                value={formData.email} 
                onChange={handleChange}
                type="email" 
                className="w-full border p-2 rounded mt-1" 
                placeholder="juan@mail.com"
              />
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-sm font-bold text-gray-700">Contraseña</label>
              <input 
                name="contraseña" 
                value={formData.contraseña} 
                onChange={handleChange}
                type="password" 
                className="w-full border p-2 rounded mt-1" 
              />
            </div>

            {/* Selector de ROL (Solo visible para ADMIN) */}
            <div>
              <label className="block text-sm font-bold text-gray-700">Rol de Usuario</label>
              <select 
                name="rol" 
                value={formData.rol} 
                onChange={handleChange}
                disabled={!isAdmin} // Si no es admin, queda bloqueado en "Alumno"
                className={`w-full border p-2 rounded mt-1 ${!isAdmin ? 'bg-gray-100 text-gray-500' : ''}`}
              >
                <option value="Alumno">Alumno</option>
                {isAdmin && <option value="Entrenador">Entrenador</option>}
              </select>
              {!isAdmin && <p className="text-xs text-gray-400 mt-1">Como Entrenador solo puedes crear Alumnos.</p>}
            </div>

          </div>

          <div className="mt-8 flex justify-end gap-4">
            <button 
              onClick={() => navigate("/home")}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-semibold"
            >
              Cancelar
            </button>
            <button 
              onClick={handleSubmit}
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition shadow-lg font-bold"
            >
              CREAR USUARIO
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};