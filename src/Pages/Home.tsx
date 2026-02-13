import { useState, useRef } from "react";

// Swiper Imports
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
// @ts-ignore
import "swiper/css";
// @ts-ignore
import "swiper/css/pagination";

// Hooks y Componentes
import { useOptimizedHome } from "../Hooks/Home/useOptimizedHome";
import { MobileNavbar } from "../Components/Mobile/MobileNavbar"; 
import { WhatsAppModal } from "../Components/WhatsApp/WhatsAppModal";
import { WhatsAppStatus } from "../Components/WhatsApp/WhatsAppStatus"; 
import { StatsGrid } from "../Components/Dashboard/StatsGrid";
import { HomeStyles } from "../Styles/HomeStyles";
import { BackgroundLayout } from "../Components/BackgroundLayout"; 
import { Navbar } from "../Components/Navbar";

// Importación de Vistas de Alumno
import { MyRoutines } from "./Rutinas/MyRoutines";
import { UserPlan } from "./Planes/UserPlan";
import { UserProfile } from "./Usuarios/UserProfile"; 

// Importación de páginas Admin
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
import { HistorialPagos } from "../Pages/Pagos/HistorialPagos"; 
import { Preferences } from "../Pages/Config/Preferences"; 
import { ManualReceipt } from "../Pages/Planes/ReciboManual";
import { GeneralRoutinesManager } from "../Pages/Rutinas/GeneralRoutinesManager";

// IMÁGENES (Eliminadas - reemplazadas por BackgroundLayout)
// Todas las imágenes de fondo han sido reemplazadas por el efecto Neon Aurora 

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
  preferencias: "⚙️", 
  nuevoGym: "🏢",
  gestionGyms: "⚙️",
  reciboManual: "🧾",
  crearRutinaGeneral: "📚",
};

