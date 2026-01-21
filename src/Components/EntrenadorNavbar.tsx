import { useState, useEffect, useRef } from "react";
import { useNotificaciones } from "../Hooks/Notificaciones/useNotificaciones";
import { AppStyles } from "../Styles/AppStyles";

// Icono Campanita
const BellIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path fillRule="evenodd" d="M5.25 9a6.75 6.75 0 0 1 13.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 0 1-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 1 1-7.48 0 24.585 24.585 0 0 1-4.831-1.244.75.75 0 0 1-.298-1.205A8.217 8.217 0 0 0 5.25 9.75V9Zm4.502 8.9a2.25 2.25 0 1 0 4.496 0 25.057 25.057 0 0 1-4.496 0Z" clipRule="evenodd" />
  </svg>
);

interface EntrenadorNavbarProps {
  title: string;
  user: any;
}

export const EntrenadorNavbar = ({ title, user }: EntrenadorNavbarProps) => {
  
  // --- LÓGICA DE NOTIFICACIONES ---
  const { notificaciones, unreadCount, markAsRead, refresh } = useNotificaciones();
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer clic fuera
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
    markAsRead(notif.id);
    if (notif.mensaje.length > 60) {
      setSelectedNotif(notif);
      setShowDropdown(false);
    }
  };

  return (
    <>
      {/* --- HEADER BAR --- */}
      <header className="h-20 px-8 flex items-center justify-between border-b border-white/5 bg-gray-900/85 relative shrink-0 z-40">
        
        {/* Título (Sin posición absoluta, flujo normal a la izquierda) */}
        <h1 className={AppStyles.title +" font-bold capitalize"}>
          {title.replace('_', ' ')}
        </h1>

        <div className="flex items-center gap-4">
          
          {/* --- CAMPANITA + DROPDOWN --- */}
          <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="relative w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-300 hover:text-white hover:bg-gray-700 transition focus:outline-none"
            >
                <BellIcon />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-pulse border border-gray-900"></span>
                )}
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-fade-in origin-top-right ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="p-4 border-b border-white/10 bg-black/20 flex justify-between items-center">
                        <h3 className="text-sm font-bold text-white">Notificaciones</h3>
                        <button onClick={refresh} className="text-xs text-green-400 hover:underline">Refrescar</button>
                    </div>
                    
                    <div className="max-h-80 overflow-y-auto custom-scrollbar">
                        {notificaciones.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 text-sm">
                                <p>🔕 Sin novedades</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-white/5">
                                {notificaciones.map((n) => (
                                    <li 
                                        key={n.id} 
                                        onClick={() => handleNotifClick(n)}
                                        className={`p-4 hover:bg-white/5 cursor-pointer transition-colors relative ${!n.leida ? 'bg-green-500/5' : ''}`}
                                    >
                                        <div className="flex gap-3">
                                            {!n.leida && <div className="mt-1.5 w-2 h-2 rounded-full bg-green-500 shrink-0 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>}
                                            <div className={`${!n.leida ? '' : 'pl-2'} w-full`}>
                                                <p className={`text-sm mb-1 ${!n.leida ? 'text-white font-bold' : 'text-gray-300 font-medium'}`}>
                                                    {n.titulo}
                                                </p>
                                                <p className="text-xs text-gray-400 line-clamp-2">
                                                    {n.mensaje}
                                                </p>
                                                <span className="text-[10px] text-gray-600 mt-2 block">
                                                    {new Date(n.fechaCreacion).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}
          </div>

          {/* --- MINI PERFIL --- */}
          <div className="flex items-center gap-3 pl-4 border-l border-gray-700">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-white">{user.nombre}</p>
              <p className="text-xs text-green-400">{user.rol || "Entrenador"}</p>
            </div>
            
            <div className="relative group cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-gray-900 font-bold hover:scale-105 transition-transform">
                  {user.fotoPerfil ? (
                    <img src={user.fotoPerfil} alt="User" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <span>{user.nombre?.charAt(0) || "U"}</span>
                  )}
                </div>
            </div>
          </div>

        </div>
      </header>

      {/* --- MODAL DE LECTURA --- */}
      {selectedNotif && (
        <div className={`${AppStyles.modalOverlay} z-[100]`} onClick={() => setSelectedNotif(null)}>
            <div 
                className={`${AppStyles.modalContent} max-w-lg w-full mx-4 overflow-hidden bg-[#1a1a2e] border-white/10`} 
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b border-white/10 bg-gradient-to-r from-gray-800 to-gray-900 flex justify-between items-start">
                    <h3 className="text-xl font-bold text-white pr-4">{selectedNotif.titulo}</h3>
                    <button onClick={() => setSelectedNotif(null)} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
                </div>
                
                <div className="p-6 overflow-y-auto custom-scrollbar max-h-[60vh]">
                    <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap break-words break-all">
                        {selectedNotif.mensaje}
                    </p>
                    <p className="text-right text-xs text-gray-500 mt-6 pt-4 border-t border-white/5">
                        Recibido el: {new Date(selectedNotif.fechaCreacion).toLocaleString()}
                    </p>
                </div>
                
                <div className="p-4 bg-gray-900/50 text-right border-t border-white/5">
                    <button onClick={() => setSelectedNotif(null)} className={AppStyles.btnSecondary + " py-2 px-6 text-sm"}>
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
      )}
    </>
  );
};