import { useHome } from "../Hooks/Home/useHome";
import { PageLayout } from "../Components/UI/PageLayout";
import { Card } from "../Components/UI/Card";
import fondoGym from "../assets/GymFondo.jpg"; 

export const Home = () => {
  // Agregamos goToExercises al destructuring
  const { user, isEntrenador, goToMyRoutines, goToCreateRoutine, goToDeleteRoutine, goToCreateUser, goToExercises } = useHome();

  // ESTILO MÁS TRANSPARENTE Y BORROSO
  const actionCardStyle = "p-6 rounded-lg shadow-lg transition cursor-pointer hover:shadow-2xl transform hover:-translate-y-1 backdrop-blur-md border border-white/30";

  return (
    <PageLayout backgroundImage={fondoGym}>
      
      <h1 style={{marginTop:"90px"}} className="text-4xl font-bold text-white drop-shadow-lg">
        Hola, {user.nombre} 👋
      </h1>
      <p className="text-gray-100 mt-2 mb-8 text-lg drop-shadow-md">
        Bienvenido a tu panel de control.
      </p>

      {/* Ajustamos el grid para que soporte más columnas si hay espacio en pantallas grandes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        
        {!isEntrenador && (
          <Card onClick={goToMyRoutines} className="border-l-4 border-green-500 hover:shadow-xl transition cursor-pointer bg-white/70 backdrop-blur-sm">
            <h3 className="text-xl font-bold mb-2 text-gray-800">Mis Rutinas</h3>
            <p className="text-gray-600 text-sm">Ver las rutinas asignadas</p>
          </Card>
        )}

        {/* Tarjetas de Acción (Entrenador) */}
        {isEntrenador && (
          <>
            <div 
              onClick={goToCreateRoutine}
              className={`${actionCardStyle} bg-green-600/50 text-white hover:bg-green-600/90`}
            >
              <h3 className="text-xl font-bold mb-2">+ Crear Nueva Rutina</h3>
              <p className="text-green-100 text-sm">Asignar ejercicios a un alumno.</p>
            </div>

            {/* --- NUEVA TARJETA: EJERCICIOS (Color Púrpura) --- */}
            <div 
              onClick={goToExercises}
              className={`${actionCardStyle} bg-purple-600/50 text-white hover:bg-purple-600/90`}
            >
              <h3 className="text-xl font-bold mb-2">🏋️ Catálogo Ejercicios</h3>
              <p className="text-purple-100 text-sm">Gestionar lista de ejercicios y videos.</p>
            </div>

            <div 
              onClick={goToDeleteRoutine}
              className={`${actionCardStyle} bg-red-500/50 text-white hover:bg-red-500/90`}
            >
              <h3 className="text-xl font-bold mb-2">🗑️ Borrar Rutina</h3>
              <p className="text-red-100 text-sm">Buscar un alumno y eliminar rutinas.</p>
            </div>

            <div 
              onClick={goToCreateUser}
              className={`${actionCardStyle} bg-blue-600/50 text-white hover:bg-blue-600/90`}
            >
              <h3 className="text-xl font-bold mb-2">👤 Nuevo Usuario</h3>
              <p className="text-blue-100 text-sm">Registrar un nuevo Usuario.</p>
            </div>
          </>
        )}
      </div>
    </PageLayout>
  );
};