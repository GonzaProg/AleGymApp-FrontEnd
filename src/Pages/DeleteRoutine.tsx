import { useState, useEffect } from "react";
import axios from "axios";
import { Navbar } from "../Components/Navbar";

export const DeleteRoutine = () => {
  const token = localStorage.getItem("token");

  // --- ESTADOS ---
  const [todosLosAlumnos, setTodosLosAlumnos] = useState<any[]>([]);
  const [rutinas, setRutinas] = useState<any[]>([]);
  
  // Buscador
  const [busqueda, setBusqueda] = useState("");
  const [sugerencias, setSugerencias] = useState<any[]>([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState<any>(null);

  // 1. Cargar lista de alumnos al iniciar
  useEffect(() => {
    const fetchAlumnos = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/users/alumnos", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTodosLosAlumnos(res.data);
      } catch (error) {
        console.error("Error cargando alumnos", error);
      }
    };
    fetchAlumnos();
  }, [token]);

  // 2. Lógica del Buscador (Igual a CreateRoutine)
  const handleSearchChange = (text: string) => {
    setBusqueda(text);
    if (text.length > 0) {
      const filtrados = todosLosAlumnos.filter(alumno => {
        const nombreCompleto = `${alumno.nombre} ${alumno.apellido}`.toLowerCase();
        return nombreCompleto.includes(text.toLowerCase());
      });
      setSugerencias(filtrados);
      setMostrarSugerencias(true);
    } else {
      setSugerencias([]);
      setMostrarSugerencias(false);
      setAlumnoSeleccionado(null);
      setRutinas([]); // Limpiamos rutinas si borra el nombre
    }
  };

  const handleSelectAlumno = async (alumno: any) => {
    setBusqueda(`${alumno.nombre} ${alumno.apellido}`);
    setAlumnoSeleccionado(alumno);
    setMostrarSugerencias(false);
    
    // Cargar rutinas de este alumno
    try {
      const res = await axios.get(`http://localhost:3000/api/rutinas/usuario/${alumno.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRutinas(res.data);
    } catch (error) {
      console.error("Error cargando rutinas", error);
    }
  };

  // 3. Eliminar Rutina
  const handleDelete = async (rutinaId: number) => {
    if (!window.confirm("¿Estás SEGURO de eliminar esta rutina? Esta acción no se puede deshacer.")) {
      return;
    }

    try {
      await axios.delete(`http://localhost:3000/api/rutinas/${rutinaId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Actualizamos la lista visualmente quitando la eliminada
      setRutinas(rutinas.filter(r => r.id !== rutinaId));
      alert("Rutina eliminada.");
    } catch (error) {
      alert("Error al eliminar la rutina.");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="container mx-auto p-4 mt-6 max-w-4xl">
        <h2 className="text-2xl font-bold text-red-700 mb-6 flex items-center gap-2">
           🗑️ Gestión de Rutinas (Eliminar)
        </h2>

        {/* --- BUSCADOR --- */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8 relative">
          <label className="block text-sm font-bold text-gray-700 mb-2">Buscar Alumno para ver sus rutinas:</label>
          <input 
            type="text" 
            className="w-full border p-3 rounded focus:ring-2 focus:ring-red-500 outline-none"
            placeholder="Escribe el nombre del alumno..."
            value={busqueda}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => busqueda && setMostrarSugerencias(true)}
          />

          {mostrarSugerencias && sugerencias.length > 0 && (
            <ul className="absolute z-10 w-full left-0 bg-white border border-gray-200 rounded-b-lg shadow-xl max-h-48 overflow-y-auto mt-1">
              {sugerencias.map((alumno) => (
                <li 
                  key={alumno.id}
                  onClick={() => handleSelectAlumno(alumno)}
                  className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                >
                  <span className="font-bold">{alumno.nombre} {alumno.apellido}</span>
                  <span className="text-gray-500 text-xs ml-2">({alumno.email})</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* --- LISTA DE RUTINAS DEL ALUMNO --- */}
        {alumnoSeleccionado && (
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Rutinas de <span className="text-green-600">{alumnoSeleccionado.nombre} {alumnoSeleccionado.apellido}</span>
            </h3>

            {rutinas.length === 0 ? (
              <p className="text-gray-500 italic bg-white p-4 rounded shadow">Este alumno no tiene rutinas asignadas.</p>
            ) : (
              <div className="space-y-4">
                {rutinas.map(rutina => (
                  <div key={rutina.id} className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500 flex justify-between items-center">
                    
                    {/* Info Rutina */}
                    <div>
                      <h4 className="text-lg font-bold">{rutina.nombreRutina}</h4>
                      <p className="text-xs text-gray-500">
                        Creada el: {new Date(rutina.fechaCreacion).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {rutina.detalles?.length || 0} Ejercicios
                      </p>
                    </div>

                    {/* Botón Eliminar */}
                    <button 
                      onClick={() => handleDelete(rutina.id)}
                      className="bg-red-100 text-red-600 hover:bg-red-600 hover:text-white px-4 py-2 rounded-lg font-bold transition flex items-center gap-2"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};