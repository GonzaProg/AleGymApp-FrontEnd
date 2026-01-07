import { PageLayout } from "../../Components/UI/PageLayout";
import { Card } from "../../Components/UI/Card";
import { Button } from "../../Components/UI/Button";
import { Input } from "../../Components/UI/Input";
import { AppStyles } from "../../Styles/AppStyles";
import { usePlans } from "../../Hooks/Planes/usePlans";
import { useState } from "react"; 
import fondoGym from "../../assets/GymFondo.jpg";

export const PlansManager = () => {
  const { 
    planes, 
    myPlan, 
    loading, 
    isModalOpen, 
    isSubscribeModalOpen, 
    editingPlan, 
    selectedPlanToSubscribe,
    isEntrenador, 
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
    <PageLayout backgroundImage={fondoGym}>
      
      {/* VISTA DE ADMIN / ENTRENADOR (Gestión)                        */}
      {isEntrenador ? (
        <>
          {/* 1. Encabezado Admin */}
          <div className="flex justify-between items-center mt-20 mb-8">
            <div>
              <h1 className={AppStyles.title.replace("text-center", "text-left")}>Planes y Membresías</h1>
              <p className="text-gray-300">Gestiona las suscripciones del gimnasio</p>
            </div>
            <Button onClick={openCreateModal} className={AppStyles.btnPrimary}>
              + NUEVO PLAN
            </Button>
          </div>

          {/* 2. Catálogo de Planes (Con opciones de edición) */}
          {loading ? <p className="text-white">Cargando catálogo...</p> : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
              {planes.map((plan) => (
                <Card key={plan.id} className={`${AppStyles.glassCard} hover:border-green-500/50 transition-all relative group flex flex-col`}>
                  
                  <div className="flex justify-between items-start mb-2">
                     <h3 className="text-2xl font-bold text-white">{plan.nombre}</h3>
                     <button onClick={() => openEditModal(plan)} className="text-gray-400 hover:text-white transition p-1" title="Editar Plan">
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
                    className={`${AppStyles.btnSecondary} w-full mt-auto border-green-500/30 hover:bg-green-600 hover:text-white group-hover:shadow-lg transition-all`}
                  >
                    👤 ASIGNAR A ALUMNO
                  </Button>
                </Card>
              ))}
            </div>
          )}

          {/* 3. Modales (Solo necesarios para el Admin) */}
          {/* Modal Crear/Editar */}
          {isModalOpen && (
            <div className={AppStyles.modalOverlay}>
              <div className={`${AppStyles.modalContent} max-w-lg p-6`}>
                  <h2 className="text-2xl font-bold text-white mb-6">
                    {editingPlan ? "Editar Plan" : "Crear Nuevo Plan"}
                  </h2>
                  <PlanForm 
                    initialData={editingPlan} 
                    onSubmit={handleSavePlan} 
                    onCancel={() => setIsModalOpen(false)} 
                  />
              </div>
            </div>
          )}

          {/* Modal Asignar */}
          {isSubscribeModalOpen && selectedPlanToSubscribe && (
            <div className={AppStyles.modalOverlay}>
                <div className={`${AppStyles.modalContent} max-w-md p-6 overflow-visible`}> 
                    <h2 className="text-xl font-bold text-white mb-2">Asignar Plan</h2>
                    <h3 className="text-2xl text-green-400 font-bold mb-6">{selectedPlanToSubscribe.nombre}</h3>
                    <p className="text-gray-300 mb-4 text-sm">
                        Busca al alumno para activarle este plan por <b>{selectedPlanToSubscribe.duracionDias} días</b>.
                    </p>
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
                                    {sugerencias.map((alumno) => (
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
                            <button onClick={() => setIsSubscribeModalOpen(false)} className={AppStyles.btnSecondary}>CANCELAR</button>
                            <Button onClick={handleSubscribeUser} className={AppStyles.btnPrimary + " w-full"}>CONFIRMAR</Button>
                        </div>
                    </div>
                </div>
            </div>
          )}
        </>
      ) : (
        
        /* 👤 VISTA DE ALUMNO (Solo visualización) */
          <>
          {/* 1. Encabezado Alumno */}
          <div className="mt-20 mb-8">
            <h1 className={AppStyles.title.replace("text-center", "text-left")}>Mi Plan</h1>
            <p className="text-gray-300">Estado de tu suscripción actual</p>
          </div>

          {/* 2. Tarjeta de Plan Activo */}
          {myPlan ? (
            <div className="mb-10 animate-fade-in max-w-4xl">
              <Card className={`${AppStyles.glassCard} border-l-4 border-green-500`}>
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                      <h3 className="text-2xl font-bold text-white">{myPlan.plan.nombre}</h3>
                      <p className="text-green-400 font-bold">Estado: {myPlan.estado}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-300">Vence el: {new Date(myPlan.fechaVencimiento).toLocaleDateString()}</p>
                      <p className="text-3xl font-bold text-white mt-1">
                          {myPlan.diasRestantes} <span className="text-sm font-normal text-gray-400">días restantes</span>
                      </p>
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/10 text-gray-400 text-sm italic">
                    "{myPlan.plan.descripcion}"
                </div>
              </Card>
            </div>
          ) : (
            // 3. Estado Vacío (Sin Plan)
            !loading && (
              <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm max-w-4xl">
                <span className="text-5xl mb-4">📭</span>
                <h3 className="text-xl text-white font-bold">No tienes un plan activo</h3>
                <p className="text-gray-400 mt-2 text-center max-w-md">
                  Acércate a recepción o habla con tu entrenador para suscribirte a un nuevo plan.
                </p>
              </div>
            )
          )}
        </>
      )}

    </PageLayout>
  );
};

//  EL FORMULARIO SE MANTIENE IGUAL 
const PlanForm = ({ initialData, onSubmit, onCancel }: any) => {
    const [form, setForm] = useState({
        nombre: initialData?.nombre || "",
        precio: initialData?.precio || "",
        duracionDias: initialData?.duracionDias || 30,
        diasPorSemana: initialData?.diasPorSemana || 7,
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
                <Input name="nombre" value={form.nombre} onChange={handleChange} required className={AppStyles.inputDark} placeholder="Ej: Mensual Full" />
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
                <textarea name="descripcion" value={form.descripcion} onChange={handleChange} className={`${AppStyles.inputDark} h-24 resize-none`}/>
            </div>
            <div className="flex gap-4 mt-6 pt-4 border-t border-white/10">
                <Button type="button" onClick={onCancel} className={AppStyles.btnSecondary + " w-full"}>CANCELAR</Button>
                <Button type="submit" className={AppStyles.btnPrimary + " w-full"}>GUARDAR</Button>
            </div>
        </form>
    );
};