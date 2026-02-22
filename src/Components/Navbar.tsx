import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../API/axios";
import { useNotificaciones } from "../Hooks/Notificaciones/useNotificaciones";
import { AppStyles } from "../Styles/AppStyles";
import { CloudinaryApi } from "../Helpers/Cloudinary/Cloudinary"; 

// Icono Campanita código SVG
const BellIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path fillRule="evenodd" d="M5.25 9a6.75 6.75 0 0 1 13.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 0 1-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 1 1-7.48 0 24.585 24.585 0 0 1-4.831-1.244.75.75 0 0 1-.298-1.205A8.217 8.217 0 0 0 5.25 9.75V9Zm4.502 8.9a2.25 2.25 0 1 0 4.496 0 25.057 25.057 0 0 1-4.496 0Z" clipRule="evenodd" />
  </svg>
);

export const Navbar = () => {
  const navigate = useNavigate();
  const { notificaciones, unreadCount, markAsRead, refresh } = useNotificaciones();
  
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [gymLogo, setGymLogo] = useState<string | null>(null);

  useEffect(() => {
    const fetchGymData = async () => {
        try {
            const codigoAcceso = localStorage.getItem("GYMMATE_LOCAL_CODE"); 
            if (codigoAcceso) {
                const { data } = await api.get(`/gyms/by-code/${codigoAcceso}`);
                if (data && data.logoUrl) {
                    const logoUrlProcesada = CloudinaryApi.getUrl(data.logoUrl);
                    setGymLogo(logoUrlProcesada);
                }
            }
        } catch (error) {
            console.error("No se pudo cargar el logo del gym", error);
        }
    };
    fetchGymData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotifClick = (notif: any) => {
    if (!notif.leida) markAsRead(notif.id);
    if (notif.mensaje.length > 100) {
        setSelectedNotif(notif);
        setShowDropdown(false);
    }
  };

  return (
    <>
    <nav className="fixed w-full z-50 top-0 start-0 bg-gradient-to-b from-gray-900 via-gray-900/90 to-transparent pb-8 transition-all">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4 relative">
        
        {/* --- IZQUIERDA: LOGO MIXTO (TEXTO + IMAGEN) --- */}
        <div 
            onClick={() => navigate("/home")} 
            className="flex items-center cursor-pointer group z-20"
        >
            {/* 1. SIEMPRE EL TEXTO GYMMATE */}
            <span className="self-center text-2xl font-semibold whitespace-nowrap text-white group-hover:text-gray-200 transition-colors">
                Gym<span className="text-green-500 group-hover:text-green-400">Mate</span>
            </span>

            {/* 2. LOGO DEL GYM A LA DERECHA (Si existe) */}
            {gymLogo && (
                <div className="flex items-center ml-3 pl-3 border-l border-white/20 h-10 animate-fade-in">
                    <img 
                        src={gymLogo} 
                        alt="Logo Gym"
                        // CAMBIO: Aumentado a h-12 (aprox 48px) y w-auto. 
                        // Puedes probar h-14 si lo quieres aún más grande.
                        className="h-14 w-auto object-contain transition-transform group-hover:scale-105"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            setGymLogo(null); 
                        }}
                    />
                </div>
            )}
        </div>
        
        {/* --- DERECHA: NOTIFICACIONES --- */}
        <div className="flex items-center gap-4 z-20">
          <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="relative p-2 text-gray-300 hover:text-white transition-colors hover:bg-white/10 rounded-full focus:outline-none"
            >
                <BellIcon />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full animate-pulse shadow-red-500/50 shadow-lg">
                        {unreadCount}
                    </span>
                )}
            </button>

            {showDropdown && (
                <div className="absolute -right-28 top-full mt-2 transform -translate-x-1/2 w-64 sm:w-80 md:w-96 max-w-[90vw] bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-fade-in origin-top ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="p-4 border-b border-white/10 bg-black/20">
                        <h3 className="text-sm font-bold text-white">Notificaciones</h3>
                    </div>
                    <div className={`max-h-80 ${AppStyles.customScrollbar}`}>
                        {notificaciones.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 text-sm">
                                <p>🔕 No tienes notificaciones nuevas</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-white/5">
                                {notificaciones.map((n) => (
                                    <li key={n.id} onClick={() => handleNotifClick(n)} className={`p-4 hover:bg-white/5 cursor-pointer transition-colors relative group ${!n.leida ? 'bg-green-500/5' : ''}`}>
                                        {!n.leida && <span className="absolute left-2 top-4 w-2 h-2 rounded-full bg-green-500 shadow-green-500/50 shadow-md"></span>}
                                        <div className="ml-3">
                                            <p className={`text-sm mb-1 ${!n.leida ? 'text-white font-bold' : 'text-gray-300 font-medium'}`}>{n.titulo}</p>
                                            <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{n.mensaje}</p>
                                            <span className="text-[10px] text-gray-600 mt-2 block">{new Date(n.fechaCreacion).toLocaleDateString()}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div className="p-2 bg-black/20 text-center border-t border-white/10">
                        <button onClick={refresh} className="text-xs text-green-500/70 hover:text-green-400 transition-colors">Actualizar lista ↻</button>
                    </div>
                </div>
            )}
          </div>
        </div>
      </div>
    </nav>

    {selectedNotif && (
        <div className={AppStyles.modalOverlay} onClick={() => setSelectedNotif(null)}>
            <div className={AppStyles.modalContent + " max-w-2xl w-full mx-4"} onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-green-900/20 to-transparent">
                    <h3 className="text-2xl font-bold text-white break-words w-11/12">{selectedNotif.titulo}</h3>
                    <button onClick={() => setSelectedNotif(null)} className="text-gray-400 hover:text-white text-3xl transition-colors">&times;</button>
                </div>
                <div className="p-8 overflow-y-auto max-h-[70vh]">
                    <p className="text-gray-200 text-lg leading-relaxed break-words">{selectedNotif.mensaje}</p>
                    <p className="text-right text-sm text-gray-500 mt-8 pt-4 border-t border-white/5">Recibido el: {new Date(selectedNotif.fechaCreacion).toLocaleString()}</p>
                </div>
                <div className="p-4 bg-black/20 text-right">
                    <button onClick={() => setSelectedNotif(null)} className={AppStyles.btnSecondary + " py-2 px-8 text-base"}>Cerrar</button>
                </div>
            </div>
        </div>
    )}
    </>
  );
};