interface MobileNavbarProps {
  activeTab: number;
  setActiveTab: (index: number) => void;
}

export const MobileNavbar = ({ activeTab, setActiveTab }: MobileNavbarProps) => {
  const navItems = [
    { id: "inicio", label: "Inicio", index: 0, Icon: HomeIcon },
    { id: "rutinas", label: "Rutinas", index: 1, Icon: DumbbellIcon },
    { id: "pr", label: "PR", index: 2, Icon: MedalIcon },
    { id: "plan", label: "Mi Plan", index: 3, Icon: PlanIcon },
    { id: "perfil", label: "Perfil", index: 4, Icon: UserIcon },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-gray-900/95 backdrop-blur-md border-t border-white/10 px-6 z-50 flex justify-around items-center pb-safe pt-2 min-h-[5rem] shadow-2xl">
      {navItems.map((item) => {
        const isActive = activeTab === item.index;
        const IconComponent = item.Icon;

        return (
          <button
            key={item.index}
            onClick={() => setActiveTab(item.index)}
            className={`flex flex-col items-center gap-1 transition-all duration-300 relative pb-2 ${
              isActive ? "text-white scale-110" : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {/* Contenedor del icono con animación de rebote al activar */}
            <div className={`transition-transform duration-300 ${isActive ? "animate-bounce-short" : ""}`}>
              <IconComponent isActive={isActive} />
            </div>
            
            <span className={`text-[10px] font-bold tracking-wide uppercase transition-colors ${isActive ? "text-white" : "text-gray-500"}`}>
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

// ICONOS SVG DE GEOMETRÍA UNIFICADA
// Propiedades comunes para garantizar que la transición sea solo de color/relleno
const getIconProps = (isActive: boolean) => ({
    fill: isActive ? "currentColor" : "none", // Relleno si está activo
    stroke: "currentColor", // El color del trazo es el actual (gris o blanco)
    strokeWidth: isActive ? "0" : "1.5", // Si está relleno, quitamos el trazo. Si está vacío, trazo fino.
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
});

const HomeIcon = ({ isActive }: { isActive: boolean }) => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" {...getIconProps(isActive)}>
    {/* Una sola forma cerrada que representa la casa con la puerta */}
    <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z" />
  </svg>
);

const DumbbellIcon = ({ isActive }: { isActive: boolean }) => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" {...getIconProps(isActive)}>
    {/* Forma unificada de la mancuerna */}
    <path d="M6.5 6h-2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-1h8v1a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v1h-8v-1a2 2 0 0 0-2-2z" />
  </svg>
);

// NUEVO ICONO DE MEDALLA
const MedalIcon = ({ isActive }: { isActive: boolean }) => (
  <svg viewBox="0 0 24 24" className="w-6 h-6">
    {/* 1. Silueta principal (Cinta y Círculo) */}
    <g 
      fill={isActive ? "currentColor" : "none"} 
      stroke="currentColor" 
      strokeWidth={isActive ? "0" : "1.5"} 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15" />
      <circle cx="12" cy="17" r="5" />
    </g>

    {/* 2. Detalles internos (Líneas y el número 1) */}
    <g 
      fill="none" 
      // TRUCO: Cuando está activo, pintamos los detalles internos del color del navbar (#111827)
      stroke={isActive ? "#111827" : "currentColor"} 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M11 12 5.12 2.2" />
      <path d="m13 12 5.88-9.8" />
      <path d="M8 7h8" />
      <path d="M12 18v-2h-.5" />
    </g>
  </svg>
);
const PlanIcon = ({ isActive }: { isActive: boolean }) => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" {...getIconProps(isActive)}>
    {/* Forma de documento con check */}
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
    <polyline points="14 2 14 8 20 8" fill="none" stroke={isActive ? "gray" : "currentColor"} strokeWidth="1.5" /> {/* El pliegue siempre es línea */}
    <path d="M9 13l2 2 4-4" fill="none" stroke={isActive ? "gray" : "currentColor"} strokeWidth="2" /> {/* El check siempre es línea */}
  </svg>
);

const UserIcon = ({ isActive }: { isActive: boolean }) => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" {...getIconProps(isActive)}>
    {/* Forma unificada de persona (círculo + cuerpo) */}
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
  </svg>
);