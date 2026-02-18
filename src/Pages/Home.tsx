import { useState, useRef, Suspense, lazy } from "react";

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

// --- IMPORTACIONES PEREZOSAS ---
// Usamos .then(module => ({ default: module.Nombre }))
const MyRoutines = lazy(() => import("./Rutinas/MyRoutines").then(module => ({ default: module.MyRoutines })));
const UserPlan = lazy(() => import("./Planes/UserPlan").then(module => ({ default: module.UserPlan })));
const Profile = lazy(() => import("./Usuarios/Profile").then(module => ({ default: module.Profile })));

// Vistas de Admin (Lazy Loading)
const PlansManager = lazy(() => import("../Pages/Planes/PlansManager").then(module => ({ default: module.PlansManager })));
const CreateRoutine = lazy(() => import("../Pages/Rutinas/CreateRoutine").then(module => ({ default: module.CreateRoutine })));
const GeneralRoutinesManager = lazy(() => import("../Pages/Rutinas/GeneralRoutinesManager").then(module => ({ default: module.GeneralRoutinesManager })));
const EjerciciosGestion = lazy(() => import("../Pages/Ejercicios/EjerciciosGestion").then(module => ({ default: module.EjerciciosGestion })));
const EjerciciosCrear = lazy(() => import("../Pages/Ejercicios/EjerciciosCrear").then(module => ({ default: module.EjerciciosCrear })));
const CreateNotification = lazy(() => import("../Pages/Notificaciones/CreateNotification").then(module => ({ default: module.CreateNotification })));
const CreateUser = lazy(() => import("../Pages/Usuarios/CreateUser").then(module => ({ default: module.CreateUser })));
const UsersManager = lazy(() => import("../Pages/Usuarios/UsersManager").then(module => ({ default: module.UsersManager })));
const UserRoutinesManager = lazy(() => import("../Pages/Rutinas/UserRoutinesManager").then(module => ({ default: module.UserRoutinesManager })));
const SendRoutinePDF = lazy(() => import("../Pages/Rutinas/SendRoutinePDF").then(module => ({ default: module.SendRoutinePDF })));
const RenewPlan = lazy(() => import("../Pages/Planes/RenewPlan").then(module => ({ default: module.RenewPlan })));
const Preferences = lazy(() => import("../Pages/Config/Preferences").then(module => ({ default: module.Preferences })));
const CreateGym = lazy(() => import("../Pages/Gym/CreateGym").then(module => ({ default: module.CreateGym })));
const GymManagement = lazy(() => import("../Pages/Gym/GymManagement").then(module => ({ default: module.GymManagement })));
const ManualReceipt = lazy(() => import("../Pages/Planes/ReciboManual").then(module => ({ default: module.ManualReceipt })));
const MetricasFinancieras = lazy(() => import("./Pagos/MetricasFinancieras").then(module => ({ default: module.MetricasFinancieras })));
const ProductosManager = lazy(() => import("../Pages/Productos/ProductosManager").then(module => ({ default: module.ProductosManager })));

const Icons = {
  dashboard: "🏠", rutinas: "💪", planes: "💎", finanzas: "📈",
  ejercicios: "🏋️", notificaciones: "📢", usuarios: "👥",
  enviarPDF: "📤", renovar: "🔄", salir: "🚪", perfil: "👤", preferencias: "⚙️", 
  nuevoGym: "🏢", gestionGyms: "⚙️", reciboManual: "🧾", crearRutinaGeneral: "📚",
  tienda: "🛍️", rutinasUsuarios: "📝",
};

const TabLoading = () => (
    <div className="flex flex-col items-center justify-center h-64 text-white/50 animate-pulse gap-4">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
);

// Componente Wrapper para renderizar solo si se ha visitado
// Esto reduce drasticamente el peso inicial del DOM
const LazySlideContent = ({ children, index, activeIndex, visited }: { children: any, index: number, activeIndex: number, visited: boolean }) => {
    // Si ya lo visitamos O es el actual, lo mostramos. Si no, mostramos un placeholder vacío.
    // El placeholder mantiene la altura mínima para que el Swiper no colapse.
    if (visited || index === activeIndex) {
        return <Suspense fallback={<TabLoading />}>{children}</Suspense>;
    }
    return <div className="h-full w-full" />; // Placeholder invisible
};

