import { useRenewPlan } from "../../Hooks/Planes/useRenewPlan"; 
import { AppStyles } from "../../Styles/AppStyles";
import { RenewPlanStyles } from "../../Styles/RenewPlanStyles";

export const RenewPlan = () => {
  const {
    planesDisponibles,
    alumnoSeleccionado,
    sugerencias,
    busqueda,
    loadingAction,
    setBusqueda,
    seleccionarAlumno,
    limpiarSeleccion,
    renovarPlan,
    cancelarPlan,
    asignarPlan
  } = useRenewPlan();

  const renderEstadoBadge = (fecha: Date) => {
     const isVencido = new Date(fecha) < new Date();
     return (
        <span className={isVencido ? RenewPlanStyles.badgeVencido : RenewPlanStyles.badgeActivo}>
            {isVencido ? 'VENCIDO' : 'ACTIVO'}
        </span>
     );
  };

  return (
    <div className="w-full h-full flex flex-col pt-6 animate-fade-in">
        <div className="container mx-auto px-4 max-w-5xl">
          
          {/* HEADER */}
          <div className={AppStyles.headerContainer + " mb-8"}>
            <p className={AppStyles.subtitle}>Administra renovaciones, altas y bajas.</p>
          </div>

          {/* BUSCADOR  */}
          {!alumnoSeleccionado && (
            <div className={RenewPlanStyles.searchWrapper}>
              <div className={RenewPlanStyles.searchGlow}></div>
              <div className="relative">
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="🔍 Buscar alumno por nombre..."
                  className={RenewPlanStyles.searchInput}
                />
                
                {sugerencias.length > 0 && (
                  <ul className={AppStyles.suggestionsList}>
                    {sugerencias.map((alumno) => (
                      <li
                        key={alumno.id}
                        onClick={() => seleccionarAlumno(alumno)}
                        className={AppStyles.suggestionItem}
                      >
                        <div className={`${AppStyles.avatarSmall} bg-gray-800 text-red-400 border-red-500/30`}>
                                        {alumno.nombre.charAt(0)}
                        </div>
                        <span className="text-white font-medium">{alumno.nombre} {alumno.apellido}</span>
                        <span className="text-xs text-gray-500 bg-gray-900 px-2 py-1 rounded">{alumno.email}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* DETALLE ALUMNO SELECCIONADO  */}
          {alumnoSeleccionado && (
            <div className={`${AppStyles.glassCard} animate-fade-in`}>
              
              {/* Encabezado del Alumno */}
              <div className="flex flex-col md:flex-row justify-between items-center border-b border-white/10 pb-6 mb-6">
                <div className="flex items-center gap-4">
                  <div className={RenewPlanStyles.avatarContainer}>
                    {alumnoSeleccionado.fotoPerfil ? (
                        <img 
                            src={alumnoSeleccionado.fotoPerfil} 
                            alt="Perfil" 
                            className={RenewPlanStyles.avatarImg}
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                    ) : (
                        <span className={RenewPlanStyles.avatarFallback}>
                            {alumnoSeleccionado.nombre.charAt(0).toUpperCase()}
                        </span>
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {alumnoSeleccionado.nombre} {alumnoSeleccionado.apellido}
                    </h2>
                    <p className="text-gray-400 text-sm">{alumnoSeleccionado.email}</p>
                  </div>
                </div>
                
                <button 
                  onClick={limpiarSeleccion}
                  className="mt-4 md:mt-0 text-gray-400 hover:text-white underline text-sm transition"
                >
                  Cambiar alumno
                </button>
              </div>

              {/* Lógica de Visualización */}
              {alumnoSeleccionado.planActual ? (
                // CASO 1: TIENE PLAN
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className={RenewPlanStyles.activePlanCard}>
                    <div className={RenewPlanStyles.activePlanDecor}></div>
                    <h3 className={RenewPlanStyles.activeLabel}>Plan Activo</h3>
                    <p className={RenewPlanStyles.activePrice}>{alumnoSeleccionado.planActual.nombre}</p>
                    
                    <div className="space-y-3 text-gray-300">
                      <div className={RenewPlanStyles.infoRow}>
                        <span>Vencimiento:</span>
                        <span className={RenewPlanStyles.infoValue}>
                          {new Date(alumnoSeleccionado.fechaVencimientoPlan).toLocaleDateString()}
                        </span>
                      </div>
                      <div className={RenewPlanStyles.infoRow}>
                        <span>Precio:</span>
                        <span className={RenewPlanStyles.infoValue}>
                          ${alumnoSeleccionado.planActual.precio}
                        </span>
                      </div>
                      <div className={RenewPlanStyles.infoRow}>
                        <span>Estado:</span>
                        {renderEstadoBadge(alumnoSeleccionado.fechaVencimientoPlan)}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-center gap-4">
                    <button 
                      onClick={renovarPlan}
                      disabled={loadingAction}
                      className={`${AppStyles.btnPrimary} w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {loadingAction ? 'Procesando...' : '♻️ RENOVAR SUSCRIPCIÓN'}
                    </button>
                    
                    <button 
                      onClick={cancelarPlan}
                      disabled={loadingAction}
                      className={`${AppStyles.btnSecondary} w-full`}
                    >
                        Cancelar Plan Actual
                    </button>
                  </div>
                </div>

              ) : (
                // CASO 2: NO TIENE PLAN
                <div>
                    <div className={RenewPlanStyles.emptyStateBox}>
                       <p className={RenewPlanStyles.emptyStateText}>⚠️ Este usuario no tiene suscripción activa. Selecciona un plan.</p>
                    </div>

                    <div className={RenewPlanStyles.plansGrid}>
                       {planesDisponibles.map(plan => (
                         <div 
                           key={plan.id}
                           onClick={() => asignarPlan(plan)}
                           className={RenewPlanStyles.planOptionCard}
                         >
                            <h4 className={RenewPlanStyles.planOptionTitle}>{plan.nombre}</h4>
                            <p className={RenewPlanStyles.planOptionPrice}>${plan.precio}</p>
                            <p className={RenewPlanStyles.planOptionDuration}>{plan.duracionDias} días</p>
                            
                            <button className={RenewPlanStyles.btnSelect}>SELECCIONAR</button>
                         </div>
                       ))}
                    </div>
                </div>
              )}
            </div>
          )}
        </div>
    </div>
  );
};