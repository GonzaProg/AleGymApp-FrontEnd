import { UserPlanStyles } from "../../Styles/UserPlanStyles";
import { Card } from "../../Components/UI/Card";
import { useUserPlan } from "../../Hooks/Planes/useUserPlan";

export const UserPlan = () => {
  const { myPlan, loading, error } = useUserPlan();

  if (loading) return <div className="p-8 text-center text-gray-400 animate-pulse mt-20">Cargando tu plan...</div>;
  if (error) return <div className="p-8 text-center text-red-400 mt-20">{error}</div>;

  const dias = myPlan?.diasRestantes || 0;
  const venceHoy = dias === 0;

  const statusColor = venceHoy ? "text-orange-500" : "text-green-500";
  const borderColor = venceHoy ? "border-orange-500" : "border-green-500";
  const bgTint = venceHoy ? "bg-orange-500/10" : "bg-green-500/10";
  const iconoEstado = venceHoy ? '⚠️' : '✅';
  const textoEstado = venceHoy ? 'Vence Hoy' : 'Activo';

  const fechaVencimientoStr = myPlan?.fechaVencimiento 
    ? new Date(myPlan.fechaVencimiento).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '-';

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pt-32 px-4 pb-10 relative z-10">
      {myPlan ? (
        <div className="mb-10 animate-fade-in w-full">
          <Card className={`${UserPlanStyles.glassCardUserPlan} border-l-4 ${borderColor} ${bgTint} w-full transition-colors duration-300`}>
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 p-2">
                
                {/* IZQUIERDA */}
                <div className="text-left">
                  <h3 className="text-3xl font-bold text-white mb-2">{myPlan.plan.nombre}</h3>
                  <p className={`${statusColor} font-bold text-lg flex items-center gap-2`}>
                    {iconoEstado} Estado: {textoEstado}
                  </p>
                </div>
                
                {/* DERECHA */}
                <div className="text-right w-full md:w-auto mt-4 md:mt-0">
                  <div className="text-gray-300 text-sm mb-1 tracking-wide font-semibold justify-end flex items-center">
                    <span>Vence el:</span>
                    <span className="text-white ml-2 text-base font-bold">{fechaVencimientoStr}</span>
                  </div>
                  
                  <div className="flex items-baseline justify-end gap-2 mt-2">
                     {venceHoy ? (
                         <span className="text-xl font-bold text-orange-400 animate-pulse">
                              ⚠️ ÚLTIMO DÍA
                         </span>
                     ) : (
                         <>
                            <span className="text-3xl font-black text-white">
                                {dias}
                            </span>
                            <span className="text-sm font-medium text-gray-400 tracking-wider">
                                {dias === 1 ? 'Día Restante' : 'Días Restantes'}
                            </span>
                         </>
                     )}
                  </div>
                </div>
            </div>
            
            {/* FOOTER CARD */}
            <div className="mt-6 pt-4 border-t border-white/10 text-gray-400 text-sm italic text-left flex flex-col md:flex-row justify-between items-center gap-2">
                <span>"{myPlan.plan.descripcion}"</span>
                
                {venceHoy ? (
                    <span className="text-orange-400 text-xs font-bold uppercase tracking-widest border border-orange-500/50 px-3 py-1 rounded-full bg-orange-500/10 animate-pulse">
                        Renovar Ahora
                    </span>
                ) : (
                    <span className="text-green-400 text-xs font-bold uppercase tracking-widest border border-green-500/20 px-3 py-1 rounded-full bg-green-500/5">
                        Plan al día
                    </span>
                )}
            </div>
          </Card>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm w-full">
            <span className="text-5xl mb-4 opacity-50">📭</span>
            <h3 className="text-xl text-white font-bold">No tienes un plan activo</h3>
            <p className="text-gray-400 mt-2 text-center max-w-md">
              Acércate a recepción o habla con tu entrenador para suscribirte a un nuevo plan.
            </p>
        </div>
      )}
    </div>
  );
};