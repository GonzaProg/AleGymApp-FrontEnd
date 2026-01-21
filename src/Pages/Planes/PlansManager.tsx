import { useState } from "react";
import { createPortal } from "react-dom";
import { AppStyles } from "../../Styles/AppStyles";
import { Card } from "../../Components/UI/Card";
import { Button } from "../../Components/UI/Button";
import { Input } from "../../Components/UI/Input";
import { usePlans } from "../../Hooks/Planes/usePlans";

export const PlansManager = () => {
  const { 
    planes, 
    loading, 
    isModalOpen, 
    isSubscribeModalOpen, 
    editingPlan, 
    selectedPlanToSubscribe,
    busqueda,
    sugerencias,
    mostrarSugerencias,
    setIsModalOpen, 
    setMostrarSugerencias,
    setIsSubscribeModalOpen,
    openCreateModal, 
    openEditModal, 
    openSubscribeModal,
    handleSavePlan,
    handleSubscribeUser,
    handleSearchChange,
    handleSelectAlumno
  } = usePlans();

  return (
    <div className="w-full h-full flex flex-col pt-6 px-4 animate-fade-in">
      
        <div className="w-full max-w-7xl mx-auto">
          {/* Encabezado Admin */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 w-full gap-4">
            <div className={AppStyles.headerContainer.replace("text-center", "text-left")}>
              <p className={AppStyles.subtitle}>Gestiona las suscripciones del gimnasio</p>
            </div>
            <Button onClick={openCreateModal} className={AppStyles.btnPrimary}>
              + NUEVO PLAN
            </Button>
          </div>

          {/* Catálogo de Planes */}
          {loading ? <p className="text-white text-center py-10">Cargando catálogo...</p> : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20 w-full">
              {planes.map((plan) => (
                <Card key={plan.id} className={`${AppStyles.glassCard} hover:border-green-500/50 transition-all relative group flex flex-col`}>
                  
                  <div className="flex justify-between items-start mb-2">
                     <h3 className="text-2xl font-bold text-white">{plan.nombre}</h3>
                     <button onClick={() => openEditModal(plan)} className={`${AppStyles.btnIconBase} ${AppStyles.btnEdit}`} title="Editar Plan">
                       ✏️
                     </button>
                  </div>

                  <div className="text-3xl font-bold text-green-400 mb-1">
                     ${plan.precio.toLocaleString()} 
                  </div>

                  {plan.fechaActualizacion && (
                      <div className="text-xs text-gray-500 mb-4 font-mono">
                          Actualizado: {new Date(plan.fechaActualizacion).toLocaleDateString()}
                      </div>
                  )}

                  <div className="space-y-3 mb-6 text-sm text-gray-300 flex-grow">
                    <div className="flex items-center gap-2">
                        <span className="bg-white/10 p-1 rounded">📅</span> 
                        <span>Duración: <b>{plan.duracionDias} días</b></span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="bg-white/10 p-1 rounded">💪</span> 
                        <span>Acceso: <b>{plan.diasPorSemana === 7 ? "Pase Libre" : `${plan.diasPorSemana} días por semana`}</b></span>
                    </div>
                    <div className="border-t border-white/10 pt-2 mt-2 italic text-gray-400">
                        "{plan.descripcion}"
                    </div>
                  </div>

                  <Button 
                    onClick={() => openSubscribeModal(plan)}
                    className={`${AppStyles.btnPrimary} w-full mt-auto border-green-500/30 hover:bg-green-600 hover:text-white group-hover:shadow-lg transition-all`}
                  >
                    👤 ASIGNAR A ALUMNO
                  </Button>
                </Card>
              ))}
            </div>
          )}

          {/* === MODALES CON PORTALES === */}
          {isModalOpen && createPortal(
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
              <div className={`${AppStyles.modalContent} max-w-lg w-full p-6 relative`}>
                  <h2 className="text-2xl font-bold text-white mb-6">
                    {editingPlan ? "Editar Plan" : "Crear Nuevo Plan"}
                  </h2>
                  <PlanForm 
                    initialData={editingPlan} 
                    onSubmit={handleSavePlan} 
                    onCancel={() => setIsModalOpen(false)} 
                  />
              </div>
            </div>,
            document.body
          )}

          {isSubscribeModalOpen && selectedPlanToSubscribe && createPortal(
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
                <div className={`${AppStyles.modalContent} max-w-md w-full p-6 overflow-visible relative`}> 
                    <h2 className="text-3xl font-bold text-white mb-2">Asignar Plan</h2>
                    <h3 className="text-2xl text-green-400 font-bold mb-6">{selectedPlanToSubscribe.nombre}</h3>
                    <p className="text-gray-300 mb-4 text-sm">
                        Busca al alumno para activarle este plan por <b>{selectedPlanToSubscribe.duracionDias} días</b>.
                    </p>
                    
                    <SubscribeForm 
                        busqueda={busqueda}
                        sugerencias={sugerencias}
                        mostrarSugerencias={mostrarSugerencias}
                        handleSearchChange={handleSearchChange}
                        handleSelectAlumno={handleSelectAlumno}
                        setMostrarSugerencias={setMostrarSugerencias}
                        onConfirm={handleSubscribeUser}
                        onCancel={() => setIsSubscribeModalOpen(false)}
                    />
                </div>
            </div>,
            document.body
          )}
        </div>
    </div>
  );
};

