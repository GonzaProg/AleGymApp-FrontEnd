import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Login } from "./Pages/Login";
import { CreateRoutine } from "./Pages/Rutinas/CreateRoutine";
import { Home } from "./Pages/Home";
import { CreateUser } from "./Pages/Usuarios/CreateUser";
import { Profile } from "./Pages/Usuarios/Profile";
import { MyRoutines } from "./Pages/Rutinas/MyRoutines";
import { DeleteRoutine } from "./Pages/Rutinas/DeleteRoutine";
import { EjerciciosPage } from "./Pages/Ejercicios/EjerciciosPage";
import { EjerciciosCrear } from './Pages/Ejercicios/EjerciciosCrear';
import { EjerciciosGestion } from './Pages/Ejercicios/EjerciciosGestion';
import { CreateNotification } from "./Pages/Notificaciones/CreateNotification";
import { ForgotPassword } from "./Pages/Auth/ForgotPassword";
import { ResetPassword } from "./Pages/Auth/ResetPassword";

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

        {/* Ruta para Perfil de Usuario */}
        <Route path="/profile" element={<Profile />} />

        {/* Ruta para Mis Rutinas */}
        <Route path="/my-routines" element={<MyRoutines />} />

        {/* Ruta para Eliminar Rutina */}
        <Route path="/delete-routine" element={<DeleteRoutine />} />

        {/* Rutas para Ejercicios */}
        <Route path="/ejercicios" element={<EjerciciosPage/>} />
        <Route path="/ejercicios/crear" element={<EjerciciosCrear />} />
        <Route path="/ejercicios/gestion" element={<EjerciciosGestion />} />

        {/* Ruta para Crear Notificación (Broadcast) */}
        <Route path="/notifications/create" element={<CreateNotification />} />

        {/* Rutas de Autenticación */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;