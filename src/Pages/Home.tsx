import { useHome } from "../Hooks/Home/useHome";
import { PageLayout } from "../Components/UI/PageLayout";
import { Card } from "../Components/UI/Card";
import fondoGym from "../assets/GymFondo.jpg"; 
import { HomeStyles } from "../Styles/HomeStyles";

export const Home = () => {
  const { 
    user, 
    isEntrenador, 
    goToMyRoutines, 
    goToCreateRoutine, 
    goToDeleteRoutine, 
    goToCreateUser, 
    goToExercises,
    goToCreateNotification,
    goToPlans 
  } = useHome();  

  return (
    <PageLayout backgroundImage={fondoGym}>
      
      <h1 style={{marginTop:"90px"}} className="text-4xl font-bold text-white drop-shadow-lg">
        Hola, {user.nombre} 👋
      </h1>
      <p className="text-gray-100 mt-2 mb-8 text-lg drop-shadow-md">
        Bienvenido a tu panel de control.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        
        {/* VISTA PARA ALUMNOS */}
        {!isEntrenador && (
          <>
            {/* 1. MIS RUTINAS */}
            <Card onClick={goToMyRoutines} className="border-l-4 border-green-500 hover:shadow-xl transition cursor-pointer bg-white/70 backdrop-blur-sm">
              <h3 className="text-xl font-bold mb-2 text-gray-800">💪 Mis Rutinas</h3>
              <p className="text-gray-600 text-sm">Ver las rutinas asignadas</p>
            </Card>

            {/* 2. MI PLAN (Solo Alumnos) */}
            <div 
              onClick={goToPlans}
              className={`${HomeStyles.actionCardStyle} bg-indigo-600/50 text-white hover:bg-indigo-600/90 border-l-4 border-indigo-400`}
            >
              <h3 className="text-xl font-bold mb-2">💎 Mi Plan</h3>
              <p className="text-indigo-100 text-sm">Ver vencimientos y estado de mi cuenta.</p>
            </div>
          </>
        )}

        {/* VISTA PARA PROFES / ADMIN */}
        {isEntrenador && (
          <>
            {/* 1. GESTIÓN DE PLANES Y PAGOS (Solo Admin/Profe) */}
            <div 
               onClick={goToPlans}
               className={`${HomeStyles.actionCardStyle} bg-cyan-600/50 text-white hover:bg-cyan-600/90 border-l-4 border-cyan-400`}
            >
               <h3 className="text-xl font-bold mb-2">💰 Planes y Pagos</h3>
               <p className="text-cyan-100 text-sm">Administrar precios y suscripciones.</p>
            </div>

            {/* 2. CREAR RUTINA */}
            <div 
              onClick={goToCreateRoutine}
              className={`${HomeStyles.actionCardStyle} bg-green-600/50 text-white hover:bg-green-600/90`}
            >
              <h3 className="text-xl font-bold mb-2">+ Crear Nueva Rutina</h3>
              <p className="text-green-100 text-sm">Asignar ejercicios a un alumno.</p>
            </div>

            {/* 3. CATÁLOGO EJERCICIOS */}
            <div 
              onClick={goToExercises}
              className={`${HomeStyles.actionCardStyle} bg-purple-600/50 text-white hover:bg-purple-600/90`}
            >
              <h3 className="text-xl font-bold mb-2">🏋️ Catálogo Ejercicios</h3>
              <p className="text-purple-100 text-sm">Gestionar lista de ejercicios y videos.</p>
            </div>

            {/* 4. NUEVA NOTIFICACIÓN */}
            <div 
              onClick={goToCreateNotification}
              className={`${HomeStyles.actionCardStyle} bg-orange-600/50 text-white hover:bg-orange-600/90`}
            >
              <h3 className="text-xl font-bold mb-2">📢 Notificación Masiva</h3>
              <p className="text-orange-100 text-sm">Enviar aviso a todos los alumnos.</p>
            </div>

            {/* 5. NUEVO USUARIO */}
            <div 
              onClick={goToCreateUser}
              className={`${HomeStyles.actionCardStyle} bg-blue-600/50 text-white hover:bg-blue-600/90`}
            >
              <h3 className="text-xl font-bold mb-2">👤 Nuevo Usuario</h3>
              <p className="text-blue-100 text-sm">Registrar un nuevo Usuario.</p>
            </div>

            {/* 6. BORRAR RUTINA */}
            <div 
              onClick={goToDeleteRoutine}
              className={`${HomeStyles.actionCardStyle} bg-red-500/50 text-white hover:bg-red-500/90`}
            >
              <h3 className="text-xl font-bold mb-2">🗑️ Borrar Rutina</h3>
              <p className="text-red-100 text-sm">Buscar un alumno y eliminar rutinas.</p>
            </div>

          </>
        )}
      </div>
    </PageLayout>
  );
};