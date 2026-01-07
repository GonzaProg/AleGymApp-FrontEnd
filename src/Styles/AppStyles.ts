export const AppStyles = {
    // --- LAYOUT PRINCIPAL ---
    pageContainer: "relative min-h-screen font-sans bg-gray-900 text-gray-200",
    fixedBackground: "fixed inset-0 z-0 bg-cover bg-center bg-fixed brightness-[0.3] contrast-[1.1]",
    contentContainer: "relative z-10 pt-28 pb-10 px-4 w-full flex justify-center",
    
    // --- TEXTOS ---
    title: "text-4xl font-bold text-white mb-8 tracking-tight drop-shadow-lg text-center",
    highlight: "text-green-500",
    
    // --- COMPONENTES UI COMPARTIDOS ---
    glassCard: "w-full backdrop-blur-xl bg-gray-900/80 border border-white/10 rounded-2xl shadow-xl p-8 relative overflow-hidden",
    
    // Inputs
    inputDark: "w-full bg-black/30 border border-white/10 text-white focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 p-3 rounded-lg outline-none transition-all placeholder-gray-500",
    label: "block text-gray-400 text-xs uppercase font-bold tracking-wider mb-2",
    
    // Botones
    btnPrimary: "bg-green-600/70 hover:bg-green-500 text-white font-bold px-14 py-3 rounded-xl shadow-lg shadow-green-900/20 border border-green-500/20 transition-all hover:scale-[1.02]",
    btnSecondary: "bg-gray-700/50 hover:bg-gray-700 text-gray-300 font-bold px-6 py-3 rounded-xl border border-white/5 transition-all",
    btnDanger: "bg-red-600/80 hover:bg-red-500 text-white shadow-lg shadow-red-900/20 px-20 py-3 rounded-xl border border-red-500/20 font-bold transition-all hover:scale-105",

    // Decoración
    gradientDivider: "absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500/50 to-transparent",
    sectionTitle: "text-xl font-bold text-white border-b border-white/10 pb-4 mb-6 flex items-center gap-2",
    numberBadge: "bg-green-600/20 text-green-500 py-1 px-3 rounded-lg text-sm",
    
    // LISTAS Y SUGERENCIAS (Buscador)
    suggestionsList: "absolute z-20 w-full backdrop-blur-xl bg-gray-900/95 border border-white/10 rounded-xl shadow-2xl mt-1 max-h-60 overflow-y-auto overflow-x-hidden thin-scrollbar",
    suggestionItem: "p-3 hover:bg-green-600/20 cursor-pointer border-b border-white/5 transition-colors flex items-center gap-3 group",
    avatarSmall: "w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold text-white border border-white/10 group-hover:border-green-500/50",

    // TABLAS (Resumen Rutina)
    tableHeader: "bg-black/40 text-gray-300 uppercase text-xs font-bold tracking-wider",
    tableRow: "hover:bg-white/5 transition-colors border-b border-white/5 last:border-0",

    // MODAL BASE
    modalOverlay: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in",
    modalContent: "bg-gray-900 w-full max-w-3xl rounded-2xl shadow-2xl border border-white/10 flex flex-col max-h-[90vh] overflow-hidden",

    // Alertas
    errorBox: "bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-lg mb-6 flex items-center gap-3",
    infoBox: "mt-2 flex items-center gap-2 text-yellow-500/80 bg-yellow-500/10 p-2 rounded-lg border border-yellow-500/20 text-xs font-bold",

    // Botones de acción en listas (Editar/Borrar/Guardar/Cancelar pequeños)
    actionBtnBase: "px-3 py-1 rounded-lg text-sm transition-all border",
    
    btnSave: "bg-green-600/20 text-green-500 hover:bg-green-600 hover:text-white border-green-500/30",
    btnCancel: "bg-gray-700 text-gray-300 hover:bg-gray-600 border-transparent",
    btnBack: "text-gray-400 hover:text-white flex items-center gap-2 transition-colors text-sm font-bold uppercase tracking-widest cursor-pointer",
    
    btnIconBase: "p-2 rounded-lg transition-all border",
    btnEdit: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500 hover:text-black border-yellow-500/20",
    btnDelete: "bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border-red-500/20",
};