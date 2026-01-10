export const RenewPlanStyles = {
    // --- BUSCADOR HERO (Más grande que el input normal) ---
    searchWrapper: "max-w-2xl mx-auto relative group",
    searchGlow: "absolute -inset-1 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000",
    searchInput: "w-full bg-gray-800/80 border border-gray-600 text-white placeholder-gray-500 rounded-lg py-4 px-6 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all text-lg shadow-xl backdrop-blur-md relative z-10",

    // --- AVATAR GRANDE ---
    avatarContainer: "w-16 h-16 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-2xl border-2 border-green-500 shadow-lg shadow-green-500/20 overflow-hidden relative",
    avatarImg: "w-full h-full object-cover",
    avatarFallback: "font-bold text-white",

    // --- CARD: PLAN ACTIVO ---
    activePlanCard: "bg-gradient-to-br from-green-900/40 to-gray-900/40 border border-green-500/30 rounded-xl p-6 relative overflow-hidden group",
    activePlanDecor: "absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none",
    activeLabel: "text-green-400 uppercase tracking-widest text-xs font-bold mb-2",
    activePrice: "text-3xl font-bold text-white mb-4",
    
    // Renglones de info (Vencimiento, Precio, Estado)
    infoRow: "flex justify-between border-b border-white/5 pb-2",
    infoValue: "text-white font-mono",

    // Badges de estado
    badgeVencido: "bg-red-500/20 text-red-400 px-2 py-0.5 rounded text-xs font-bold",
    badgeActivo: "bg-green-500/20 text-green-400 px-2 py-0.5 rounded text-xs font-bold",

    // --- GRID: PLANES DISPONIBLES ---
    plansGrid: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
    planOptionCard: "bg-gray-700/30 hover:bg-gray-700/60 border border-white/5 hover:border-green-500/50 rounded-xl p-6 cursor-pointer transition-all hover:-translate-y-1 group",
    planOptionTitle: "text-xl font-bold text-white group-hover:text-green-400 transition",
    planOptionPrice: "text-2xl font-bold text-gray-200 mt-2",
    planOptionDuration: "text-sm text-gray-400 mt-1",
    
    // Botón específico de la tarjeta de selección
    btnSelect: "mt-4 w-full py-2 rounded-lg bg-gray-600 group-hover:bg-green-600 text-white text-sm font-bold transition",

    // --- MENSAJES ---
    emptyStateBox: "bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6 text-center",
    emptyStateText: "text-yellow-200 text-sm",
};