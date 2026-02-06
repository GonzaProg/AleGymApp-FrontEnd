import { useState, useEffect, useRef } from "react";
import api from "../../API/axios";
import { useWhatsAppModal } from "../../Context/WhatsAppModalContext";
import { showConfirmDelete, showSuccess, showError } from "../../Helpers/Alerts";

export const WhatsAppStatus = () => {
  const [status, setStatus] = useState<"connected" | "disconnected" | "loading" | "offline">("loading");
  const [_, setIsIdle] = useState(false);
  const { openModal } = useWhatsAppModal();
  
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const consecutiveErrorsRef = useRef(0);
  // Ref para saber el estado real de isIdle dentro de funciones async sin depender del state
  const isIdleRef = useRef(false);

  // --- 1. FUNCIÓN DE SONDEO (UNIFICADA) ---
  const checkStatus = async () => {
    // Limpiamos cualquier timeout pendiente para evitar duplicados
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // Si el usuario está inactivo o el servidor ya se marcó como offline, no hacemos nada
    if (isIdleRef.current || consecutiveErrorsRef.current >= 3) return;

    try {
      const { data } = await api.get("/whatsapp/status");
      consecutiveErrorsRef.current = 0;
      setStatus(data.isReady ? "connected" : "disconnected");

      // Si sigue activo, programamos la siguiente en 1 minuto (60000)
      timeoutRef.current = setTimeout(checkStatus, 10000);
    } catch (error) {
      consecutiveErrorsRef.current += 1;
      console.warn(`Fallo ${consecutiveErrorsRef.current}/3 al conectar con WhatsApp Status`);

      if (consecutiveErrorsRef.current >= 3) {
        console.error("🛑 Servidor inalcanzable. Sondeo detenido.");
        setStatus("offline");
      } else {
        // Reintento corto si aún hay intentos
        timeoutRef.current = setTimeout(checkStatus, 15000);
      }
    }
  };

  // --- 2. GESTIÓN DE INACTIVIDAD ---
  const resetIdleTimer = () => {
    // Si vuelve de inactividad
    if (isIdleRef.current) {
      console.log("⚡ Actividad detectada. Reiniciando sondeo.");
      isIdleRef.current = false;
      setIsIdle(false);
      consecutiveErrorsRef.current = 0; // Opcional: resetear errores al volver
      checkStatus();
    }

    if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    
    // Timer de inactividad (300000ms = 5min)
    idleTimeoutRef.current = setTimeout(() => {
      console.log("💤 Modo ahorro: Usuario inactivo.");
      isIdleRef.current = true;
      setIsIdle(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }, 5000); 
  };

  useEffect(() => {
    // Eventos para detectar actividad
    window.addEventListener("mousemove", resetIdleTimer);
    window.addEventListener("keydown", resetIdleTimer);
    
    // Arranque inicial
    checkStatus();
    resetIdleTimer();

    return () => {
      window.removeEventListener("mousemove", resetIdleTimer);
      window.removeEventListener("keydown", resetIdleTimer);
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // --- HANDLERS ---
  const handleVincular = () => openModal();

  const handleLogout = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const confirm = await showConfirmDelete("¿Desconectar?", "Se detendrán los mensajes.");
    if (confirm.isConfirmed) {
      try {
        setStatus("loading");
        await api.post("/whatsapp/logout");
        setStatus("disconnected");
        showSuccess("Desconectado");
      } catch (error) {
        showError("Error al desconectar");
        setStatus("connected");
      }
    }
  };

  const isServerDown = status === "offline";

  return (
    <div className="pt-6 px-4 py-2 border-t border-white/5">
      {status === "connected" ? (
        <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 p-2 rounded-lg group transition-all">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]" />
            <span className="text-sm font-bold text-green-400">WhatsApp Activo</span>
          </div>
          <button onClick={handleLogout} className="p-1.5 rounded-md text-red-400/70 hover:text-red-400 hover:bg-red-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
          </button>
        </div>
      ) : (
        <button 
          onClick={isServerDown ? () => { consecutiveErrorsRef.current = 0; checkStatus(); } : handleVincular} 
          disabled={status === "loading"}
          className={`flex items-center gap-3 w-full p-2 rounded-lg transition-all ${
            status === "loading" ? "bg-gray-700/50 text-gray-400 cursor-wait"
            : isServerDown ? "bg-orange-500/10 text-orange-400 border border-orange-500/30"
            : "bg-red-500/10 text-red-400 hover:bg-red-500/20"
          }`}
        >
          <div className={`w-3 h-3 rounded-full ${status === "loading" ? "bg-yellow-500 animate-spin" : isServerDown ? "bg-orange-500" : "bg-red-500"}`} />
          <span className="text-sm font-medium">
            {status === "loading" ? "Verificando..." : isServerDown ? "Servidor offline (Reintentar)" : "Vincular WhatsApp"}
          </span>
        </button>
      )}
    </div>
  );
};