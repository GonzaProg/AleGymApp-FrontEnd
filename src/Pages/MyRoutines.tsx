import { useState, useEffect } from "react";
import axios from "axios";
import { Navbar } from "../Components/Navbar";

export const MyRoutines = () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  
  const [rutinas, setRutinas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // ESTADO PARA EL MODAL (Rutina seleccionada)
  const [selectedRoutine, setSelectedRoutine] = useState<any>(null);

  useEffect(() => {
    const fetchRutinas = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/rutinas/usuario/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRutinas(res.data);
      } catch (error) {
        console.error("Error al cargar rutinas", error);
      } finally {
        setLoading(false);
      }
    };

    if (user.id) fetchRutinas();
  }, [user.id, token]);

  // Función para cerrar el modal (click afuera o botón cerrar)
  const closeModal = () => setSelectedRoutine(null);

  return (
    <div className="min-h-screen bg-gray-100 pb-10">
      <Navbar />

      <div className="container mx-auto p-4 mt-6">
        <h2 className="text-3xl font-bold text-green-800 mb-2">Mis Rutinas 💪</h2>
        <p className="text-gray-600 mb-8">Haz clic en una rutina para ver el detalle completo.</p>

        {loading ? (
          <p className="text-center text-gray-500">Cargando entrenamientos...</p>
        ) : rutinas.length === 0 ? (
          <div className="text-center bg-white p-10 rounded-lg shadow">
            <p className="text-gray-400 text-lg">No tienes rutinas asignadas todavía.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* TARJETAS (Vista Previa) */}
            {rutinas.map((rutina) => (
              <div 
                key={rutina.id} 
                onClick={() => setSelectedRoutine(rutina)} // <--- ABRIR MODAL
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition duration-300 border border-gray-100 cursor-pointer transform hover:-translate-y-1"
              >
                <div className="bg-green-600 p-4 text-white">
                  <h3 className="text-xl font-bold truncate">{rutina.nombreRutina}</h3>
                  <div className="flex justify-between text-xs mt-1 text-green-100">
                    {/* Aquí ahora se verá el nombre real gracias al backend fix */}
                    <span>Profe: {rutina.entrenador}</span> 
                    <span>{new Date(rutina.fechaCreacion).toLocaleDateString()}</span>
                  </div>
                </div>
                
                {/* Previsualización rápida (solo 2 o 3 ejercicios) */}
                <div className="p-4">
                  <p className="text-sm text-gray-500 mb-2 font-bold">Resumen:</p>
                  {rutina.detalles && rutina.detalles.length > 0 ? (
                    <ul className="space-y-2">
                      {rutina.detalles.slice(0, 3).map((d: any, i: number) => (
                         <li key={i} className="text-sm text-gray-700 flex justify-between">
                            <span>• {d.ejercicio.nombre}</span>
                            <span className="text-gray-400 text-xs">{d.series}x{d.repeticiones}</span>
                         </li>
                      ))}
                      {rutina.detalles.length > 3 && (
                        <li className="text-xs text-green-600 font-bold mt-2 text-center">
                          + {rutina.detalles.length - 3} ejercicios más...
                        </li>
                      )}
                    </ul>
                  ) : (
                    <p className="text-xs text-gray-400 italic">Sin ejercicios.</p>
                  )}
                </div>
                
                <div className="p-3 bg-gray-50 text-center border-t">
                   <span className="text-green-600 text-sm font-bold">Ver Pantalla Completa 🔍</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* === MODAL DE PANTALLA COMPLETA === */}
      {selectedRoutine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm animate-fade-in">
          
          {/* Contenedor del Modal */}
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Cabecera Modal */}
            <div className="bg-green-700 p-6 text-white flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold">{selectedRoutine.nombreRutina}</h2>
                <p className="text-green-200 mt-1 text-sm">
                  Asignado por: <span className="font-bold text-white">{selectedRoutine.entrenador}</span>
                </p>
                <p className="text-green-200 text-xs">
                  Fecha: {new Date(selectedRoutine.fechaCreacion).toLocaleDateString()}
                </p>
              </div>
              <button 
                onClick={closeModal}
                className="text-white hover:text-gray-200 text-3xl font-bold leading-none"
              >
                &times;
              </button>
            </div>

            {/* Cuerpo Modal (Scrollable) */}
            <div className="p-6 overflow-y-auto bg-gray-50 flex-1">
              <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Plan de Entrenamiento</h3>
              
              {selectedRoutine.detalles && selectedRoutine.detalles.length > 0 ? (
                <div className="space-y-4">
                  {selectedRoutine.detalles.map((detalle: any, index: number) => (
                    <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                      
                      {/* Información del Ejercicio */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                           <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">#{index + 1}</span>
                           <h4 className="text-lg font-bold text-gray-800">{detalle.ejercicio.nombre}</h4>
                        </div>
                        {detalle.ejercicio.urlVideo && (
                           <a href={detalle.ejercicio.urlVideo} target="_blank" rel="noreferrer" className="text-blue-500 text-xs hover:underline">
                             🎥 Ver Video Explicativo
                           </a>
                        )}
                      </div>

                      {/* Detalles Númericos (Series, Reps, Peso) */}
                      <div className="flex gap-4 text-center">
                        <div className="bg-gray-100 p-2 rounded w-20">
                          <p className="text-xs text-gray-500 uppercase font-bold">Series</p>
                          <p className="text-xl font-bold text-green-700">{detalle.series}</p>
                        </div>
                        <div className="bg-gray-100 p-2 rounded w-20">
                          <p className="text-xs text-gray-500 uppercase font-bold">Reps</p>
                          <p className="text-xl font-bold text-green-700">{detalle.repeticiones}</p>
                        </div>
                        <div className="bg-gray-100 p-2 rounded w-24 border-2 border-green-500">
                          <p className="text-xs text-gray-500 uppercase font-bold">Peso</p>
                          <p className="text-xl font-bold text-green-700">{detalle.peso} <span className="text-xs">kg</span></p>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 italic">No hay ejercicios en esta rutina.</p>
              )}
            </div>

            {/* Pie del Modal */}
            <div className="p-4 bg-white border-t flex justify-end">
              <button 
                onClick={closeModal}
                className="bg-gray-800 text-white px-6 py-2 rounded-lg font-bold hover:bg-gray-900 transition"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};