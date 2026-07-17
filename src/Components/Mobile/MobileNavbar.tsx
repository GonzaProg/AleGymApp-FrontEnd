import { Dumbbell, Medal, User } from "lucide-react";
import PelotaFutbol from "../../assets/PelotaFutbol.svg";

interface MobileNavbarProps {
  activeTab: number;
  setActiveTab: (index: number) => void;
}

export const MobileNavbar = ({ activeTab, setActiveTab }: MobileNavbarProps) => {
  const navItems = [
    { id: "inicio", label: "Inicio", index: 0, Icon: HomeIcon },
    { id: "rutinas", label: "Rutinas", index: 1, Icon: DumbbellIcon },
    { id: "progreso", label: "Progreso", index: 2, Icon: MedalIcon },
    { id: "perfil", label: "Perfil", index: 3, Icon: UserIcon },
  ];

  return (
    <div 
      className="fixed bottom-0 left-0 w-full backdrop-blur-md border-t border-white/10 px-6 z-50 flex justify-around items-center pt-2 pb-safe min-h-[5rem] shadow-[0_-5px_20px_rgba(0,0,0,0.5)] overflow-hidden"
      style={{
        backgroundColor: '#125212', // Oscurecido para resaltar iconos blancos
        backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 15px, rgba(255,255,255,0.2) 15px, rgba(255,255,255,0.2) 18px), repeating-linear-gradient(-45deg, transparent, transparent 15px, rgba(255,255,255,0.2) 15px, rgba(255,255,255,0.2) 18px)`
      }}
    >
      {/* Pelota Izquierda */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-24 h-24 pointer-events-none opacity-90 z-0">
        <img src={PelotaFutbol} alt="Pelota" className="w-full h-full drop-shadow-lg" />
      </div>
      {/* Pelota Derecha */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-24 h-24 pointer-events-none opacity-90 z-0">
        <img src={PelotaFutbol} alt="Pelota" className="w-full h-full drop-shadow-lg" />
      </div>
      {navItems.map((item) => {
        const isActive = activeTab === item.index;
        const IconComponent = item.Icon;

        return (
          <button
            key={item.index}
            onClick={() => setActiveTab(item.index)}
            className={`flex flex-col items-center gap-1 transition-all duration-300 relative pb-2 z-10 ${
              isActive ? "text-white scale-110 drop-shadow-xl font-black" : "text-white/70 hover:text-white drop-shadow-sm font-bold"
            }`}
          >
            {/* Contenedor del icono con animación de rebote al activar */}
            <div className={`transition-transform duration-300 ${isActive ? "animate-bounce-short" : ""}`}>
              <IconComponent isActive={isActive} />
            </div>
            
            <span className={`text-[10px] tracking-wide uppercase transition-colors ${isActive ? "text-white font-black" : "text-white/70 font-bold"}`}>
              {item.label}
            </span>

            {/* Puntito indicador verde */}
            {isActive && (
              <span className="absolute -bottom-1 w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_#22c55e] transition-all duration-300" />
            )}
          </button>
        );
      })}
    </div>
  );
};

// Propiedades comunes para garantizar que la transición sea solo de color/relleno
const getIconProps = (isActive: boolean) => ({
    fill: isActive ? "currentColor" : "none", // Relleno si está activo
    stroke: "currentColor", // El color del trazo es el actual (gris o blanco)
    strokeWidth: isActive ? 0 : 1.5, // Si está relleno, quitamos el trazo. Si está vacío, trazo fino. Note that Lucide expects a number.
    className: "w-6 h-6 transition-all duration-300"
});

const HomeIcon = ({ isActive }: { isActive: boolean }) => (
  <svg viewBox="0 0 24 24" {...getIconProps(isActive)} strokeLinecap="round" strokeLinejoin="round">
    {/* Una sola forma cerrada que representa la casa con la puerta */}
    <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z" />
  </svg>
);

const DumbbellIcon = ({ isActive }: { isActive: boolean }) => (
  <Dumbbell {...getIconProps(isActive)} />
);

// NUEVO ICONO DE MEDALLA - Hacemos un mapping similar
const MedalIcon = ({ isActive }: { isActive: boolean }) => (
  <Medal {...getIconProps(isActive)} />
);

const UserIcon = ({ isActive }: { isActive: boolean }) => (
  <User {...getIconProps(isActive)} />
);