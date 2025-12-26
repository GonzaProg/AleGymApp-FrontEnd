import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Login } from "./Pages/Login";
import { CreateRoutine } from "./Pages/CreateRoutine";
import { Home } from "./Pages/Home";
import { CreateUser } from "./Pages/CreateUser";
import { Profile } from "./Pages/Profile";
import { MyRoutines } from "./Pages/MyRoutines";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta por defecto: Redirige al Login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Ruta del Login */}
        <Route path="/login" element={<Login />} />

        {/* Ruta Home (Placeholder para cuando loguees) */}
        {/*<Route path="/home" element={<h1 className="text-center mt-10 text-2xl">¡Bienvenido al Gimnasio!</h1>} />*/}
        <Route path="/home" element={<Home />} />
        
        {/* Ruta para Crear Rutina */}
        <Route path="/create-routine" element={<CreateRoutine />} />

        {/* Ruta para Crear Usuario */}
        <Route path="/create-user" element={<CreateUser />} />

        {/* Ruta para Perfil de Usuario */}
        <Route path="/profile" element={<Profile />} />

        {/* Ruta para Mis Rutinas */}
        <Route path="/my-routines" element={<MyRoutines />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;