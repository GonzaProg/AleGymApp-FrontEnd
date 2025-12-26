import { useMyRoutines } from "../Hooks/MyRoutines/useMyRoutines";
import { PageLayout } from "../Components/UI/PageLayout";
import { Card } from "../Components/UI/Card";
import { Button } from "../Components/UI/Button";

export const MyRoutines = () => {
  const { rutinas, loading, selectedRoutine, setSelectedRoutine, videoUrl, closeModal, closeVideo, handleOpenVideo } = useMyRoutines();

  return (
    <PageLayout>
      <h2 className="text-3xl font-bold text-green-800 mb-2">Mis Rutinas 💪</h2>
      <p className="text-gray-600 mb-8">Haz clic en una rutina para ver el detalle.</p>

      {loading ? (
        <p className="text-center text-gray-500">Cargando entrenamientos...</p>
      ) : rutinas.length === 0 ? (
        // --- AQUÍ ESTÁ EL MENSAJE QUE FALTABA ---
        <Card className="text-center p-10">
          <p className="text-gray-400 text-lg">No tienes rutinas asignadas todavía.</p>
          <p className="text-sm text-gray-400 mt-2">Pídele a tu entrenador que te cree una.</p>
        </Card>
      ) : (
        // --- AQUÍ ESTÁ LA LISTA DE RUTINAS ---
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rutinas.map((rutina) => (
            <Card key={rutina.id} onClick={() => setSelectedRoutine(rutina)} className="hover:shadow-2xl transition duration-300 transform hover:-translate-y-1 cursor-pointer">
              <div className="bg-green-600 -mx-6 -mt-6 p-4 mb-4 text-white">
                 <h3 className="text-xl font-bold truncate">{rutina.nombreRutina}</h3>
                 <span className="text-xs">Profe: {rutina.entrenador}</span>
              </div>
              
              <div className="mb-4">
                 <p className="text-sm text-gray-500 mb-2 font-bold">Resumen:</p>
                 {rutina.detalles && rutina.detalles.length > 0 ? (
                    <ul className="space-y-2">
                       {rutina.detalles.slice(0, 3).map((d: any, i: number) => (
                          <li key={i} className="text-sm flex justify-between text-gray-700">
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

              <div className="text-center border-t pt-3">
                  <span className="text-green-600 font-bold text-sm">Ver Pantalla Completa 🔍</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* --- MODAL DETALLE --- */}
      {selectedRoutine && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
           <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
              <div className="bg-green-700 p-6 text-white flex justify-between items-start">
                 <div>
                    <h2 className="text-2xl font-bold">{selectedRoutine.nombreRutina}</h2>
                    <p className="text-green-100 text-sm mt-1">Asignado por: <b>{selectedRoutine.entrenador}</b></p>
                 </div>
                 <button onClick={closeModal} className="text-3xl hover:text-gray-200 leading-none">&times;</button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1 space-y-4 bg-gray-50">
                 {selectedRoutine.detalles.map((d:any, i:number) => (
                    <div key={i} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                       <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">#{i + 1}</span>
                            <h4 className="font-bold text-gray-800 text-lg">{d.ejercicio.nombre}</h4>
                          </div>
                          {d.ejercicio.urlVideo && (
                            <button onClick={() => handleOpenVideo(d.ejercicio.urlVideo)} className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:underline mt-1 bg-blue-50 px-2 py-1 rounded">
                              ▶ Ver Demostración
                            </button>
                          )}
                       </div>
                       <div className="flex gap-4 text-center">
                          <div className="bg-gray-100 p-2 rounded w-16"><p className="text-xs text-gray-500 font-bold">SERIES</p><p className="font-bold text-green-700 text-lg">{d.series}</p></div>
                          <div className="bg-gray-100 p-2 rounded w-16"><p className="text-xs text-gray-500 font-bold">REPS</p><p className="font-bold text-green-700 text-lg">{d.repeticiones}</p></div>
                          <div className="bg-gray-100 p-2 rounded w-20 border-2 border-green-500"><p className="text-xs text-gray-500 font-bold">PESO</p><p className="font-bold text-green-700 text-lg">{d.peso}<span className="text-xs">kg</span></p></div>
                       </div>
                    </div>
                 ))}
              </div>
              <div className="p-4 border-t bg-white flex justify-end">
                <Button variant="secondary" onClick={closeModal}>Cerrar</Button>
              </div>
           </div>
        </div>
      )}
      
      {/* MODAL VIDEO */}
      {videoUrl && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center animate-fade-in">
           <button onClick={closeVideo} className="absolute top-5 right-5 text-white bg-gray-800/50 hover:bg-red-600 rounded-full w-12 h-12 flex items-center justify-center transition">
             <span className="text-2xl font-bold">&times;</span>
           </button>
           <div className="w-full max-w-5xl aspect-video px-4">
              <iframe src={videoUrl} title="Video" className="w-full h-full rounded-xl shadow-2xl border-4 border-gray-800" allow="autoplay; encrypted-media" allowFullScreen></iframe>
           </div>
           <p className="text-gray-400 mt-4 text-sm animate-pulse">Toca la X para volver</p>
        </div>
      )}
    </PageLayout>
  );
};