// --- Subcomponentes (Mantenidos igual) ---
const PlanForm = ({ initialData, onSubmit, onCancel }: any) => {
    const [form, setForm] = useState({
        nombre: initialData?.nombre || "",
        precio: initialData?.precio || "",
        duracionDias: initialData?.duracionDias || "",
        diasPorSemana: initialData?.diasPorSemana || "",
        descripcion: initialData?.descripcion || ""
    });

    const handleChange = (e: any) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: any) => {
        e.preventDefault();
        onSubmit(form);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className={AppStyles.label}>Nombre del Plan</label>
                <Input name="nombre" value={form.nombre} onChange={handleChange} required className={AppStyles.inputDark} placeholder="Ej: Mensual / Semanal" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={AppStyles.label}>Precio ($)</label>
                    <Input type="number" name="precio" value={form.precio} onChange={handleChange} required className={AppStyles.inputDark} />
                </div>
                <div>
                    <label className={AppStyles.label}>Duración (Días)</label>
                    <Input type="number" name="duracionDias" value={form.duracionDias} onChange={handleChange} required className={AppStyles.inputDark} />
                </div>
            </div>
            <div>
                <label className={AppStyles.label}>Días por Semana (1-7)</label>
                <Input type="number" min="1" max="7" name="diasPorSemana" value={form.diasPorSemana} onChange={handleChange} required className={AppStyles.inputDark} />
            </div>
            <div>
                <label className={AppStyles.label}>Descripción</label>
                <textarea name="descripcion" value={form.descripcion} onChange={handleChange} className={`${AppStyles.inputDark} h-24 resize-none`} placeholder="Incluye..."/>
            </div>
            <div className="flex gap-4 mt-6 pt-4 border-t border-white/10">
                <button type="button" onClick={onCancel} className={AppStyles.btnSecondary}>CANCELAR</button>
                <button type="submit" className={AppStyles.btnPrimary + " w-full"}>GUARDAR</button>
            </div>
        </form>
    );
};

const SubscribeForm = ({ 
    busqueda, sugerencias, mostrarSugerencias, 
    handleSearchChange, handleSelectAlumno, setMostrarSugerencias, 
    onConfirm, onCancel 
}: any) => {
    return (
        <div className="space-y-6">
            <div className="relative">
                <Input 
                    label="Buscar Alumno"
                    value={busqueda}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onFocus={() => busqueda && setMostrarSugerencias(true)}
                    placeholder="Escribe nombre..."
                    className={AppStyles.inputDark}
                    labelClassName={AppStyles.label}
                />
                
                {mostrarSugerencias && sugerencias.length > 0 && (
                    <ul className={AppStyles.suggestionsList}>
                        {sugerencias.map((alumno: any) => (
                            <li key={alumno.id} onClick={() => handleSelectAlumno(alumno)} className={AppStyles.suggestionItem}>
                                <div className={AppStyles.avatarSmall}>{alumno.nombre.charAt(0)}</div>
                                <span className="font-medium text-gray-200 group-hover:text-white">
                                    {alumno.nombre} {alumno.apellido}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="flex gap-4 pt-2">
                <button type="button" onClick={onCancel} className={AppStyles.btnSecondary + " w-full"}>CANCELAR</button>
                <Button onClick={onConfirm} className={AppStyles.btnPrimary + " w-full"}>CONFIRMAR</Button>
            </div>
        </div>
    );
};