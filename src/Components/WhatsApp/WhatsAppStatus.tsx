import { useState, useEffect } from "react";
import api from "../../API/axios";
import { useWhatsAppModal } from "../../Context/WhatsAppModalContext";
import { showConfirmDelete, showSuccess, showError } from "../../Helpers/Alerts"; // Importamos tus alertas

export const WhatsAppStatus = () => {
  const [status, setStatus] = useState<"connected" | "disconnected" | "loading">("loading");
  const { openModal } = useWhatsAppModal();

  const checkStatus = async () => {
    try {
      const { data } = await api.get("/whatsapp/status");
      setStatus(data.isReady ? "connected" : "disconnected");
    } catch (error) {
      console.error("Error checking WA status", error);
      setStatus("disconnected");
    }
  };

  useEffect(() => {
    checkStatus();
    // Polling cada 10s para mantener actualizado el estado visual
    const interval = setInterval(checkStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  // --- LÓGICA DE VINCULAR (Abre Modal y genera QR) ---
  const handleVincular = () => {
    openModal(); 
  };

  // --- LÓGICA DE SALIR (Directa, sin modal, sin generar QR) ---
  const handleLogout = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Evita que clicks accidentales propaguen eventos

    // 1. Pedimos confirmación para evitar desconexiones por error
    const confirm = await showConfirmDelete(
        "¿Desconectar WhatsApp?", 
        "Dejarás de enviar mensajes automáticos. ¿Estás seguro?"
    );

    if (confirm.isConfirmed) {
        try {
            setStatus("loading"); // Feedback visual rápido
            
            // 2. Llamamos al endpoint de logout
            await api.post("/whatsapp/logout");
            
            // 3. Actualizamos estado localmente a desconectado
            setStatus("disconnected");
            showSuccess("WhatsApp desconectado correctamente.");
            
            // NOTA: Al no llamar a openModal() ni a /init, el backend se queda quieto sin generar QRs.

        } catch (error) {
            console.error(error);
            showError("No se pudo desconectar.");
            setStatus("connected"); // Revertimos si falló
        }
    }
  };

  return (
    <div className="pt-6 px-4 py-2 border-t border-white/5">
      
      {/* CASO 1: CONECTADO (Status + Botón Salir) */}
      {status === "connected" ? (
        <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 p-2 rounded-lg group transition-all">
            {/* Texto e Indicador */}
            <div className="flex items-center gap-3 cursor-default">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]" />
                <span className="text-sm font-bold text-green-400">
                    WhatsApp Activo
                </span>
            </div>

            {/* Botón de Salir (Solo Icono) */}
            <button 
                onClick={handleLogout}
                title="Cerrar Sesión / Desconectar"
                className="p-1.5 rounded-md text-red-400/70 hover:text-red-400 hover:bg-red-500/20 transition-all ml-2"
            >
                {/* Icono de Puerta/Salida (Logout) */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
            </button>
        </div>
      ) : (
        
        /* CASO 2: DESCONECTADO O CARGANDO (Botón Vincular) */
        <button 
            onClick={handleVincular}
            disabled={status === "loading"}
            className={`flex items-center gap-3 w-full p-2 rounded-lg transition-all ${
                status === "loading" 
                    ? "bg-gray-700/50 text-gray-400 cursor-wait"
                    : "bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:shadow-lg hover:shadow-red-900/20"
            }`}
        >
            <div className={`w-3 h-3 rounded-full ${
                status === "loading" ? "bg-yellow-500 animate-spin" : "bg-red-500"
            }`} />
            
            <span className="text-sm font-medium">
                {status === "loading" ? "Verificando..." : "Vincular WhatsApp"}
            </span>
        </button>
      )}
    </div>
  );
};