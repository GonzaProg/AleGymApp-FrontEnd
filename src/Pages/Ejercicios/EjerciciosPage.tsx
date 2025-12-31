import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../../Components/UI/PageLayout'; // O el layout que uses
import fondoGym from '../../assets/GymFondo.jpg'; 
import { AppStyles } from '../../Styles/AppStyles';
import { EjerciciosPageStyles } from '../../Styles/EjerciciosPageStyles';

export const EjerciciosPage = () => {
  const navigate = useNavigate();

  return (
    // Usamos AppStyles.pageContainer si quitaras el PageLayout, 
    // pero como usas PageLayout, aplicamos estilos internos.
    <PageLayout backgroundImage={fondoGym}>
        <div className="pt-24 container mx-auto px-4">
            <h1 className={AppStyles.title}>
                Panel de Ejercicios 🏋️‍♂️
            </h1>
            <p className="text-gray-200 text-center mb-12 text-lg drop-shadow-md">
                Selecciona una operación para realizar
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                
                {/* 1. CREAR (Create) */}
                <div 
                    onClick={() => navigate('/ejercicios/crear')}
                    className={`${EjerciciosPageStyles.menuCard} bg-green-600/60 hover:bg-green-600/80 text-white`}
                >
                    <div className={EjerciciosPageStyles.icon}>➕</div>
                    <h3 className={EjerciciosPageStyles.cardTitle}>Crear Nuevo</h3>
                    <p className="text-green-100">Agregar un ejercicio nuevo a la base de datos.</p>
                </div>

                {/* 2. GESTIONAR (Read, Update, Delete) */}
                <div 
                    onClick={() => navigate('/ejercicios/gestion')}
                    className={`${EjerciciosPageStyles.menuCard} bg-blue-600/60 hover:bg-blue-600/80 text-white`}
                >
                    <div className={EjerciciosPageStyles.icon}>📋</div>
                    <h3 className={EjerciciosPageStyles.cardTitle}>Gestionar Catálogo</h3>
                    <p className="text-blue-100">Ver lista, modificar datos o eliminar ejercicios existentes.</p>
                </div>

            </div>
        </div>
    </PageLayout>
  );
};