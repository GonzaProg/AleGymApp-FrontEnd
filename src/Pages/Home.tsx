import { useHome } from "../Hooks/Home/useHome";
import { PageLayout } from "../Components/UI/PageLayout";
import { Card } from "../Components/UI/Card";

export const Home = () => {
  const { user, isEntrenador, goToMyRoutines, goToCreateRoutine, goToDeleteRoutine, goToCreateUser } = useHome();

  // Estilo base para las tarjetas de acción (Botones gigantes de colores)
  const actionCardStyle = "p-6 rounded-lg shadow-md transition cursor-pointer hover:shadow-lg transform hover:-translate-y-1";

  return (
    <PageLayout>
      <h1 className="text-3xl font-bold text-gray-800">Hola, {user.nombre} 👋</h1>
      <p className="text-gray-600 mt-2 mb-8">Bienvenido a tu panel de control.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* === CAMBIO AQUÍ: Ocultar si es Entrenador === */}
        {/* Solo mostramos "Mis Rutinas" si NO es entrenador (es decir, es Alumno) */}
        {!isEntrenador && (
          <Card onClick={goToMyRoutines} className="border-l-4 border-green-500 hover:shadow-xl transition cursor-pointer">
            <h3 className="text-xl font-bold mb-2">Mis Rutinas</h3>
            <p className="text-gray-500 text-sm">Ver las rutinas asignadas</p>
          </Card>
        )}

        {/* Tarjetas de Acción (Solo visibles para Entrenadores y Admins) */}
        {isEntrenador && (
          <>
            <div 
              onClick={goToCreateRoutine}
              className={`${actionCardStyle} bg-green-600 text-white hover:bg-green-700`}
            >
              <h3 className="text-xl font-bold mb-2">+ Crear Nueva Rutina</h3>
              <p className="text-green-100 text-sm">Asignar ejercicios a un alumno.</p>
            </div>

            <div 
              onClick={goToDeleteRoutine}
              className={`${actionCardStyle} bg-red-500 text-white hover:bg-red-600`}
            >
              <h3 className="text-xl font-bold mb-2">🗑️ Borrar Rutina</h3>
              <p className="text-red-100 text-sm">Buscar un alumno y eliminar rutinas.</p>
            </div>

            <div 
              onClick={goToCreateUser}
              className={`${actionCardStyle} bg-blue-600 text-white hover:bg-blue-700`}
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