import { useEffect, useState } from "react";
import { GymApi, type GymDTO } from "../../API/Gym/GymApi";
import { Card } from "../../Components/UI/Card";
import { showSuccess, showError } from "../../Helpers/Alerts";

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
              <span className={`px-2 py-1 rounded text-xs font-bold ${gym.activo ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {gym.activo ? 'ACTIVO' : 'BLOQUEADO'}
              </span>
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
    </div>
  );
};