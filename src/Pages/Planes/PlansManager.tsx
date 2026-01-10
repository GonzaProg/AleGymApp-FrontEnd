import { useState } from "react";
import { Navbar } from "../../Components/Navbar";
import { AppStyles } from "../../Styles/AppStyles";
import { Card } from "../../Components/UI/Card";
import { Button } from "../../Components/UI/Button";
import { Input } from "../../Components/UI/Input";
import { usePlans } from "../../Hooks/Planes/usePlans";
import fondoMiPlan from "../../assets/Fondo-MiPlan.jpg";

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
    // CONTENEDOR PRINCIPAL
    <div className="relative min-h-screen w-full overflow-x-hidden font-sans text-gray-100">
      
      {/* 1. FONDO FIJO */}
      <div
        className={AppStyles.fixedBackground}
        style={{
          backgroundImage: `url(${fondoMiPlan})`
        }}
      />

      {/* 2. NAVBAR */}
      <div className="relative z-20">
        <Navbar />
      </div>

      {/* 3. CONTENIDO PRINCIPAL REAJUSTADO */}
      <div className="relative z-10 container mx-auto px-6 pt-24 pb-12 flex flex-col items-start">
        
        {/* 👮‍♂️ VISTA DE ADMIN / ENTRENADOR (Gestión) */}
        {isEntrenador ? (
          <div className="w-full">
            {/* Encabezado Admin */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 w-full">
              <div className={AppStyles.headerContainer.replace("text-center", "text-left")}>
                <h1 className={AppStyles.title}>Planes y Membresías</h1>
                <p className={AppStyles.subtitle}>Gestiona las suscripciones del gimnasio</p>
              </div>
              <Button onClick={openCreateModal} className={AppStyles.btnPrimary}>
                + NUEVO PLAN
              </Button>
            </div>

            {/* Catálogo de Planes */}
            {loading ? <p className="text-white">Cargando catálogo...</p> : (
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

            {/* Modales Admin */}
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

            {isSubscribeModalOpen && selectedPlanToSubscribe && (
              <div className={AppStyles.modalOverlay}>
                  <div className={`${AppStyles.modalContent} max-w-md p-6 overflow-visible`}> 
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
              </div>
            )}
          </div>
        ) : (
          
          /* 👤 VISTA DE ALUMNO (Solo visualización) */
          <div className="w-full">
            {/* 1. Encabezado Alumno - Alineado a la izquierda */}
            <div className={AppStyles.headerContainer.replace("text-center", "text-left")}>
              <h1 className={AppStyles.title}>Mi Plan</h1>
              <p className={AppStyles.subtitle}>Estado de tu suscripción actual</p>
            </div>

            {/* 2. Tarjeta de Plan Activo - Ancha y alineada */}
            {myPlan ? (
              <div className="mb-10 animate-fade-in w-full max-w-4xl">
                <Card className={`${AppStyles.glassCard} border-l-4 border-green-500 w-full`}>
                  <div className="flex flex-col md:flex-row justify-between items-center gap-6 p-2">
                      <div className="text-left">
                        <h3 className="text-3xl font-bold text-white mb-2">{myPlan.plan.nombre}</h3>
                        <p className="text-green-400 font-bold text-lg">Estado: {myPlan.estado}</p>
                      </div>
                      
                      <div className="text-right w-full md:w-auto mt-4 md:mt-0">
                        <p className="text-gray-300 text-sm mb-1">Vence el: {new Date(myPlan.fechaVencimiento).toLocaleDateString()}</p>
                        <div className="flex items-baseline justify-end gap-2">
                           <span className="text-4xl font-bold text-white">{myPlan.diasRestantes}</span>
                           <span className="text-sm font-normal text-gray-400">días restantes</span>
                        </div>
                      </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-white/10 text-gray-400 text-sm italic text-left">
                      "{myPlan.plan.descripcion}"
                  </div>
                </Card>
              </div>
            ) : (
              // 3. Estado Vacío (Sin Plan)
              !loading && (
                <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm w-full max-w-4xl mx-auto">
                  <span className="text-5xl mb-4">📭</span>
                  <h3 className="text-xl text-white font-bold">No tienes un plan activo</h3>
                  <p className="text-gray-400 mt-2 text-center max-w-md">
                    Acércate a recepción o habla con tu entrenador para suscribirte a un nuevo plan.
                  </p>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// --- SUBCOMPONENTE 1: FORMULARIO DE PLAN ---
const PlanForm = ({ initialData, onSubmit, onCancel }: any) => {
    const [form, setForm] = useState({
        nombre: initialData?.nombre,
        precio: initialData?.precio,
        duracionDias: initialData?.duracionDias,
        diasPorSemana: initialData?.diasPorSemana,
        descripcion: initialData?.descripcion
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
                <Input name="nombre" value={form.nombre} onChange={handleChange} required className={AppStyles.inputDark} placeholder="Ej: Mensual / Semanal / Diario" />
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
                <textarea name="descripcion" value={form.descripcion} onChange={handleChange} className={`${AppStyles.inputDark} h-24 resize-none`} placeholder="Ej: Incluye Rutina Personalizada."/>
            </div>
            <div className="flex gap-4 mt-6 pt-4 border-t border-white/10">
                <button type="button" onClick={onCancel} className={AppStyles.btnSecondary}>CANCELAR</button>
                <button type="submit" className={AppStyles.btnPrimary + " w-full"}>GUARDAR</button>
            </div>
        </form>
    );
};

// --- SUBCOMPONENTE 2: FORMULARIO DE SUSCRIPCIÓN ---
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