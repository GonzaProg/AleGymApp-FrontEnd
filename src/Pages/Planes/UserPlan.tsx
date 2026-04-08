import { UserPlanStyles } from "../../Styles/UserPlanStyles";
import { Card } from "../../Components/UI/Card";
import { useUserPlan } from "../../Hooks/Planes/useUserPlan";
import { type UserPlanDTO } from "../../API/Planes/PlansApi";
import { Inbox, AlertTriangle, CheckCircle, Waves, Dumbbell } from "lucide-react";

export const UserPlan = () => {
  const { activePlans, loading, error } = useUserPlan();

  if (loading) return <div className="p-8 text-center text-gray-400 animate-pulse mt-20">Cargando tus suscripciones...</div>;
  if (error) return <div className="p-8 text-center text-red-400 mt-20">{error}</div>;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 mt-32 pt-safe px-4 pb-32 relative z-10">
      
      {activePlans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          {activePlans.map((plan) => (
            <PlanCard key={plan.userPlanId} plan={plan} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm w-full animate-fade-in">
            <Inbox className="w-16 h-16 mb-4 opacity-50 text-white" />
            <h3 className="text-xl text-white font-bold">No tienes planes activos</h3>
            <p className="text-gray-400 mt-2 text-center max-w-md px-4">
              Acércate a recepción para asignarte una suscripción.
            </p>
        </div>
      )}
    </div>
  );
};

// Subcomponente Tarjeta Individual (Para renderizar N planes)
const PlanCard = ({ plan }: { plan: UserPlanDTO }) => {
    const dias = plan.diasRestantes;
    const venceHoy = dias === 0;

    // Variables de estilo dinámicas
    const statusColor = venceHoy ? "text-orange-400" : "text-green-400";
    const borderColor = venceHoy ? "border-orange-500" : "border-green-500";
    const bgTint = venceHoy ? "bg-orange-500/10" : "bg-green-500/5"; 
    const badgeBg = venceHoy ? "bg-orange-500/20 animate-pulse" : "bg-green-500/20";
    
    const IconoEstado = venceHoy ? AlertTriangle : CheckCircle;
    const textoEstado = venceHoy ? 'VENCE HOY' : 'AL DÍA';

    const fechaVencimientoStr = new Date(plan.fechaVencimiento).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });

    const IconoPlan = plan.tipo === 'Natacion' ? Waves : Dumbbell;

    return (
        <Card className={`${UserPlanStyles.glassCardUserPlan} border-l-4 ${borderColor} ${bgTint} w-full transition-transform duration-300 hover:scale-[1.02]`}>
            <div className="flex flex-col justify-between h-full p-2">
                
                {/* Header Card */}
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-2xl text-white"><IconoPlan className="w-7 h-7" /></span>
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 border border-white/10 px-2 py-0.5 rounded-full">
                                {plan.tipo}
                            </span>
                        </div>
                        <h3 className="text-2xl font-bold text-white leading-tight">{plan.nombre}</h3>
                    </div>
                    
                    <div className="text-right">
                         <div className={`${statusColor} ${badgeBg} font-bold text-xs px-2 py-1 rounded inline-flex items-center gap-1`}>
                            <span><IconoEstado className="w-4 h-4" /></span>
                            <span>{textoEstado}</span>
                         </div>
                    </div>
                </div>

                {/* Body Card */}
                <div className="flex items-end justify-between mt-auto">
                    <div>
                        <p className="text-gray-400 text-xs uppercase font-semibold mb-1">Vencimiento</p>
                        <p className="text-white font-mono text-lg">{fechaVencimientoStr}</p>
                    </div>
                    <div className="text-right">
                        <span className={`text-4xl font-black ${venceHoy ? 'text-orange-500' : 'text-white'}`}>
                            {dias}
                        </span>
                        <p className="text-xs text-gray-400 font-medium">Días Restantes</p>
                    </div>
                </div>
            </div>
        </Card>
    );
};