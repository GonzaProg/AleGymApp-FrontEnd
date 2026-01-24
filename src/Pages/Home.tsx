import { useState } from "react";
import { useNavigate } from "react-router-dom"; 

// Hooks y Componentes
import { useHome } from "../Hooks/Home/useHome";
import { PageLayout } from "../Components/UI/PageLayout";
import { Card } from "../Components/UI/Card";
import { EntrenadorNavbar } from "../Components/EntrenadorNavbar"; 
import { HomeStyles } from "../Styles/HomeStyles"; 
import { WhatsAppModal } from "../Components/WhatsApp/WhatsAppModal";

// IMÁGENES DE FONDO
import fondoGym from "../assets/GymFondo.jpg";
import fondoCreateRoutine from "../assets/Fondo-CreateRoutine.jpg";
import fondoCreateuser from "../assets/Fondo-CreateUser.jpg";
import fondoDeleteRoutine from "../assets/Fondo-DeleteRoutine.jpg";
import fondoMiPlan from "../assets/Fondo-MiPlan.jpg";
import fondoNotificaciones from "../assets/Fondo-Notificaciones.jpg";
import fondoPerfil from "../assets/Fondo-Perfil.jpg";
import fondoRenewPlan from "../assets/Fondo-RenewPlan.jpg";

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

// MAPA DE FONDOS DINÁMICOS SEGÚN LA TAB ACTIVA
const BackgroundMap: Record<string, string> = {
  "Inicio": fondoGym,
  "Planes y Pagos": fondoMiPlan, 
  "Crear Rutina": fondoCreateRoutine,
  "Ejercicios": fondoCreateRoutine,
  "Crear Ejercicio": fondoCreateRoutine,
  "Notificaciones": fondoNotificaciones,
  "Usuarios": fondoCreateuser,
  "Borrar Rutina": fondoDeleteRoutine,
  "Renovar": fondoRenewPlan,
  "Perfil": fondoPerfil,
  "default": fondoGym
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
  renovar: "🔄",
  salir: "🚪",
  perfil: "👤"
};

export const Home = () => {
  const navigate = useNavigate();
  
  const { 
    user, 
    isEntrenador, 
    isLoading,
    goToMyRoutines, 
    goToUserPlan,
  } = useHome();  

  // ESTADO PARA EL DASHBOARD ADMIN 
  const [activeTab, setActiveTab] = useState("Inicio");

  // LOGICA CERRAR SESIÓN (Sidebar) 
  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault(); 
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
    //api.post("/auth/logout").catch(err => console.error("Error logout:", err)); Para actualizar ultimaConexion del usuario
  };

  // INICIO 
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
          Todo parece estar bajo control.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800/60 backdrop-blur-md p-6 rounded-2xl border border-white/5 hover:border-green-500/30 transition-all group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm">Alumnos Activos</p>
              <h3 className="text-3xl font-bold text-white mt-1 group-hover:text-green-400 transition-colors">124</h3>
            </div>
            <span className="text-2xl bg-gray-700/50 p-3 rounded-xl">👥</span>
          </div>
        </div>
      </div>
    </div>
  );

  // RENDERIZADO DEL CONTENIDO DERECHO 
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
      case "Renovar": return <RenewPlan />;
      case "Perfil": return <Profile />;
      default: return <AdminDashboardWelcome />;
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-900"><p className="text-white animate-pulse">Cargando...</p></div>;
  if (!user) return null; 

  //  VISTA ADMIN / ENTRENADOR (DISEÑO SIDEBAR)
  if (isEntrenador) {
    // Seleccionamos la imagen de fondo según la tab activa
    const currentBg = BackgroundMap[activeTab] || BackgroundMap["default"];

    return (
      <div className="flex h-screen bg-gray-900 overflow-hidden font-sans">
        
        {/* MODAL WHATSAPP */}
        <WhatsAppModal />

        {/* 1. SIDEBAR IZQUIERDO */}
        <aside className="w-64 bg-[#24192f99] border-r border-white/5 flex flex-col justify-between md:flex shrink-0 transition-all duration-300">
          <div>
            <div className="h-20 flex items-center px-8 border-b border-white/5 cursor-pointer" onClick={() => setActiveTab("Inicio")}>
               <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
                 GYMMate
               </span>
            </div>

            <nav className={`p-4 space-y-2 mt-4 max-h-[calc(100vh-200px)] ${HomeStyles.customScrollbar}`}>
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
            </nav>
          </div>

          <div className="p-4 border-t border-white/5">
             <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all font-medium text-sm">
                <span>{Icons.salir}</span>
                Cerrar Sesión
             </button>
          </div>
        </aside>

        {/* 2. ÁREA PRINCIPAL DERECHA */}
        <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
          
          {/* FONDO DINÁMICO CON TRANSICIÓN SUAVE */}
          <div 
            className="absolute inset-0 z-0 opacity-40 pointer-events-none transition-all duration-700 ease-in-out"
            style={{ 
                backgroundImage: `url(${currentBg})`, 
                backgroundSize: 'cover', 
                backgroundPosition: 'center'
            }} 
          />
          
          {/* NAVBAR SUPERIOR */}
          <EntrenadorNavbar title={activeTab} user={user} />

          {/* CONTENIDO SCROLLABLE */}
          <div className={`flex-1 p-8 relative z-10 ${HomeStyles.customScrollbar}`}>
             {renderAdminContent()}
          </div>

        </main>
      </div>
    );
  }

  //  VISTA ALUMNO
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

// COMPONENTE AUXILIAR SIDEBAR
const SidebarItem = ({ icon, label, active, onClick }: { icon: string, label: string, active: boolean, onClick: () => void }) => {
  return (
    <div onClick={onClick} className={`flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 group ${active ? 'bg-green-500/10 text-green-400 border-r-2 border-green-500' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
      <span className={`text-xl group-hover:scale-110 transition-transform ${active ? 'scale-110' : ''}`}>{icon}</span>
      <span className="font-medium text-sm">{label}</span>
    </div>
  )
}