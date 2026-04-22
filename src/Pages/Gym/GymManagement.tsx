import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { GymApi, type GymDTO } from "../../API/Gym/GymApi";
import { Card } from "../../Components/UI/Card";
import { showSuccess, showError } from "../../Helpers/Alerts";
import { useEditGym } from "../../Hooks/Gym/useEditGym";
import { AppStyles } from "../../Styles/AppStyles";
import { Button } from "../../Components/UI/Button";
import { Input } from "../../Components/UI/Input";
import { Edit2, Image as ImageIcon, Camera } from "lucide-react";

export const GymManagement = () => {
  const [gyms, setGyms] = useState<GymDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const loadGyms = async () => {
    try {
      const data = await GymApi.getAll();
      setGyms(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const {
    showEditModal,
    nombre, setNombre,
    codigo, setCodigo,
    selectedLogo, handleLogoChange,
    selectedFondo, handleFondoChange,
    removeFondo, setRemoveFondo,
    loading: editLoading,
    openEditModal,
    closeEditModal,
    handleSubmit
  } = useEditGym(loadGyms);

  

  useEffect(() => {
    loadGyms();
  }, []);

  const handleToggle = async (gym: GymDTO) => {
    try {
      // Optimistic UI Update
      const newStatus = !gym.activo;
      setGyms(prev => prev.map(g => g.id === gym.id ? { ...g, activo: newStatus } : g));

      await GymApi.toggleStatus(gym.id, newStatus);
      showSuccess(newStatus ? "Gimnasio Activado" : "Gimnasio Bloqueado");
    } catch (error) {
      showError("Error al cambiar estado");
      loadGyms(); // Revertir
    }
  };

  if (loading) return <div className="text-white">Cargando gimnasios...</div>;

  return (
    <div className="mt-16 animate-fade-in-up">
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gyms.map((gym) => (
          <Card key={gym.id} className={`border ${gym.activo ? 'border-green-500/30 bg-gray-900/90' : 'border-red-500/30 bg-red-900/90'}`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-white">{gym.nombre}</h3>
                <p className="text-gray-400 text-xs mt-1">Código: <span className="text-yellow-400 font-mono">{gym.codigoAcceso}</span></p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => openEditModal(gym)}
                  className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded text-sm hover:bg-blue-500/30 transition flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" /> Editar
                </button>
                <span className={`px-2 py-1 rounded text-xs font-bold ${gym.activo ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {gym.activo ? 'ACTIVO' : 'BLOQUEADO'}
                </span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between bg-gray-800/50 p-3 rounded-lg">
              <span className="text-gray-300 text-sm">Acceso al sistema</span>
              
              {/* Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={gym.activo}
                  onChange={() => handleToggle(gym)}
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
              </label>
            </div>
          </Card>
        ))}
      </div>

      {/* MODAL EDITAR GYM */}
      {showEditModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className={AppStyles.modalContent}>
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Editar Gimnasio</h2>
              <button onClick={closeEditModal} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className={`p-6 space-y-4 flex-1 ${AppStyles.customScrollbar}`}>
                <Input
                  label="Nombre del Gimnasio"
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                />
                <Input
                  label="Código de Acceso"
                  type="text"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  required
                />
                <div>
                  <label className={AppStyles.label}>Logo (Opcional)</label>
                  <div className="mt-2 border-2 border-dashed border-white/20 rounded-xl p-4 text-center hover:border-purple-500/50 hover:bg-white/5 transition-all group cursor-pointer relative h-20 flex items-center justify-center">
                    <input 
                      type="file" accept="image/*" 
                      onChange={handleLogoChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="flex flex-col items-center gap-2 pointer-events-none">
                      {selectedLogo ? (
                        <>
                          <ImageIcon className="w-8 h-8 text-purple-400" />
                          <p className="text-purple-400 font-bold text-sm truncate max-w-[150px]">{selectedLogo.name}</p>
                        </>
                      ) : (
                        <>
                          <Camera className="w-8 h-8 text-gray-500 group-hover:scale-110 transition" />
                          <p className="text-gray-400 text-xs">Arrastra logo</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className={AppStyles.label}>Fondo de Inicio de Alumnos (Opcional)</label>
                  <div className="mt-2 border-2 border-dashed border-white/20 rounded-xl p-4 text-center hover:border-blue-500/50 hover:bg-white/5 transition-all group cursor-pointer relative h-20 flex items-center justify-center">
                    <input 
                      type="file" accept="image/*" 
                      onChange={handleFondoChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="flex flex-col items-center gap-2 pointer-events-none">
                      {selectedFondo ? (
                        <>
                          <ImageIcon className="w-8 h-8 text-blue-400" />
                          <p className="text-blue-400 font-bold text-sm truncate max-w-[150px]">{selectedFondo.name}</p>
                        </>
                      ) : removeFondo ? (
                        <>
                          <Camera className="w-8 h-8 text-red-500" />
                          <p className="text-red-400 text-xs font-bold w-full">Fondo será eliminado</p>
                        </>
                      ) : (
                        <>
                          <Camera className="w-8 h-8 text-gray-500 group-hover:scale-110 transition" />
                          <p className="text-gray-400 text-xs">Arrastra imagen de fondo</p>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end mt-2 relative z-20">
                    <button 
                      type="button"
                      onClick={() => {
                        const nextState = !removeFondo;
                        setRemoveFondo(nextState);
                        if (nextState) {
                            handleFondoChange({ target: { files: null } } as any);
                        }
                      }}
                      className={`text-xs px-3 py-1 rounded transition-colors ${removeFondo ? 'bg-gray-700 text-gray-300' : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'}`}
                    >
                      {removeFondo ? "Deshacer eliminación" : "Eliminar fondo actual"}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400">Eliminar el fondo actual solo lo elimina de mi DB pero no de cloudinary, eso debo eliminarlo manualmente.</p>
                </div>
              </div>

              <div className="p-6 border-t border-white/10 flex gap-4 shrink-0">
                <Button type="submit" disabled={editLoading} className="flex-1">
                  {editLoading ? "Guardando..." : "Guardar Cambios"}
                </Button>
                <Button type="button" onClick={closeEditModal} className={AppStyles.btnSecondary + " flex-1"}>
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};