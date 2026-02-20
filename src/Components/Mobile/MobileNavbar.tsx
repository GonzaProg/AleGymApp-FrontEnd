
interface MobileNavbarProps {
  activeTab: number;
  setActiveTab: (index: number) => void;
}

export const MobileNavbar = ({ activeTab, setActiveTab }: MobileNavbarProps) => {

  const navItems = [
    { icon: "💪", label: "Rutinas", index: 0 },
    { icon: "🥇", label: "PR", index: 1},
    { icon: "💎", label: "Mi Plan", index: 2 },
    { icon: "👤", label: "Perfil", index: 3 },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-gray-900/95 backdrop-blur-md border-t border-white/10 pb-safe pt-2 px-6 z-50 flex justify-around items-center h-20 shadow-2xl">
      {navItems.map((item) => {
        const isActive = activeTab === item.index;
        return (
          <button
            key={item.index}
            onClick={() => setActiveTab(item.index)}
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${
              isActive ? "text-green-400 scale-110" : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <span className={`text-2xl ${isActive ? "animate-bounce-short" : ""}`}>
              {item.icon}
            </span>
            <span className="text-[10px] font-bold tracking-wide uppercase">
              {item.label}
            </span>
            {isActive && (
              <span className="absolute -bottom-2 w-1 h-1 bg-green-500 rounded-full shadow-[0_0_8px_#22c55e]" />
            )}
          </button>
        );
      })}
    </div>
  );
};