export const Home = () => {
  const { 
    currentUser, 
    isEntrenador, 
    isAdmin,
    isLoading,
    metrics,
    logout,
  } = useOptimizedHome();  

  // ESTADOS ADMIN
  const [activeTab, setActiveTab] = useState("Inicio");
  const [routineIdToEdit, setRoutineIdToEdit] = useState<number | null>(null);

  // ESTADOS ALUMNO (Swiper)
  const [activeSlide, setActiveSlide] = useState(0); 
  const swiperRef = useRef<any>(null);

  // --- HANDLERS ADMIN ---
  const handleEditRoutine = (id: number) => {
      setRoutineIdToEdit(id);
      setActiveTab("Crear Rutina General");
  };

  const handleSidebarClick = (tabName: string) => {
      setRoutineIdToEdit(null);
      setActiveTab(tabName);
  };

  // --- HANDLERS ALUMNO ---
  const handleSlideChange = (swiper: any) => {
    setActiveSlide(swiper.activeIndex);
  };

  const handleMenuClick = (index: number) => {
    setActiveSlide(index);
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.slideTo(index);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-900"><p className="text-white animate-pulse">Cargando...</p></div>;
  if (!currentUser) return null; 

  // =================================================================
  // VISTA ENTRENADOR / ADMIN (DASHBOARD ESCRITORIO)
  // =================================================================
  if (isEntrenador || isAdmin) {
    const AdminDashboardWelcome = () => (
        <div className="animate-fade-in-up space-y-6 mt-20">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <h2 className="text-3xl font-bold text-white relative z-10">
              Hola, <span className="text-green-400">{currentUser?.nombre}</span> 👋
            </h2>
            <p className="text-gray-400 mt-2 relative z-10 max-w-lg">
              Aquí tienes un resumen de la actividad del gimnasio.
            </p>
            <p className="text-gray-400 mt-2 relative z-10 max-w-lg">
              Todo parece estar en orden 😎
            </p>

          </div>
          {metrics && <StatsGrid metrics={metrics} userRole={currentUser?.rol || ''} />}
        </div>
    );

    const renderAdminContent = () => {
        switch (activeTab) {
          case "Inicio": return <AdminDashboardWelcome/>;
          case "Planes": return <PlansManager />;
          case "Historial Pagos": return <HistorialPagos />; 
          case "Crear Rutina": return <CreateRoutine isGeneral={false} />;
          case "Rutinas Generales": return <GeneralRoutinesManager onNavigate={handleSidebarClick} onEdit={handleEditRoutine}/>;
          case "Crear Rutina General": return <CreateRoutine isGeneral={true} routineIdToEdit={routineIdToEdit} />;
          case "Ejercicios": return <EjerciciosGestion onNavigate={setActiveTab} />;
          case "Crear Ejercicio": return <EjerciciosCrear onNavigate={setActiveTab} />;
          case "Notificaciones": return <CreateNotification />;
          case "Usuarios": return <CreateUser />;
          case "Borrar Rutina": return <DeleteRoutine />;
          case "Enviar PDF": return <SendRoutinePDF />; 
          case "Renovar": return <RenewPlan />;
          case "Perfil": return <Profile />;
          case "Preferencias": return <Preferences />; 
          case "Nuevo Gimnasio": return <CreateGym />;
          case "Gestión Gimnasios": return <GymManagement />; 
          case "Enviar Recibo Manualmente": return <ManualReceipt />;
          default: return <AdminDashboardWelcome />;
        }
    };

    return (
      <BackgroundLayout>
        <div className="flex h-screen overflow-hidden font-sans">
          <WhatsAppModal />
          <aside className="w-64 bg-[#24192f99] border-r border-white/5 flex flex-col justify-between md:flex shrink-0 transition-all duration-300">
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="h-20 flex items-center px-8 border-b border-white/5 cursor-pointer shrink-0" onClick={() => handleSidebarClick("Inicio")}>
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">GYMMate</span>
              </div>
              <nav className={`p-4 space-y-2 mt-4 overflow-y-auto ${HomeStyles.customScrollbar}`}>
                <SidebarItem icon={Icons.dashboard} label="Inicio" active={activeTab === "Inicio"} onClick={() => handleSidebarClick("Inicio")} />
                <p className="px-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Planes</p>
                <SidebarItem icon={Icons.planes} label="Planes" active={activeTab === "Planes"} onClick={() => handleSidebarClick("Planes")} />
                <SidebarItem icon={Icons.renovar} label="Renovar" active={activeTab === "Renovar"} onClick={() => handleSidebarClick("Renovar")} />
                <SidebarItem icon={Icons.pagos} label="Finanzas" active={activeTab === "Historial Pagos"} onClick={() => handleSidebarClick("Historial Pagos")} />
                <p className="px-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 mt-4">Rutinas</p>
                <SidebarItem icon={Icons.crearRutina} label="Rutina Personalizada" active={activeTab === "Crear Rutina"} onClick={() => handleSidebarClick("Crear Rutina")} />
                <SidebarItem icon={Icons.crearRutinaGeneral} label="Rutinas Generales" active={activeTab === "Rutinas Generales"} onClick={() => handleSidebarClick("Rutinas Generales")} />
                <SidebarItem icon={Icons.borrar} label="Borrar Rutina Personalizada" active={activeTab === "Borrar Rutina"} onClick={() => handleSidebarClick("Borrar Rutina")} />
                <p className="px-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 mt-6">Comunicación</p>
                <SidebarItem icon={Icons.notificaciones} label="Notificaciones" active={activeTab === "Notificaciones"} onClick={() => handleSidebarClick("Notificaciones")} />
                <SidebarItem icon={Icons.enviarPDF} label="Enviar Rutina PDF" active={activeTab === "Enviar PDF"} onClick={() => handleSidebarClick("Enviar PDF")} />
                <SidebarItem icon={Icons.reciboManual} label="Enviar Recibo Manualmente" active={activeTab === "Enviar Recibo Manualmente"} onClick={() => handleSidebarClick("Enviar Recibo Manualmente")} />
                <SidebarItem icon={Icons.usuarios} label="Nuevo Usuario" active={activeTab === "Usuarios"} onClick={() => handleSidebarClick("Usuarios")} />
                <p className="px-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 mt-6">Sistema</p>
                <SidebarItem icon={Icons.preferencias} label="Preferencias" active={activeTab === "Preferencias"} onClick={() => handleSidebarClick("Preferencias")} />
                <SidebarItem icon={Icons.perfil} label="Mi Perfil" active={activeTab === "Perfil"} onClick={() => handleSidebarClick("Perfil")} />
                {isAdmin && (
                  <>
                    <p className="px-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 mt-6">Administración</p>
                    <SidebarItem icon={Icons.nuevoGym} label="Nuevo Gimnasio" active={activeTab === "Nuevo Gimnasio"} onClick={() => handleSidebarClick("Nuevo Gimnasio")} />
                    <SidebarItem icon={Icons.gestionGyms} label="Gestión Gimnasios" active={activeTab === "Gestión Gimnasios"} onClick={() => handleSidebarClick("Gestión Gimnasios")} />
                    <SidebarItem icon={Icons.ejercicios} label="Ejercicios" active={activeTab === "Ejercicios" || activeTab === "Crear Ejercicio"} onClick={() => handleSidebarClick("Ejercicios")} />
                  </>
                )}
              </nav>
            </div>
            <div className="shrink-0 bg-[#1a1225]">
              <WhatsAppStatus />
              <div className="p-4">
                <button onClick={logout} className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all font-medium text-sm">
                  <span>{Icons.salir}</span> Cerrar Sesión
                </button>
              </div>
            </div>
          </aside>
          <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
            <div className={`flex-1 p-8 relative z-10 ${HomeStyles.customScrollbar}`}>
              {renderAdminContent()}
            </div>
          </main>
        </div>
      </BackgroundLayout>
    );
  }

  // =================================================================
  // VISTA ALUMNOS (MOBILE SWIPE INTERFACE)
  // =================================================================
  return (
    <BackgroundLayout>
      
      <div className="absolute top-0 left-0 w-full z-50">
        <Navbar />
      </div>
      
      <div className="h-screen w-screen overflow-hidden relative">
        <Swiper
          ref={swiperRef}
          modules={[Pagination]}
          spaceBetween={0}
          slidesPerView={1}
          onSlideChange={handleSlideChange}
          className="h-full w-full pb-24" // Espacio para el navbar
          style={{ scrollBehavior: 'smooth' }}
        >
          {/* SLIDE 0: RUTINAS (HOME) */}
          <SwiperSlide className="overflow-y-auto h-full">
            <div className="h-full overflow-y-auto custom-scrollbar pb-24">
              <MyRoutines /> 
            </div>
          </SwiperSlide>

          {/* SLIDE 1: MI PLAN */}
          <SwiperSlide className="overflow-y-auto h-full">
            <div className="h-full overflow-y-auto custom-scrollbar pb-24">
              <UserPlan />
            </div>
          </SwiperSlide>

          {/* SLIDE 2: PERFIL */}
          <SwiperSlide className="overflow-y-auto h-full">
            <div className="h-full overflow-y-auto custom-scrollbar pb-24">
              <UserProfile />
            </div>
          </SwiperSlide>
        </Swiper>

        <MobileNavbar activeTab={activeSlide} setActiveTab={handleMenuClick} />
      </div>
    </BackgroundLayout>
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