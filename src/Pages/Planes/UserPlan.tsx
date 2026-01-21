import { AppStyles } from "../../Styles/AppStyles";
import { Card } from "../../Components/UI/Card";
import { useUserPlan } from "../../Hooks/Planes/useUserPlan";
import { PageLayout } from "../../Components/UI/PageLayout";
import fondoGym from "../../assets/Fondo-MiPlan.jpg";

export const UserPlan = () => {
  const { myPlan, loading, error } = useUserPlan();

  if (loading) return <div className="p-8 text-center text-gray-400 animate-pulse">Cargando tu plan...</div>;
  if (error) return <div className="p-8 text-center text-red-400">{error}</div>;

  return (
    <PageLayout backgroundImage={fondoGym}>
        <div className="w-full max-w-4xl mx-auto space-y-6 mt-20">
          
          <div className={AppStyles.headerContainer}>
            <h1 className={AppStyles.title + " text-4xl"}>Mi Plan</h1>
            <p className={AppStyles.subtitle}>Estado de tu suscripción actual</p>
          </div>

          {myPlan ? (
            <div className="mb-10 animate-fade-in w-full">
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
            <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm w-full">
                <span className="text-5xl mb-4">📭</span>
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