import { useState, useEffect } from "react";
import api from "../../API/axios";
import { showError } from "../../Helpers/Alerts";

export const WhatsAppStatus = () => {
    const [status, setStatus] = useState({ isReady: false, isPaused: false });

    const checkStatus = async () => {
        try {
            const { data } = await api.get("/whatsapp/status");
            setStatus(data);
        } catch (error) {
            console.error("Error status", error);
        }
    };

    useEffect(() => {
        checkStatus();
        const interval = setInterval(checkStatus, 10000); 
        return () => clearInterval(interval);
    }, []);

    // LÓGICA VINCULAR MANUALMENTE
    const handleVincular = async () => {
        try {
            // 1. Quita bloqueo visual
            localStorage.removeItem('whatsapp_dismissed'); 
            // 2. Despierta al backend
            await api.post("/whatsapp/resume"); 
            // 3. Recarga para mostrar el modal
            window.location.reload();
        } catch (error) {
            showError("No se pudo iniciar el servicio de WhatsApp.");
        }
    };

    const handleLogout = async () => {
        if (!confirm("¿Desvincular WhatsApp?")) return;
        try {
            await api.post("/whatsapp/logout");
            localStorage.removeItem('whatsapp_dismissed'); // Reseteamos preferencia
            window.location.reload();
        } catch (error) {
            showError("Error al desvincular");
        }
    };

    // DISEÑO PARA LA SIDEBAR
    return (
        <div className="px-6 py-4 mt-auto border-t border-white/5 bg-black/20">
            {status.isReady ? (
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e] animate-pulse"></span>
                        <span className="text-green-400 text-xs font-bold tracking-wide">WHATSAPP ONLINE</span>
                    </div>
                    <button onClick={handleLogout} className="text-[10px] text-red-400/70 hover:text-red-400 hover:underline">
                        Salir
                    </button>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-gray-500">
                        <span className="w-2 h-2 rounded-full bg-red-500/50"></span>
                        <span className="text-[10px] font-bold tracking-wide uppercase">WhatsApp Offline</span>
                    </div>
                    <button 
                        onClick={handleVincular}
                        className="w-full py-2 px-3 bg-green-600/20 hover:bg-green-600/40 text-green-400 text-xs font-bold rounded-lg border border-green-500/30 transition-all flex items-center justify-center gap-2"
                    >
                        <span>🔗</span> Vincular Ahora
                    </button>
                </div>
            )}
        </div>
    );
};