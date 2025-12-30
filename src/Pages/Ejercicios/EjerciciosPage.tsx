import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../../Components/UI/PageLayout';
import fondoGym from '../../assets/GymFondo.jpg'; 

export const EjerciciosPage = () => {
  const navigate = useNavigate();

  const cardStyle = "p-8 rounded-xl shadow-lg transition cursor-pointer transform hover:-translate-y-2 hover:shadow-2xl border border-white/30 backdrop-blur-md flex flex-col justify-center items-center text-center h-64";

  return (
    <PageLayout backgroundImage={fondoGym}>
        <div className="pt-24 container mx-auto px-4">
            <h1 className="text-4xl font-bold text-white drop-shadow-lg mb-2 text-center">
                Panel de Ejercicios 🏋️‍♂️
            </h1>
            <p className="text-gray-200 text-center mb-12 text-lg drop-shadow-md">
                Selecciona una operación para realizar
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                
                {/* 1. CREAR (Create) */}
                <div 
                    onClick={() => navigate('/ejercicios/crear')}
                    className={`${cardStyle} bg-green-600/60 hover:bg-green-600/80 text-white`}
                >
                    <div className="text-6xl mb-4">➕</div>
                    <h3 className="text-2xl font-bold mb-2">Crear Nuevo</h3>
                    <p className="text-green-100">Agregar un ejercicio nuevo a la base de datos.</p>
                </div>

                {/* 2. GESTIONAR (Read, Update, Delete) */}
                <div 
                    onClick={() => navigate('/ejercicios/gestion')}
                    className={`${cardStyle} bg-blue-600/60 hover:bg-blue-600/80 text-white`}
                >
                    <div className="text-6xl mb-4">📋</div>
                    <h3 className="text-2xl font-bold mb-2">Gestionar Catálogo</h3>
                    <p className="text-blue-100">Ver lista, modificar datos o eliminar ejercicios existentes.</p>
                </div>

            </div>
            
        </div>
    </PageLayout>
  );
};