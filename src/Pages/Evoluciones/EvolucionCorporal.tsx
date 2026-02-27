import { AppStyles } from "../../Styles/AppStyles";
import { useEvolucionCorporal } from "../../Hooks/Evoluciones/useEvolucionCorporal";

export const EvolucionCorporal = ({ currentUser }: { currentUser: any }) => {
    const {
        historial,
        loading,
        saving,
        peso,
        setPeso,
        preview,
        handleFileChange,
        clearFile,
        handleGuardar,
        handleEliminar
    } = useEvolucionCorporal(currentUser);

    // Variable derivada para saber si el botón debe estar bloqueado
    const isButtonDisabled = saving || !peso || peso.trim() === "";

    return (
        <div className="space-y-6 p-2 animate-fade-in pb-10">
            {/* FORMULARIO DE CARGA */}
            <div className={AppStyles.glassCard}>
                <h3 className="text-white font-bold mb-4">➕ Añadir Nuevo Registro</h3>
                <form onSubmit={handleGuardar} className="space-y-6">
                    <div className="flex gap-4 items-start">
                        {/* INPUT PESO */}
                        <div className="flex-1 flex flex-col gap-2"> 
                            <label className="text-xs text-gray-400 font-bold ml-1 tracking-wide">Peso (kg)</label>
                            <input 
                                type="number" 
                                min={0}
                                step="1" 
                                value={peso} 
                                onChange={e => setPeso(e.target.value)}
                                className={`${AppStyles.inputDark} w-full text-lg font-bold h-12 px-4`}
                            />
                        </div>
                        
                        {/* INPUT FOTO */}
                        <div className="flex-1 flex flex-col gap-2"> 
                            <label className="text-xs text-gray-400 font-bold ml-1 tracking-wide">Foto (Opcional)</label>
                            <label className={`flex items-center justify-center border rounded-xl h-12 cursor-pointer transition-colors ${
                                preview 
                                    ? 'bg-green-500/20 border-green-500/50 text-green-400' 
                                    : 'bg-gray-900/50 border-white/10 hover:bg-white/5 text-gray-400'
                            }`}>
                                <span className="text-xl mr-2">{preview ? '✅' : '📷'}</span>
                                <span className="text-sm font-semibold">{preview ? 'Foto lista' : 'Subir foto'}</span>
                                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                            </label>
                        </div>
                    </div>
                    
                    {/* PREVIEW DE LA FOTO */}
                    {preview && (
                        <div className="relative w-full h-48 rounded-xl overflow-hidden border border-white/10 shadow-lg">
                            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                            <button 
                                type="button" 
                                onClick={clearFile} 
                                className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 transition-colors p-2 rounded-full text-white shadow-md flex items-center justify-center w-8 h-8"
                            >
                                ✕
                            </button>
                        </div>
                    )}

                    {/* BOTÓN CON ESTADO DESACTIVADO MEJORADO */}
                    <button 
                        type="submit" 
                        disabled={isButtonDisabled} 
                        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all duration-300 ${
                            isButtonDisabled 
                                ? 'bg-gray-700 text-gray-500 cursor-not-allowed border border-gray-600' 
                                : `${AppStyles.btnPrimary}` 
                        }`}
                    >
                        {saving ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Guardando...
                            </>
                        ) : (
                            "Guardar Progreso"
                        )}
                    </button>
                </form>
            </div>

            {/* HISTORIAL */}
            <div className="mt-6 p-2 animate-fade-in pb-24 space-y-6 max-w-lg mx-auto relative">
                <h3 className="text-gray-400 font-bold text-sm uppercase tracking-wider mb-4 ml-1">Historial</h3>
                
                {loading ? (
                    <div className="flex flex-col gap-4 animate-pulse">
                        {[1, 2, 3].map(i => (
                            <div key={i} className={`${AppStyles.glassCard} h-28 opacity-50`}></div>
                        ))}
                    </div>
                ) : historial.length === 0 ? (
                    <div className={`${AppStyles.glassCard} text-center py-10 border-dashed border-2 border-white/10`}>
                        <span className="text-5xl block mb-3 opacity-50">⚖️</span>
                        <p className="text-gray-400 font-medium">Aún no has registrado tu progreso.</p>
                        <p className="text-gray-500 text-sm mt-1">¡Comienza hoy mismo!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {historial.map(item => (
                            <div key={item.id} className={`${AppStyles.glassCard} p-4 flex gap-4 items-center relative overflow-hidden group`}>
                                {/* Decoración sutil de fondo */}
                                <div className="absolute -right-10 -top-10 w-32 h-32 bg-green-500/5 rounded-full blur-2xl pointer-events-none"></div>

                                {item.fotoUrl ? (
                                    <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden border-2 border-white/5 shadow-md">
                                        <img src={item.fotoUrl} alt="Evolución" className="w-full h-full object-cover" loading="lazy" />
                                    </div>
                                ) : (
                                    <div className="w-20 h-20 shrink-0 rounded-xl bg-gray-800/80 border border-white/5 flex flex-col items-center justify-center text-gray-500 shadow-inner">
                                        <span className="text-2xl mb-1">⚖️</span>
                                        <span className="text-[10px] uppercase font-bold tracking-wider">Sin foto</span>
                                    </div>
                                )}
                                
                                <div className="flex-1">
                                    <p className="text-3xl font-black text-white tracking-tight">
                                        {item.peso} <span className="text-sm text-green-400 font-bold tracking-normal uppercase ml-1">kg</span>
                                    </p>
                                    
                                    <div className="flex items-center gap-2 mt-1 text-xs font-medium text-gray-400">
                                        <span>📅 {new Date(item.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={() => handleEliminar(item.id)} 
                                    className={AppStyles.btnDelete}
                                    title="Eliminar registro"
                                >
                                    🗑️
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};