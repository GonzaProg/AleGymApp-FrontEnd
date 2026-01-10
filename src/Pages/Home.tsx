import { useHome } from "../Hooks/Home/useHome";
import { PageLayout } from "../Components/UI/PageLayout";
import { Card } from "../Components/UI/Card";
import fondoGym from "../assets/GymFondo.jpg"; 
import { HomeStyles } from "../Styles/HomeStyles";

export const Home = () => {
  const { 
    user, 
    isEntrenador, 
    isLoading,
    goToMyRoutines, 
    goToCreateRoutine, 
    goToDeleteRoutine, 
    goToCreateUser, 
    goToExercises,
    goToCreateNotification,
    goToPlans,
    goToRenew 
  } = useHome();  

  // Si está cargando, podemos mostrar un spinner o simplemente retornar null
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
         <p className="text-white animate-pulse">Cargando perfil...</p>
      </div>
    );
  }

  // Si terminó de cargar y user sigue siendo null (ej: token vencido o borrado), no renderizamos el dashboard
  if (!user) return null; 

  return (
    <PageLayout backgroundImage={fondoGym}>
      
      <h1 className="text-4xl font-bold text-white drop-shadow-lg mt-28">
        Hola, <span className={HomeStyles.userName}>{user.nombre}</span> 👋
      </h1>
      <p className="text-gray-100 mt-2 mb-8 text-lg drop-shadow-md">
        Bienvenido a tu panel de control.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        
        {/* VISTA PARA ALUMNOS */}
        {!isEntrenador && (
          <>
            {/* 1. MIS RUTINAS */}
            <Card onClick={goToMyRoutines} className="border-l-4 border-green-500 hover:shadow-xl transition cursor-pointer bg-green-600/70 backdrop-blur-md hover:scale-105">
              <h3 className="text-xl font-bold mb-2 text-white">💪 Mis Rutinas</h3>
              <p className="text-white text-sm">Ver las rutinas asignadas</p>
            </Card>

            {/* 2. MI PLAN */}
            <div 
              onClick={goToPlans}
              className={`${HomeStyles.actionCardStyle} bg-indigo-600/50 text-white hover:bg-indigo-600/90 border-l-4 border-indigo-400 backdrop-blur-md hover:scale-105`}
            >
              <h3 className="text-xl font-bold mb-2">💎 Mi Plan</h3>
              <p className="text-indigo-100 text-sm">Ver vencimientos y estado de mi cuenta.</p>
            </div>
          </>
        )}

        {/* VISTA PARA PROFES / ADMIN */}
        {isEntrenador && (
          <>
            <div 
               onClick={goToPlans}
               className={`${HomeStyles.actionCardStyle} bg-cyan-600/50 text-white hover:bg-cyan-600/90 border-l-4 border-cyan-400 backdrop-blur-md hover:scale-105`}
            >
               <h3 className="text-xl font-bold mb-2">💰 Planes y Pagos</h3>
               <p className="text-cyan-100 text-sm">Administrar precios y suscripciones.</p>
            </div>

            <div 
              onClick={goToCreateRoutine}
              className={`${HomeStyles.actionCardStyle} bg-green-600/50 text-white hover:bg-green-600/90 border-l-4 backdrop-blur-md hover:scale-105`}
            >
              <h3 className="text-xl font-bold mb-2">+ Crear Nueva Rutina</h3>
              <p className="text-green-100 text-sm">Asignar ejercicios a un alumno.</p>
            </div>

            <div 
              onClick={goToExercises}
              className={`${HomeStyles.actionCardStyle} bg-purple-600/50 text-white hover:bg-purple-600/90 border-l-4 backdrop-blur-md hover:scale-105`}
            >
              <h3 className="text-xl font-bold mb-2">🏋️ Catálogo Ejercicios</h3>
              <p className="text-purple-100 text-sm">Gestionar lista de ejercicios y videos.</p>
            </div>

            <div 
              onClick={goToCreateNotification}
              className={`${HomeStyles.actionCardStyle} bg-orange-600/50 text-white hover:bg-orange-600/90 border-l-4 backdrop-blur-md hover:scale-105`}
            >
              <h3 className="text-xl font-bold mb-2">📢 Notificación Masiva</h3>
              <p className="text-orange-100 text-sm">Enviar aviso a todos los alumnos.</p>
            </div>

            <div 
              onClick={goToCreateUser}
              className={`${HomeStyles.actionCardStyle} bg-blue-600/50 text-white hover:bg-blue-600/90 border-l-4 backdrop-blur-md hover:scale-105`}
            >
              <h3 className="text-xl font-bold mb-2">👤 Nuevo Usuario</h3>
              <p className="text-blue-100 text-sm">Registrar un nuevo Usuario.</p>
            </div>

            <div 
              onClick={goToDeleteRoutine}
              className={`${HomeStyles.actionCardStyle} bg-red-500/50 text-white hover:bg-red-500/90 border-l-4 backdrop-blur-md hover:scale-105`}
            >
              <h3 className="text-xl font-bold mb-2">🗑️ Borrar Rutina</h3>
              <p className="text-red-100 text-sm">Buscar un alumno y eliminar rutinas.</p>
            </div>

            <div 
              onClick={goToRenew}
              className={`${HomeStyles.actionCardStyle} bg-emerald-600/50 text-white hover:bg-emerald-600/90 border-l-4 border-emerald-400 cursor-pointer backdrop-blur-md shadow-lg transition-all hover:scale-105`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-1">🔄 Renovar Planes</h3>
                  <p className="text-emerald-100 text-sm">Gestionar vencimientos y pagos.</p>
                </div>
              {/* Icono opcional */}
              <span className="text-3xl opacity-50">💳</span>
              </div>
            </div>
          </>
        )}
      </div>
    </PageLayout>
  );
};