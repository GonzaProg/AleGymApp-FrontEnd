import { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react"; 
import api from "../../API/axios";
import { AppStyles } from "../../Styles/AppStyles";
import { Button } from "../UI/Button";

export const WhatsAppModal = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false); 
    const [isLoading, setIsLoading] = useState(true);

    // NUEVO ESTADO: Controla si el usuario descartó el modal para detener el polling
    const [isDismissed, setIsDismissed] = useState(() => {
        return sessionStorage.getItem('whatsapp_dismissed') === 'true';
    });

    const checkStatus = async () => {
        try {
            const { data } = await api.get("/whatsapp/status");
            
            setIsConnected(data.isReady);
            setQrCode(data.qrCode);
            setIsLoading(false);

            if (data.isReady) {
                // Si se conectó, nos aseguramos de limpiar el bloqueo para futuras desconexiones
                setIsOpen(false);
                sessionStorage.removeItem('whatsapp_dismissed');
                setIsDismissed(false);
            } 
            else if (data.qrCode && !isDismissed) {
                setIsOpen(true);
            }

        } catch (error) {
            console.error("Silencio: Error verificando WhatsApp", error);
        }
    };

    // --- HANDLER OPTIMIZADO ---
    const handleDismiss = () => {
        setIsOpen(false);
        // 1. Guardamos en sesión
        sessionStorage.setItem('whatsapp_dismissed', 'true');
        // 2. Actualizamos estado para detener el useEffect inmediatamente
        setIsDismissed(true);
    };

    // POLLING INTELIGENTE
    useEffect(() => {
        // PAUSA TOTAL: Si está descartado, no hacemos NADA.
        if (isDismissed) return;

        checkStatus(); 

        // Si está conectado, revisamos lento (30s). Si no, rápido (3s).
        const intervalTime = isConnected ? 30000 : 3000;
        const interval = setInterval(checkStatus, intervalTime);

        return () => clearInterval(interval);
    }, [isConnected, isDismissed]); // <--- Se re-ejecuta si cambia el estado de dismissal

    // Si está cerrado, no renderizamos nada
    if (!isOpen) return null;

    return (
        <div className={AppStyles.modalOverlay + " z-[10000]"}>
            <div className={`${AppStyles.modalContent} max-w-md p-8 bg-[#111b21] border border-gray-700 animate-fade-in`}>
                
                <div className="text-center space-y-6">
                    <h2 className="text-2xl font-bold text-white mb-2">Vincular WhatsApp</h2>
                    
                    <p className="text-gray-400 text-sm">
                        Para enviar recibos automáticamente, abre WhatsApp en tu celular y escanea este código.
                    </p>

                    <div className="bg-white p-4 rounded-xl shadow-2xl mx-auto min-h-[250px] flex items-center justify-center">
                        {isLoading ? (
                            <span className="text-black font-bold animate-pulse">Cargando estado...</span>
                        ) : qrCode ? (
                            <QRCodeCanvas 
                                value={qrCode} 
                                size={220} 
                                level={"H"} 
                                includeMargin={true}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center text-black p-4">
                                <span className="text-2xl mb-2">⏳</span>
                                <span className="text-sm font-medium">Esperando QR del servidor...</span>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2 text-left bg-white/5 p-4 rounded-lg">
                        <p className="text-xs text-gray-400 leading-relaxed">
                            1. Abre WhatsApp en tu teléfono.<br/>
                            2. Toca <b>Menú</b> o <b>Configuración</b>.<br/>
                            3. Selecciona <b>Dispositivos vinculados</b>.<br/>
                            4. Toca <b>Vincular un dispositivo</b> y apunta aquí.
                        </p>
                    </div>

                    <Button 
                        variant="ghost" 
                        onClick={handleDismiss} 
                        className="text-gray-500 hover:text-white mt-2 text-xs uppercase tracking-widest"
                    >
                        Cerrar y verificar más tarde
                    </Button>
                </div>
            </div>
        </div>
    );
};