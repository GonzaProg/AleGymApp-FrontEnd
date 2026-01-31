import { useState, useEffect } from "react";

export const GymLockedScreen = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Escuchamos el evento personalizado que lanzará Axios
    const handleLock = () => setIsVisible(true);
    
    window.addEventListener("GYM_LOCKED_EVENT", handleLock);

    // Verificamos si ya estaba bloqueado en sessionStorage (por si recarga la página)
    if (sessionStorage.getItem("IS_GYM_LOCKED") === "true") {
      setIsVisible(true);
    }

    return () => window.removeEventListener("GYM_LOCKED_EVENT", handleLock);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-gray-900 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
      {/* Capa de fondo con blur */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      <div className="relative z-10 max-w-lg bg-gray-800 border border-red-500/50 p-8 rounded-2xl shadow-2xl shadow-red-900/20">
        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">🔒</span>
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">Servicio Suspendido</h1>
        <p className="text-red-400 font-semibold text-lg mb-6">
          Acceso al Gimnasio Bloqueado
        </p>

        <p className="text-gray-300 mb-8 leading-relaxed">
          Estimado cliente, el servicio ha sido pausado temporalmente debido a un saldo pendiente o vencimiento de la suscripción del software.
          <br /><br />
          Para restablecer el acceso inmediato al sistema, por favor regularice su situación administrativa.
        </p>

        <div className="flex flex-col gap-3">
          <button 
            onClick={() => window.open("https://wa.me/549XXXXXXXX", "_blank")}
            className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition flex items-center justify-center gap-2"
          >
            <span>💬</span> Contactar Soporte / Realizar Pago
          </button>
          
        </div>
      </div>
    </div>
  );
};