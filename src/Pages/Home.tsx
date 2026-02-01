import { useState } from "react";

// Hooks y Componentes
import { useHome } from "../Hooks/Home/useHome";
import { PageLayout } from "../Components/UI/PageLayout";
import { Card } from "../Components/UI/Card";
import { EntrenadorNavbar } from "../Components/EntrenadorNavbar"; 
import { HomeStyles } from "../Styles/HomeStyles"; 
import { WhatsAppModal } from "../Components/WhatsApp/WhatsAppModal";
import { WhatsAppStatus } from "../Components/WhatsApp/WhatsAppStatus"; 
import { StatsGrid } from "../Components/Dashboard/StatsGrid"; 
import { useDashboardMetrics } from "../Hooks/Home/useDashboardMetrics"; 

// IMÁGENES
import fondoGym from "../assets/GymFondo.jpg";
import fondoCreateRoutine from "../assets/Fondo-CreateRoutine.jpg";
import fondoCreateuser from "../assets/Fondo-CreateUser.jpg";
import fondoDeleteRoutine from "../assets/Fondo-DeleteRoutine.jpg";
import fondoMiPlan from "../assets/Fondo-MiPlan.jpg";
import fondoNotificaciones from "../assets/Fondo-Notificaciones.jpg";
import fondoPerfil from "../assets/Fondo-Perfil.jpg";
import fondoRenewPlan from "../assets/Fondo-RenewPlan.jpg";
import fondoEnviarPDF from "../assets/Fondo-CreateRoutine.jpg"; 

// Importación de páginas
import { PlansManager } from "../Pages/Planes/PlansManager";
import { CreateRoutine } from "../Pages/Rutinas/CreateRoutine";
import { EjerciciosGestion } from "../Pages/Ejercicios/EjerciciosGestion";
import { EjerciciosCrear } from "../Pages/Ejercicios/EjerciciosCrear";
import { CreateNotification } from "../Pages/Notificaciones/CreateNotification";
import { CreateUser } from "../Pages/Usuarios/CreateUser";
import { DeleteRoutine } from "../Pages/Rutinas/DeleteRoutine";
import { RenewPlan } from "../Pages/Planes/RenewPlan";
import { Profile } from "../Pages/Usuarios/Profile"; 
import { SendRoutinePDF } from "../Pages/Rutinas/SendRoutinePDF"; 
import { CreateGym } from "../Pages/Gym/CreateGym";
import { GymManagement } from "../Pages/Gym/GymManagement"; 
import { useLogout } from "../Hooks/Login/useLogout";

const BackgroundMap: Record<string, string> = {
  "Inicio": fondoGym,
  "Planes y Pagos": fondoMiPlan, 
  "Crear Rutina": fondoCreateRoutine,
  "Ejercicios": fondoCreateRoutine,
  "Crear Ejercicio": fondoCreateRoutine,
  "Notificaciones": fondoNotificaciones,
  "Usuarios": fondoCreateuser,
  "Borrar Rutina": fondoDeleteRoutine,
  "Enviar PDF": fondoEnviarPDF,
  "Renovar": fondoRenewPlan,
  "Perfil": fondoPerfil,
  "default": fondoGym,
  "Nuevo Gimnasio": fondoCreateRoutine,
  "Gestión Gimnasios": fondoCreateRoutine 
};

const Icons = {
  dashboard: "🏠",
  rutinas: "💪",
  planes: "💎",
  pagos: "💰",
  crearRutina: "📝",
  ejercicios: "🏋️",
  notificaciones: "📢",
  usuarios: "👥",
  borrar: "🗑️",
  enviarPDF: "📤", 
  renovar: "🔄",
  salir: "🚪",
  perfil: "👤",
  nuevoGym: "🏢",
  gestionGyms: "⚙️" 
};

