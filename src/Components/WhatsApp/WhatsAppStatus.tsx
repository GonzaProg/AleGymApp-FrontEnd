import { useState, useEffect, useRef, useCallback } from "react";
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
  const isIdleRef = useRef(false);

  // --- 1. FUNCIÓN DE SONDEO (Estándar para servidor siempre activo) ---
  const checkStatus = useCallback(async () => {
    // Limpiamos timeout previo
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // Si está inactivo o ya falló 3 veces seguidas (problema real de red/server), paramos
    if (isIdleRef.current || consecutiveErrorsRef.current >= 3) return;

    try {
      const { data } = await api.get("/whatsapp/status");
      
      // Éxito: Reseteamos contador de errores
      consecutiveErrorsRef.current = 0;
      setStatus(data.isReady ? "connected" : "disconnected");

      // Programamos siguiente check en 60 segundos
      timeoutRef.current = setTimeout(checkStatus, 60000);

    } catch (error) {
      consecutiveErrorsRef.current += 1;
      console.warn(`⚠️ Fallo de conexión ${consecutiveErrorsRef.current}/3`);

      if (consecutiveErrorsRef.current >= 3) {
        console.error("🛑 Servidor inalcanzable. Deteniendo sondeo automático.");
        setStatus("offline");
      } else {
        // Reintento estándar en 15s (suficiente para plan Básico)
        timeoutRef.current = setTimeout(checkStatus, 15000);
      }
    }
  }, []); // Sin dependencias para que sea estable

  // --- 2. GESTIÓN DE INACTIVIDAD (Optimizado: Click en vez de Mousemove) ---
  const resetIdleTimer = useCallback(() => {
    // Si estaba inactivo, reactivamos todo
    if (isIdleRef.current) {
      console.log("⚡ Usuario activo. Reanudando conexión...");
      isIdleRef.current = false;
      setIsIdle(false);
      
      // Si estaba en error (offline), le damos una nueva oportunidad
      if (consecutiveErrorsRef.current >= 3) {
        consecutiveErrorsRef.current = 0; 
        setStatus("loading");
      }
      
      checkStatus();
    }

    if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    
    // Timer de 5 minutos
    idleTimeoutRef.current = setTimeout(() => {
      console.log("💤 Inactividad detectada (5 min). Pausando sondeo.");
      isIdleRef.current = true;
      setIsIdle(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }, 300000); 
  }, [checkStatus]);

  useEffect(() => {
    // Arranque inicial
    checkStatus();
    resetIdleTimer();

    // OPTIMIZACIÓN: Usamos 'click' y 'keydown'
    // 'mousemove' se dispara cientos de veces. 'click' solo cuando el usuario interactúa de verdad.
    window.addEventListener("click", resetIdleTimer);
    window.addEventListener("keydown", resetIdleTimer);
    
    return () => {
      window.removeEventListener("click", resetIdleTimer);
      window.removeEventListener("keydown", resetIdleTimer);
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [checkStatus, resetIdleTimer]);

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
        // Forzamos un chequeo rápido para confirmar estado
        setTimeout(checkStatus, 1000);
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
          <button onClick={handleLogout} className="p-1.5 rounded-md text-red-400/70 hover:text-red-400 hover:bg-red-500/20 transition-colors">
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
            {status === "loading" ? "Verificando..." : isServerDown ? "Reconectar Servidor" : "Vincular WhatsApp"}
          </span>
        </button>
      )}
    </div>
  );
};