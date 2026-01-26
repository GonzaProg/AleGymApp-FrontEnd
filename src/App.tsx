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
import {UserProfile} from "./Pages/Usuarios/UserProfile";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta por defecto: Redirige al Login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Ruta del Login */}
        <Route path="/login" element={<Login />} />

        {/* Ruta Home */}
        <Route path="/home" element={<Home />} />
        
        {/* Ruta para Crear Rutina */}
        <Route path="/create-routine" element={<CreateRoutine />} />

        {/* Ruta para Crear Usuario */}
        <Route path="/create-user" element={<CreateUser />} />

        {/* Ruta para Perfil */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/user-profile" element={<UserProfile />} />

        {/* Ruta para Mis Rutinas */}
        <Route path="/my-routines" element={<MyRoutines />} />

        {/* Ruta para Eliminar Rutina */}
        <Route path="/delete-routine" element={<DeleteRoutine />} />

        {/* Rutas para Ejercicios */}
        <Route path="/ejercicios/crear" element={<EjerciciosCrear />} />
        <Route path="/ejercicios/gestion" element={<EjerciciosGestion />} />

        {/* Ruta para Crear Notificación (Broadcast) */}
        <Route path="/notifications/create" element={<CreateNotification />} />

        {/* Ruta de Recuperación de contraseña */}
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Rutas de Planes y Membresías */}
        <Route path="/planes" element={<PlansManager />} />
        <Route path="/planes/mi-plan" element={<UserPlan />} />

        {/* Ruta para Renovar Planes de Usuarios*/}
        <Route path="/planes/renovar-gestion" element={<RenewPlan />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;