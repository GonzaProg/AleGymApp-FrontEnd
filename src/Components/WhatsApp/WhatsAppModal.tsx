import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import api from "../../API/axios";
import { useWhatsAppModal } from "../../Context/WhatsAppModalContext";
import { Card } from "../UI/Card";
import { Button } from "../UI/Button";

export const WhatsAppModal = () => {
  const { isOpen, closeModal } = useWhatsAppModal();
  
  // Estados
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Intervalo para consultar estado
  const [pollInterval, setPollInterval] = useState<ReturnType<typeof setInterval> | null>(null);

  // --- 1. LÓGICA DE CIERRE (CANCELAR) ---
  const handleClose = async () => {
    // Detenemos el polling del frontend
    if (pollInterval) clearInterval(pollInterval);
    
    // Si cerramos y NO se conectó, avisamos al backend para que deje de trabajar
    if (!isReady) {
        try {
            // NOTA: Ruta corregida (sin doble /api)
            await api.post("/whatsapp/cancel"); 
        } catch (error) { console.error("Error cancelando:", error); }
    }

    // Limpieza visual
    setQrCode(null);
    setIsReady(false);
    closeModal();
  };

  // --- 2. POLLING (Consultar si ya escaneó) ---
  const startPolling = () => {
    const interval = setInterval(async () => {
        try {
            const { data } = await api.get("/whatsapp/status");
            
            // CASO A: ¡CONECTADO!
            if (data.isReady) {
                setIsReady(true);
                setQrCode(null);
                setLoading(false);
                
                // Dejamos de preguntar
                clearInterval(interval); 
                
                // AUTO-CIERRE: Esperamos 2 segundos para que vea el check verde y cerramos
                setTimeout(() => {
                    closeModal();
                }, 2000);

            } 
            // CASO B: NOS LLEGA EL QR
            else if (data.qrCode) {
                setQrCode(data.qrCode);
                setLoading(false);
            }
        } catch (error) {
            console.error("Polling error", error);
        }
    }, 2000); // Preguntar cada 2 segundos

    setPollInterval(interval);
  };

  // --- 3. INICIAR (Pedir QR al Backend) ---
  const initSession = async () => {
    setLoading(true);
    try {
        // Pedimos iniciar
        await api.post("/whatsapp/init");
        // Empezamos a escuchar
        startPolling();
    } catch (error) {
        console.error("Error iniciando:", error);
        setLoading(false);
    }
  };

  // --- EFECTO DE APERTURA ---
  useEffect(() => {
    if (isOpen) {
        // Reseteamos estados
        setQrCode(null);
        setIsReady(false);
        setLoading(true);

        // Verificamos si DE CASUALIDAD ya estaba conectado antes de generar QR
        api.get("/whatsapp/status").then(({ data }) => {
            if (data.isReady) {
                setIsReady(true);
                setLoading(false);
                setTimeout(closeModal, 1500); // Si ya estaba, cerramos rápido
            } else {
                // Si no está conectado, arrancamos el flujo normal
                initSession();
            }
        }).catch(() => initSession());

    } else {
        // Si el modal se cierra por fuera (ej: cambio de estado global), limpiamos
        if (pollInterval) clearInterval(pollInterval);
    }

    // Cleanup al desmontar
    return () => {
        if (pollInterval) clearInterval(pollInterval);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <Card className="max-w-md w-full bg-gray-900 border border-green-500/30 p-6 text-center relative">
        {/* Botón X llama a handleClose (Cancela) */}
        <button onClick={handleClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">✕</button>
        
        <h2 className="text-2xl font-bold text-white mb-2">WhatsApp Web 📱</h2>
        <p className="text-gray-400 text-sm mb-6">
             {isReady ? "¡Vinculación Exitosa!" : "Escanea el código para conectar"}
        </p>

        <div className="flex justify-center items-center bg-white p-4 rounded-xl min-h-[250px]">
          {loading ? (
            <div className="animate-pulse flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500">Generando QR seguro...</p>
            </div>
          ) : isReady ? (
            <div className="text-center animate-fade-in-up">
                <div className="text-6xl mb-4">✅</div>
                <p className="text-green-600 font-bold text-lg">¡Conectado!</p>
                <p className="text-gray-400 text-xs mt-2">Cerrando ventana...</p>
            </div>
          ) : qrCode ? (
            <QRCodeSVG value={qrCode} size={220} />
          ) : (
            <p className="text-red-500">Esperando QR...</p>
          )}
        </div>

        <div className="mt-6">
            {/* Solo botón de Cancelar (o Cerrar si ya terminó) */}
            <Button onClick={handleClose} className="w-full bg-gray-700 text-white hover:bg-gray-600">
                {isReady ? "Cerrar" : "Cancelar"}
            </Button>
        </div>
      </Card>
    </div>
  );
};