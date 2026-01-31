import { useEffect, useState } from "react";
import { GymApi, type GymDTO } from "../../API/Gym/GymApi";
import { Card } from "../../Components/UI/Card";
import { useEditGym } from "../../Hooks/Gym/useEditGym";
import { AppStyles } from "../../Styles/AppStyles";
import { Button } from "../../Components/UI/Button";
import { Input } from "../../Components/UI/Input";

export const GymEdit = () => {
  const [gyms, setGyms] = useState<GymDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const {
    showEditModal,
    nombre, setNombre,
    codigo, setCodigo,
    handleLogoChange,
    loading: editLoading,
    openEditModal,
    closeEditModal,
    handleSubmit
  } = useEditGym(() => loadGyms());

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

  if (loading) return <div className="text-white">Cargando gimnasios...</div>;

  return (
    <div className="mt-16 animate-fade-in-up">
      <h2 className="text-2xl font-bold text-white mb-6">Editar Gimnasio</h2>
      <p className="text-gray-400 mb-8">Selecciona un gimnasio para editar sus datos.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gyms.map((gym) => (
          <Card key={gym.id} className="border border-gray-600 bg-gray-900/90">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-white">{gym.nombre}</h3>
                <p className="text-gray-400 text-xs mt-1">Código: <span className="text-yellow-400 font-mono">{gym.codigoAcceso}</span></p>
                <p className="text-gray-400 text-xs">Estado: <span className={gym.activo ? 'text-green-400' : 'text-red-400'}>{gym.activo ? 'Activo' : 'Bloqueado'}</span></p>
              </div>
            </div>
            <Button onClick={() => openEditModal(gym)} className="w-full">
              ✏️ Editar
            </Button>
          </Card>
        ))}
      </div>

      {/* MODAL EDITAR GYM */}
      {showEditModal && (
        <div className={AppStyles.modalOverlay}>
          <div className={AppStyles.modalContent}>
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Editar Gimnasio</h2>
              <button onClick={closeEditModal} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                <label className="block text-sm font-medium text-gray-300 mb-2">Logo (opcional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="w-full text-white"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={editLoading} className="flex-1">
                  {editLoading ? "Guardando..." : "Guardar Cambios"}
                </Button>
                <Button type="button" onClick={closeEditModal} className={AppStyles.btnSecondary + " flex-1"}>
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};