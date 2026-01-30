import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Login } from "./Pages/Login";
import { CreateRoutine } from "./Pages/Rutinas/CreateRoutine";
import { Home } from "./Pages/Home";
import { CreateUser } from "./Pages/Usuarios/CreateUser";
import { Profile } from "./Pages/Usuarios/Profile";
import { MyRoutines } from "./Pages/Rutinas/MyRoutines";
import { DeleteRoutine } from "./Pages/Rutinas/DeleteRoutine";
import { EjerciciosCrear } from './Pages/Ejercicios/EjerciciosCrear';
import { EjerciciosGestion } from './Pages/Ejercicios/EjerciciosGestion';
import { CreateNotification } from "./Pages/Notificaciones/CreateNotification";
import { ForgotPassword } from "./Pages/Auth/ForgotPassword";
import { PlansManager } from "./Pages/Planes/PlansManager";
import { UserPlan } from "./Pages/Planes/UserPlan";
import { RenewPlan } from "./Pages/Planes/RenewPlan";
import { UserProfile } from "./Pages/Usuarios/UserProfile";
import { GymConfigProvider, useGymConfig } from "./Context/GymConfigContext";
import { SetupScreen } from "./Pages/Setup/SetupScreen";
import { WhatsAppModalProvider } from "./Context/WhatsAppModalContext"; 
import { useAuthUser } from "./Hooks/useAuthUser";
import type { JSX } from "react/jsx-dev-runtime";

// Componente interno para manejar la lógica de bloqueo
const AppContent = () => {
  const { isConfigured } = useGymConfig();

  // SI LA PC NO TIENE CÓDIGO DE GIMNASIO -> MUESTRA PANTALLA DE CONFIGURACIÓN
  if (!isConfigured) {
    return <SetupScreen />;
  }

  // --- COMPONENTE GUARDIÁN: RUTA PÚBLICA ---
// Si ya hay usuario, NO deja ver el Login y manda al Home.
const PublicRoute = ({ children }: { children: JSX.Element }) => {
    const { currentUser, isLoading } = useAuthUser();

    if (isLoading) return null; // O un Spinner

    if (currentUser) {
        return <Navigate to="/home" replace />;
    }
    return children;
};

// --- COMPONENTE GUARDIÁN: RUTA PRIVADA ---
// (Opcional pero recomendado) Si no hay usuario, manda al Login.
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const { currentUser, isLoading } = useAuthUser();

    if (isLoading) return null; 

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

  // SI YA ESTÁ CONFIGURADA -> MUESTRA LA APP NORMAL
  return (
    /* 2. ENVOLVEMOS EL ROUTER CON EL PROVIDER DE WHATSAPP */
    <WhatsAppModalProvider>
      <BrowserRouter>
        <Routes>
          {/* Ruta por defecto: Redirige al Login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* 2. LOGIN PROTEGIDO (Si ya soy user, me patea al home) */}
          <Route path="/login" element={
              <PublicRoute>
                  <Login />
              </PublicRoute>
          } />

          {/* 3. HOME PROTEGIDO (Si no soy user, me patea al login) */}
          <Route path="/home" element={
              <ProtectedRoute>
                  <Home />
              </ProtectedRoute>
          } />
          
          {/* Ruta para Crear Rutina */}
          <Route path="/create-routine" element={<ProtectedRoute><CreateRoutine /></ProtectedRoute>} />

          {/* Ruta para Crear Usuario */}
          <Route path="/create-user" element={<ProtectedRoute><CreateUser /></ProtectedRoute>} />

          {/* Ruta para Perfil */}
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/user-profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />

          {/* Ruta para Mis Rutinas */}
          <Route path="/my-routines" element={<ProtectedRoute><MyRoutines /></ProtectedRoute>} />
          {/* Ruta para Eliminar Rutina */}
          <Route path="/delete-routine" element={<ProtectedRoute><DeleteRoutine /></ProtectedRoute>} />

          {/* Rutas para Ejercicios */}
          <Route path="/ejercicios/crear" element={<ProtectedRoute><EjerciciosCrear /></ProtectedRoute>} />
          <Route path="/ejercicios/gestion" element={<ProtectedRoute><EjerciciosGestion /></ProtectedRoute>} />
          {/* Ruta para Crear Notificación (Broadcast) */}
          <Route path="/notifications/create" element={<ProtectedRoute><CreateNotification /></ProtectedRoute>} />

          {/* Ruta de Recuperación de contraseña */}
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Rutas de Planes y Membresías */}
          <Route path="/planes" element={<ProtectedRoute><PlansManager /></ProtectedRoute>} />
          <Route path="/planes/mi-plan" element={<ProtectedRoute><UserPlan /></ProtectedRoute>} />

          {/* Ruta para Renovar Planes de Usuarios*/}
          <Route path="/planes/renovar-gestion" element={<ProtectedRoute><RenewPlan /></ProtectedRoute>} />
        </Routes>
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