export const Home = () => {
  
  const { 
    user, 
    isEntrenador, 
    isAdmin,
    isLoading,
    goToMyRoutines, 
    goToUserPlan,
  } = useHome();  

  const [activeTab, setActiveTab] = useState("Inicio");

  const { logout } = useLogout();
  
  const { metrics, loading: loadingMetrics } = useDashboardMetrics();
  

  const AdminDashboardWelcome = () => (
    <div className="animate-fade-in-up space-y-6">
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <h2 className="text-3xl font-bold text-white relative z-10">
          Hola, <span className="text-green-400">{user?.nombre}</span> 👋
        </h2>
        <p className="text-gray-400 mt-2 relative z-10 max-w-lg">
          Aquí tienes un resumen de la actividad del gimnasio hoy.
        </p>
        <p className="text-gray-400 mt-2 relative z-10 max-w-lg">
          Todo parece estar en orden. 😎 
        </p>
      </div>

      {/* MÉTRICAS*/}
      {loadingMetrics ? (
          <div className="grid grid-cols-4 gap-6 mt-8">
              {[1,2,3,4].map(i => (
                  <div key={i} className="h-32 bg-gray-800/50 rounded-2xl animate-pulse"></div>
              ))}
          </div>
      ) : metrics ? (
          <StatsGrid metrics={metrics} />
      ) : null}

    </div>
  );

  const renderAdminContent = () => {
    switch (activeTab) {
      case "Inicio": return <AdminDashboardWelcome/>;
      case "Planes y Pagos": return <PlansManager />;
      case "Crear Rutina": return <CreateRoutine />;
      case "Ejercicios": return <EjerciciosGestion onNavigate={setActiveTab} />;
      case "Crear Ejercicio": return <EjerciciosCrear onNavigate={setActiveTab} />;
      case "Notificaciones": return <CreateNotification />;
      case "Usuarios": return <CreateUser />;
      case "Borrar Rutina": return <DeleteRoutine />;
      case "Enviar PDF": return <SendRoutinePDF />; 
      case "Renovar": return <RenewPlan />;
      case "Perfil": return <Profile />;
      case "Nuevo Gimnasio": return <CreateGym />;
      case "Gestión Gimnasios": return <GymManagement />; 
      default: return <AdminDashboardWelcome />;
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-900"><p className="text-white animate-pulse">Cargando...</p></div>;
  if (!user) return null; 

  if (isEntrenador) {
    const currentBg = BackgroundMap[activeTab] || BackgroundMap["default"];

    return (
      <div className="flex h-screen bg-gray-900 overflow-hidden font-sans">
        
        <WhatsAppModal />

        <aside className="w-64 bg-[#24192f99] border-r border-white/5 flex flex-col justify-between md:flex shrink-0 transition-all duration-300">
          
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="h-20 flex items-center px-8 border-b border-white/5 cursor-pointer shrink-0" onClick={() => setActiveTab("Inicio")}>
               <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
                 GYMMate
               </span>
            </div>

            <nav className={`p-4 space-y-2 mt-4 overflow-y-auto ${HomeStyles.customScrollbar}`}>
              <p className="px-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">General</p>
              <SidebarItem icon={Icons.dashboard} label="Inicio" active={activeTab === "Inicio"} onClick={() => setActiveTab("Inicio")} />
              <SidebarItem icon={Icons.planes} label="Planes y Pagos" active={activeTab === "Planes y Pagos"} onClick={() => setActiveTab("Planes y Pagos")} />
              <SidebarItem icon={Icons.perfil} label="Mi Perfil" active={activeTab === "Perfil"} onClick={() => setActiveTab("Perfil")} />

              <p className="px-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 mt-6">Gestión</p>
              <SidebarItem icon={Icons.usuarios} label="Usuarios" active={activeTab === "Usuarios"} onClick={() => setActiveTab("Usuarios")} />
              <SidebarItem icon={Icons.crearRutina} label="Crear Rutina" active={activeTab === "Crear Rutina"} onClick={() => setActiveTab("Crear Rutina")} />
              <SidebarItem icon={Icons.ejercicios} label="Ejercicios" active={activeTab === "Ejercicios" || activeTab === "Crear Ejercicio"} onClick={() => setActiveTab("Ejercicios")} />
              <SidebarItem icon={Icons.renovar} label="Renovar" active={activeTab === "Renovar"} onClick={() => setActiveTab("Renovar")} />
              <SidebarItem icon={Icons.borrar} label="Borrar Rutina" active={activeTab === "Borrar Rutina"} onClick={() => setActiveTab("Borrar Rutina")} />
              
              <p className="px-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 mt-6">Comunicación</p>
              <SidebarItem icon={Icons.notificaciones} label="Notificaciones" active={activeTab === "Notificaciones"} onClick={() => setActiveTab("Notificaciones")} />
              <SidebarItem icon={Icons.enviarPDF} label="Enviar Rutina PDF" active={activeTab === "Enviar PDF"} onClick={() => setActiveTab("Enviar PDF")} />

                {/* SOLO VISIBLE PARA ADMIN */}
                {isAdmin && (
                  <>
                    <p className="px-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 mt-6">Administración</p>
                    <SidebarItem 
                        icon={Icons.nuevoGym} 
                        label="Nuevo Gimnasio" 
                        active={activeTab === "Nuevo Gimnasio"} 
                        onClick={() => setActiveTab("Nuevo Gimnasio")} 
                    />
                    <SidebarItem 
                        icon={Icons.gestionGyms} 
                        label="Gestión Gimnasios" 
                        active={activeTab === "Gestión Gimnasios"} 
                        onClick={() => setActiveTab("Gestión Gimnasios")} 
                    />
                  </>
                )}
            </nav>
          </div>

          <div className="shrink-0 bg-[#1a1225]">
             <WhatsAppStatus />
             <div className="p-4">
                 <button onClick={logout} className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all font-medium text-sm">
                   <span>{Icons.salir}</span>
                   Cerrar Sesión
                 </button>
             </div>
          </div>

        </aside>

        <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
          <div 
            className="absolute inset-0 z-0 opacity-40 pointer-events-none transition-all duration-700 ease-in-out"
            style={{ 
                backgroundImage: `url(${currentBg})`, 
                backgroundSize: 'cover', 
                backgroundPosition: 'center'
            }} 
          />
          <EntrenadorNavbar title={activeTab} user={user} />
          <div className={`flex-1 p-8 relative z-10 ${HomeStyles.customScrollbar}`}>
             {renderAdminContent()}
          </div>
        </main>
      </div>
    );
  }

  // VISTA ALUMNO (Sin cambios)
  return (
    <PageLayout backgroundImage={fondoGym}>
      <h1 className="text-4xl font-bold text-white drop-shadow-lg mt-28">
        Hola, <span className={HomeStyles.userName}>{user.nombre}</span> 👋
      </h1>
      <p className="text-gray-100 mt-2 mb-8 text-lg drop-shadow-md">
        Bienvenido a tu panel de control.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <Card onClick={goToMyRoutines} className="border-l-4 border-green-500 hover:shadow-xl transition cursor-pointer bg-green-600/70 backdrop-blur-md hover:scale-105">
            <h3 className="text-xl font-bold mb-2 text-white">💪 Mis Rutinas</h3>
            <p className="text-white text-sm">Ver las rutinas asignadas</p>
          </Card>

          <div onClick={goToUserPlan} className={`${HomeStyles.actionCardStyle} bg-indigo-600/50 text-white hover:bg-indigo-600/90 border-l-4 border-indigo-400 backdrop-blur-md hover:scale-105`}>
            <h3 className="text-xl font-bold mb-2">💎 Mi Plan</h3>
            <p className="text-indigo-100 text-sm">Ver vencimientos y estado de mi cuenta.</p>
          </div>
      </div>
    </PageLayout>
  );
};

const SidebarItem = ({ icon, label, active, onClick }: { icon: string, label: string, active: boolean, onClick: () => void }) => {
  return (
    <div onClick={onClick} className={`flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 group ${active ? 'bg-green-500/10 text-green-400 border-r-2 border-green-500' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
      <span className={`text-xl group-hover:scale-110 transition-transform ${active ? 'scale-110' : ''}`}>{icon}</span>
      <span className="font-medium text-sm">{label}</span>
    </div>
  )
}