export const Home = () => {
  const { currentUser, isEntrenador, isAdmin, isLoading, metrics, logout } = useOptimizedHome();  

  // ESTADOS ADMIN
  const [activeTab, setActiveTab] = useState("Inicio");
  const [routineIdToEdit, setRoutineIdToEdit] = useState<number | null>(null);

  // ESTADOS ALUMNO
  const [activeSlide, setActiveSlide] = useState(0); 
  const swiperRef = useRef<any>(null);
  
  // Optimización: Guardamos qué slides ya visitó el usuario
  const [visitedSlides, setVisitedSlides] = useState<Set<number>>(new Set([0]));

  const handleEditRoutine = (id: number) => {
      setRoutineIdToEdit(id);
      setActiveTab("Crear Rutina General");
  };

  const handleSidebarClick = (tabName: string) => {
      setRoutineIdToEdit(null);
      setActiveTab(tabName);
  };

  const handleSlideChange = (swiper: any) => {
    const newIndex = swiper.activeIndex;
    setActiveSlide(newIndex);
    // Agregamos el nuevo índice a los visitados
    setVisitedSlides(prev => {
        const newSet = new Set(prev);
        newSet.add(newIndex);
        return newSet;
    });
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
  // VISTA ENTRENADOR / ADMIN
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
          </div>
          {metrics && <StatsGrid metrics={metrics} userRole={currentUser?.rol || ''} />}
        </div>
    );

    const renderAdminContent = () => {
        return (
            <Suspense fallback={<TabLoading />}>
                {(() => {
                    switch (activeTab) {
                        case "Inicio": return <AdminDashboardWelcome/>;
                        case "Planes": return <PlansManager />;
                        case "Finanzas": return <MetricasFinancieras />;
                        case "Crear Rutina": return <CreateRoutine isGeneral={false} />;
                        case "Rutinas Generales": return <GeneralRoutinesManager onNavigate={handleSidebarClick} onEdit={handleEditRoutine}/>;
                        case "Rutinas Usuarios": return <UserRoutinesManager onNavigate={handleSidebarClick} onEdit={handleEditRoutine}/>;
                        case "Crear Rutina General": return <CreateRoutine isGeneral={true} routineIdToEdit={routineIdToEdit} />;
                        case "Ejercicios": return <EjerciciosGestion onNavigate={setActiveTab} />;
                        case "Crear Ejercicio": return <EjerciciosCrear onNavigate={setActiveTab} />;
                        case "Notificaciones": return <CreateNotification />;
                        case "Nuevo Usuario": return <CreateUser />;
                        case "Gestionar Usuarios": return <UsersManager />;
                        case "Enviar PDF": return <SendRoutinePDF />; 
                        case "Renovar": return <RenewPlan />;
                        case "Perfil": return <Profile />;
                        case "Preferencias": return <Preferences />; 
                        case "Nuevo Gimnasio": return <CreateGym />;
                        case "Gestión Gimnasios": return <GymManagement />; 
                        case "Enviar Recibo Manualmente": return <ManualReceipt />;
                        case "Productos": return <ProductosManager />;
                        default: return <AdminDashboardWelcome />;
                    }
                })()}
            </Suspense>
        );
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
                <SidebarItem icon={Icons.finanzas} label="Finanzas" active={activeTab === "Finanzas"} onClick={() => handleSidebarClick("Finanzas")} />
                
                <p className="px-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 mt-4">Rutinas</p>
                <SidebarItem icon={Icons.crearRutinaGeneral} label="Rutinas Generales" active={activeTab === "Rutinas Generales"} onClick={() => handleSidebarClick("Rutinas Generales")} />
                <SidebarItem icon={Icons.rutinasUsuarios} label="Rutinas Usuarios" active={activeTab === "Rutinas Usuarios"} onClick={() => handleSidebarClick("Rutinas Usuarios")} />
                <SidebarItem icon={Icons.ejercicios} label="Ejercicios" active={activeTab === "Ejercicios" || activeTab === "Crear Ejercicio"} onClick={() => handleSidebarClick("Ejercicios")} />
                
                <p className="px-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 mt-4">Tienda</p>
                <SidebarItem icon={Icons.tienda} label="Productos / Tienda" active={activeTab === "Productos"} onClick={() => handleSidebarClick("Productos")} />
                
                <p className="px-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 mt-6">Social</p>
                <SidebarItem icon={Icons.notificaciones} label="Notificaciones" active={activeTab === "Notificaciones"} onClick={() => handleSidebarClick("Notificaciones")} />
                <SidebarItem icon={Icons.enviarPDF} label="Enviar Rutina PDF" active={activeTab === "Enviar PDF"} onClick={() => handleSidebarClick("Enviar PDF")} />
                <SidebarItem icon={Icons.reciboManual} label="Enviar Recibo Manualmente" active={activeTab === "Enviar Recibo Manualmente"} onClick={() => handleSidebarClick("Enviar Recibo Manualmente")} />
                <SidebarItem icon={Icons.usuarios} label="Nuevo Usuario" active={activeTab === "Nuevo Usuario"} onClick={() => handleSidebarClick("Nuevo Usuario")} />
                <SidebarItem icon={Icons.usuarios} label="Gestionar Usuarios" active={activeTab === "Gestionar Usuarios"} onClick={() => handleSidebarClick("Gestionar Usuarios")} />
                
                <p className="px-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 mt-6">Sistema</p>
                <SidebarItem icon={Icons.preferencias} label="Preferencias" active={activeTab === "Preferencias"} onClick={() => handleSidebarClick("Preferencias")} />
                <SidebarItem icon={Icons.perfil} label="Mi Perfil" active={activeTab === "Perfil"} onClick={() => handleSidebarClick("Perfil")} />
                
                {isAdmin && (
                  <>
                    <p className="px-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 mt-6">Administración</p>
                    <SidebarItem icon={Icons.nuevoGym} label="Nuevo Gimnasio" active={activeTab === "Nuevo Gimnasio"} onClick={() => handleSidebarClick("Nuevo Gimnasio")} />
                    <SidebarItem icon={Icons.gestionGyms} label="Gestión Gimnasios" active={activeTab === "Gestión Gimnasios"} onClick={() => handleSidebarClick("Gestión Gimnasios")} />
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
  // VISTA ALUMNOS (OPTIMIZADA)
  // =================================================================
  return (
    <BackgroundLayout>
      <div className="absolute top-0 left-0 w-full z-50">
        <Navbar />
      </div>
      
      <div className="h-screen w-screen overflow-hidden relative">
        {/* Swiper optimizado para móviles */}
        <Swiper
            ref={swiperRef}
            modules={[Pagination]}
            spaceBetween={0}
            slidesPerView={1}
            onSlideChange={handleSlideChange}
            className="h-full w-full pb-24"
            // CSS touch-action ayuda al navegador a saber que es un swipe horizontal
            style={{ touchAction: 'pan-y' }} 
            speed={300} // Velocidad de transición rápida pero suave
        >
            {/* SLIDE 0: RUTINAS */}
            <SwiperSlide className="overflow-y-auto h-full">
                <div className="h-full overflow-y-auto custom-scrollbar pb-24">
                    <LazySlideContent index={0} activeIndex={activeSlide} visited={visitedSlides.has(0)}>
                        <MyRoutines /> 
                    </LazySlideContent>
                </div>
            </SwiperSlide>

            {/* SLIDE 1: MI PLAN */}
            <SwiperSlide className="overflow-y-auto h-full">
                <div className="h-full overflow-y-auto custom-scrollbar pb-24">
                    <LazySlideContent index={1} activeIndex={activeSlide} visited={visitedSlides.has(1)}>
                        <UserPlan />
                    </LazySlideContent>
                </div>
            </SwiperSlide>

            {/* SLIDE 2: PERFIL */}
            <SwiperSlide className="overflow-y-auto h-full">
                <div className="h-full overflow-y-auto custom-scrollbar pb-24">
                    <LazySlideContent index={2} activeIndex={activeSlide} visited={visitedSlides.has(2)}>
                        <Profile isMobile={true} />
                    </LazySlideContent>
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