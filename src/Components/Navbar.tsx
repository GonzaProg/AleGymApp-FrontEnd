import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useNotificaciones } from "../Hooks/Notificaciones/useNotificaciones";
import { AppStyles } from "../Styles/AppStyles";
import { Bell, BellOff } from "lucide-react";
import CopaMundial from "../assets/CopaMundial.svg";

export const Navbar = () => {
  const navigate = useNavigate();
  const { notificaciones, unreadCount, markAsRead, refresh } = useNotificaciones();
  
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    <nav className="fixed w-full z-50 top-0 start-0 pt-safe pb-2 transition-all shadow-lg border-b-4 border-yellow-500" style={{ colorScheme: 'light' }}>
      {/* Usamos un <img> de fondo porque los WebViews de Android ignoran las etiquetas <img> en su algoritmo de Inversión de Modo Oscuro */}
      <img 
        src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 100' preserveAspectRatio='none'%3E%3Crect width='1' height='20' fill='%2375AADB'/%3E%3Crect y='20' width='1' height='60' fill='%23ffffff'/%3E%3Crect y='80' width='1' height='20' fill='%2375AADB'/%3E%3C/svg%3E" 
        className="absolute inset-0 w-full h-full object-cover z-0" 
        alt=""
      />
      <div className="max-w-screen-xl flex items-center justify-between mx-auto px-4 h-16 relative z-10">
        
        {/* --- TROFEO CENTRAL --- */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none mt-3">
          <img src={CopaMundial} alt="Copa Mundial" className="w-[140px] h-[140px] drop-shadow-md" />
        </div>

        {/* --- IZQUIERDA: LOGO MIXTO (TEXTO + IMAGEN) --- */}
        <div 
            onClick={() => navigate("/home")} 
            className="flex items-center cursor-pointer group z-20"
        >
            <span className="self-center text-2xl font-black whitespace-nowrap drop-shadow-md">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00AEEF] to-[#0071BC]">Gym</span>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF8C00] to-[#d3932b]">Mate</span>
            </span>
        </div>
        
        {/* --- DERECHA: NOTIFICACIONES --- */}
        <div className="flex items-center gap-4 z-20">
          <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="relative p-2 transition-colors hover:bg-black/5 rounded-full focus:outline-none"
            >
                <Bell className="w-7 h-7 text-[#EAB308] drop-shadow-md" />
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
                            <div className="p-8 text-center text-gray-500 text-sm flex flex-col items-center">
                                <BellOff className="w-8 h-8 mb-2 opacity-50" />
                                <p>No tienes notificaciones nuevas</p>
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