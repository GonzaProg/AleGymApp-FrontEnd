import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Login } from "./Pages/Login";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta por defecto: Redirige al Login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Ruta del Login */}
        <Route path="/login" element={<Login />} />

        {/* Ruta Home (Placeholder para cuando loguees) */}
        <Route path="/home" element={<h1 className="text-center mt-10 text-2xl">¡Bienvenido al Gimnasio!</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;