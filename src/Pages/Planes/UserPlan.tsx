import { AppStyles } from "../../Styles/AppStyles";
import { UserPlanStyles } from "../../Styles/UserPlanStyles";
import { Card } from "../../Components/UI/Card";
import { useUserPlan } from "../../Hooks/Planes/useUserPlan";
import { PageLayout } from "../../Components/UI/PageLayout";
import fondoGym from "../../assets/Fondo-MiPlan.jpg";

export const UserPlan = () => {
  const { myPlan, loading, error } = useUserPlan();

  if (loading) return <div className="p-8 text-center text-gray-400 animate-pulse">Cargando tu plan...</div>;
  if (error) return <div className="p-8 text-center text-red-400">{error}</div>;

  // Lógica para determinar colores y estado
  // Nota: myPlan.estado viene del getter virtual del backend ('Activo', 'Vencido', etc)
  const isActivo = myPlan?.estado === "Activo";
  const dias = myPlan?.diasRestantes || 0;
  const venceHoy = myPlan?.diasRestantes === 0 && myPlan?.estado === "Activo";

  // Clases dinámicas
  const statusColor = venceHoy ? "text-orange-500" : "text-green-500";
  const borderColor = venceHoy ?  "border-orange-500" : "border-green-500";
  const bgTint = venceHoy ? "bg-orange-500/10" : "bg-green-500/10"; 

  // Formateo de fecha seguro
  const fechaVencimientoStr = myPlan?.fechaVencimiento 
    ? new Date(myPlan.fechaVencimiento).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '-';

  return (
    <PageLayout backgroundImage={fondoGym}>
        <div className="w-full max-w-4xl mx-auto space-y-6 mt-20">
          
          <div className={AppStyles.headerContainer}>
            <h1 className={AppStyles.title + " text-4xl"}>Mi Plan</h1>
            <p className={AppStyles.subtitle}>Estado de tu suscripción actual</p>
          </div>

          {myPlan ? (
            <div className="mb-10 animate-fade-in w-full">
              <Card className={`${UserPlanStyles.glassCardUserPlan} border-l-4 ${borderColor} ${bgTint} w-full transition-colors duration-300`}>
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 p-2">
                    
                    {/* IZQUIERDA: Nombre y Estado */}
                    <div className="text-left">
                      <h3 className="text-3xl font-bold text-white mb-2">{myPlan.plan.nombre}</h3>
                      <p className={`${statusColor} font-bold text-lg flex items-center gap-2`}>
                        {isActivo ? '✅' : '⚠️'} Estado: {myPlan.estado}
                      </p>
                    </div>
                    
                    {/* DERECHA: Contador e Info */}
                    <div className="text-right w-full md:w-auto mt-4 md:mt-0">
                      <p className="text-gray-300 text-sm mb-1 tracking-wide font-semibold">
                        {isActivo ? 'Vence el:' : 'Venció el:'} 
                        <span className="text-white ml-2 text-base">{fechaVencimientoStr}</span>
                      </p>
                      
                      <div className="flex items-baseline justify-end gap-2 mt-2">
                         {/* Lógica visual del contador */}
                         {dias > 0 ? (
                             <>
                                <span className={`text-3xl font-black ${isActivo ? 'text-white' : 'text-gray-400'}`}>
                                    {dias}
                                </span>
                                <span className="text-sm font-medium text-gray-400 tracking-wider">
                                    {dias === 1 ? 'Día Restante' : 'Días Restantes'}
                                </span>
                             </>
                         ) : (
                             // Si días es 0 pero está activo, es que vence HOY
                             <span className="text-xl font-bold text-orange-400 animate-pulse">
                                 ⚠️ VENCE HOY
                             </span>
                         )}
                      </div>
                    </div>
                </div>
                
                {/* FOOTER CARD */}
                <div className="mt-6 pt-4 border-t border-white/10 text-gray-400 text-sm italic text-left flex flex-col md:flex-row justify-between items-center gap-2">
                    <span>"{myPlan.plan.descripcion}"</span>
                    {!isActivo && (
                        <span className="text-orange-400 text-xs font-bold uppercase tracking-widest border border-orange-500/50 px-3 py-1 rounded-full bg-orange-500/10">
                            Renovación Pendiente
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
    </PageLayout>
  );
};