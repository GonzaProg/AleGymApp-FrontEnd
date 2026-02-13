import { useRenewPlan } from "../../Hooks/Planes/useRenewPlan"; 
import { AppStyles } from "../../Styles/AppStyles";
import { RenewPlanStyles } from "../../Styles/RenewPlanStyles";
import { PaymentMethodSelect } from "../../Components/UI/PaymentMethodSelect";

export const RenewPlan = () => {
  const {
    planesDisponibles,
    alumnoSeleccionado,
    sugerencias,
    busqueda,
    loadingAction,
    metodoPago,      
    setMetodoPago,   
    setBusqueda,
    seleccionarAlumno,
    limpiarSeleccion,
    renovarPlan,
    cancelarPlan,
    asignarPlan
  } = useRenewPlan();

  return (
    <div className={AppStyles.principalContainer}>
        <div className="container mx-auto px-4 max-w-5xl">
          
          {/* HEADER */}
          <div className={AppStyles.headerContainer + " mb-8"}>
            <p className={AppStyles.subtitle}>Administra renovaciones, altas y bajas.</p>
          </div>

          {/* BUSCADOR  */}
          {!alumnoSeleccionado && (
            <div className={AppStyles.searchWrapper}>
              <div className={`${AppStyles.searchGlow} bg-gradient-to-r from-green-600 to-blue-600`}></div>
              <div className="relative">
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="🔍 Buscar alumno por nombre..."
                  className={`${AppStyles.searchInput} focus:border-green-500 focus:ring-1 focus:ring-green-500`}
                />
                
                {sugerencias.length > 0 && (
                  <ul className={AppStyles.suggestionsList}>
                    {sugerencias.map((alumno) => (
                      <li
                        key={alumno.id}
                        onClick={() => seleccionarAlumno(alumno)}
                        className={AppStyles.suggestionItem}
                      >
                        <div className={AppStyles.avatarSmall}>
                            {alumno.nombre.charAt(0)}
                        </div>
                        <span className="text-gray-200 font-medium">{alumno.nombre} {alumno.apellido}</span>
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
                  </div>
                </div>
                
                <button 
                  onClick={limpiarSeleccion}
                  className="mt-4 md:mt-0 text-gray-400 hover:text-white underline text-sm transition"
                >
                  Cambiar alumno
                </button>
              </div>

              {/* LISTA DE SUSCRIPCIONES ACTIVAS */}
              <div className="mb-8">
                  <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                      📋 Suscripciones Activas
                      <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                          {alumnoSeleccionado.userPlans?.filter((p: any) => p.activo).length || 0}
                      </span>
                  </h3>

                  {alumnoSeleccionado.userPlans && alumnoSeleccionado.userPlans.some((p: any) => p.activo) ? (
                      <div className="grid grid-cols-1 gap-4">
                          {alumnoSeleccionado.userPlans.filter((p: any) => p.activo).map((sus: any) => (
                              <div key={sus.id} className="bg-gray-800/50 border border-white/10 rounded-xl p-4 flex flex-col lg:flex-row justify-between items-center gap-4 hover:border-white/20 transition-all">
                                  
                                  {/* Info Plan */}
                                  <div className="flex-1 text-left w-full">
                                      <div className="flex items-center gap-2 mb-1">
                                          <h4 className="text-xl font-bold text-green-400">{sus.plan.nombre}</h4>
                                          <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded border border-gray-600 uppercase">
                                              {sus.plan.tipo}
                                          </span>
                                      </div>
                                      <p className="text-gray-400 text-sm">
                                          Vence: <span className="text-white font-mono">{new Date(sus.fechaVencimiento).toLocaleDateString()}</span>
                                      </p>
                                  </div>

                                  {/* Botones de Acción Individuales */}
                                  <div className="flex items-center gap-3 w-full lg:w-auto">
                                      <div className="w-full lg:w-48">
                                          <PaymentMethodSelect 
                                              value={metodoPago} 
                                              onChange={setMetodoPago}
                                              className="mb-0" // Quitar margen bottom
                                          />
                                      </div>
                                      <button 
                                          onClick={() => renovarPlan()} 
                                          disabled={loadingAction}
                                          className="bg-green-600 hover:bg-green-500 text-white p-2 rounded-lg transition shadow-lg disabled:opacity-50"
                                          title="Renovar este plan"
                                      >
                                          {loadingAction ? '...' : '♻️'}
                                      </button>
                                      <button 
                                          onClick={() => cancelarPlan()}
                                          disabled={loadingAction}
                                          className="bg-red-900/50 hover:bg-red-600 text-white p-2 rounded-lg transition border border-red-800/50 disabled:opacity-50"
                                          title="Cancelar este plan"
                                      >
                                          {loadingAction ? '...' : '✕'}
                                      </button>
                                  </div>
                              </div>
                          ))}
                      </div>
                  ) : (
                      <p className="text-gray-500 italic text-center bg-black/20 py-4 rounded-lg border border-white/5">
                          Este usuario no tiene planes activos.
                      </p>
                  )}
              </div>

              {/* SECCIÓN AGREGAR NUEVO PLAN - SOLO SI NO TIENE PLANES ACTIVOS */}
              {!alumnoSeleccionado.userPlans || !alumnoSeleccionado.userPlans.some((p: any) => p.activo) && (
              <div className="border-t border-white/10 pt-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                      <h3 className="text-white font-bold text-lg">➕ Asignar Nuevo Plan</h3>
                      <div className="w-full md:w-64">
                          <label className="text-gray-400 text-xs mb-1 block">Método de Pago para Alta:</label>
                          <PaymentMethodSelect value={metodoPago} onChange={setMetodoPago} />
                      </div>
                  </div>

                  <div className={RenewPlanStyles.plansGrid}>
                      {planesDisponibles.map(plan => (
                          <div 
                              key={plan.id}
                              onClick={() => asignarPlan(plan)}
                              className={`${RenewPlanStyles.planOptionCard} cursor-pointer group hover:bg-gray-800 transition-all`}
                          >
                              <div className="flex justify-between items-start">
                                  <div>
                                      <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider bg-blue-500/10 px-2 py-0.5 rounded">
                                          {plan.tipo}
                                      </span>
                                      <h4 className="text-white font-bold text-lg mt-1 group-hover:text-green-400 transition-colors">
                                          {plan.nombre}
                                      </h4>
                                  </div>
                                  <span className="bg-white/10 text-white text-xs font-mono px-2 py-1 rounded">
                                      ${plan.precio}
                                  </span>
                              </div>
                              <p className="text-gray-500 text-xs mt-3 flex items-center gap-1">
                                  <span>⏳</span> {plan.duracionDias} días
                              </p>
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