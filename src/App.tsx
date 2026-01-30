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
import { PrivateRoute } from "./Routes/PrivateRoute";
import { useAuth, AuthProvider  } from "./Context/AuthContext";

// Componente interno para manejar la lógica de bloqueo
const AppContent = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { isConfigured } = useGymConfig();

  if (!isConfigured) return <SetupScreen />;
  if (isLoading) return null;

  return (
    <WhatsAppModalProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={
              isAuthenticated ? <Navigate to="/home" replace /> : <Login />
            }
          />

          <Route
            path="/home"
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />

          {/* TODAS LAS DEMÁS RUTAS → PROTEGIDAS */}
          <Route path="/create-routine" element={<PrivateRoute><CreateRoutine /></PrivateRoute>} />
          <Route path="/create-user" element={<PrivateRoute><CreateUser /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/user-profile" element={<PrivateRoute><UserProfile /></PrivateRoute>} />
          <Route path="/my-routines" element={<PrivateRoute><MyRoutines /></PrivateRoute>} />
          <Route path="/delete-routine" element={<PrivateRoute><DeleteRoutine /></PrivateRoute>} />
          <Route path="/ejercicios/crear" element={<PrivateRoute><EjerciciosCrear /></PrivateRoute>} />
          <Route path="/ejercicios/gestion" element={<PrivateRoute><EjerciciosGestion /></PrivateRoute>} />
          <Route path="/notifications/create" element={<PrivateRoute><CreateNotification /></PrivateRoute>} />
          <Route path="/forgot-password" element={<PrivateRoute><ForgotPassword /></PrivateRoute>} />
          <Route path="/planes" element={<PrivateRoute><PlansManager /></PrivateRoute>} />
          <Route path="/planes/mi-plan" element={<PrivateRoute><UserPlan /></PrivateRoute>} />
          <Route path="/planes/renovar-gestion" element={<PrivateRoute><RenewPlan /></PrivateRoute>} />
          
        </Routes>
      </BrowserRouter>
    </WhatsAppModalProvider>
  );
};

function App() {
  return (
    <GymConfigProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </GymConfigProvider>
  );
}

export default App;