import { Suspense, lazy } from "react"; 
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { GymConfigProvider, useGymConfig } from "./Context/GymConfigContext";
import { WhatsAppModalProvider } from "./Context/WhatsAppModalContext"; 
import { useAuthUser } from "./Hooks/Auth/useAuthUser";
import type { JSX } from "react/jsx-dev-runtime";
import { GymLockedScreen } from "./Components/GymLocked/GymLockedScreen";
import { useUpdateListener } from "./Hooks/System/useUpdateListener";
import { SetupScreen } from "./Pages/Setup/SetupScreen";

// 2. IMPORTACIONES PEREZOSAS (Lazy Imports)
// El navegador NO descargará estos archivos hasta que se necesiten.
const Login = lazy(() => import("./Pages/Login/Login").then(module => ({ default: module.Login })));
const Home = lazy(() => import("./Pages/Home").then(module => ({ default: module.Home })));
const ForgotPassword = lazy(() => import("./Pages/Login/ForgotPassword").then(module => ({ default: module.ForgotPassword })));

// Componente de carga simple y elegante
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#1a1225]">
    <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const AppContent = () => {
  const { isConfigured } = useGymConfig();
  useUpdateListener();
  
  if (!isConfigured) return <SetupScreen />;

  // Guardians
  const PublicRoute = ({ children }: { children: JSX.Element }) => {
    const { currentUser, isLoading } = useAuthUser();
    if (isLoading) return null;
    if (currentUser) return <Navigate to="/home" replace />;
    return children;
  };

  const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const { currentUser, isLoading } = useAuthUser();
    if (isLoading) return null; 
    if (!currentUser) return <Navigate to="/login" replace />;
    return children;
  };

  return (
    <WhatsAppModalProvider>
      <GymLockedScreen />
      <BrowserRouter>
        {/* 3. SUSPENSE ENVUELVE LAS RUTAS */}
        <Suspense fallback={<LoadingScreen />}>
            <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            <Route path="/login" element={
                <PublicRoute>
                    <Login />
                </PublicRoute>
            } />

            <Route path="/home" element={
                <ProtectedRoute>
                    <Home />
                </ProtectedRoute>
            } />
            
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            {/* Si alguien intenta entrar a una ruta vieja, lo mandamos a home */}
            <Route path="*" element={<Navigate to="/home" replace />} />
            </Routes>
        </Suspense>
      </BrowserRouter>
    </WhatsAppModalProvider>
  );
};

function App() {
  return (
    <GymConfigProvider>
       <AppContent />
    </GymConfigProvider>
  );
}

export default App;