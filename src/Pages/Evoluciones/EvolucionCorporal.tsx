import { createPortal } from "react-dom"; 
import { AppStyles } from "../../Styles/AppStyles";
import { useEvolucionCorporal } from "../../Hooks/Evoluciones/useEvolucionCorporal";

export const EvolucionCorporal = ({ currentUser }: { currentUser: any }) => {
    const {
        historial, loading, loadingMore, saving,
        peso, setPeso, preview,
        handleFileChange, clearFile,
        isFormOpen, setIsFormOpen, resetForm,
        fotoSeleccionada, setFotoSeleccionada,
        mostrarTodos, handleVerTodos, todosCargados,
        handleGuardar, handleEliminar
    } = useEvolucionCorporal(currentUser);

    const isButtonDisabled = saving || !peso || peso.trim() === "";

    // Cortamos visualmente el array si "mostrarTodos" es falso. 
    const registrosVisibles = mostrarTodos ? historial : historial.slice(0, 5);

    return (
        <div className="mt-6 p-2 animate-fade-in pb-24 space-y-6 max-w-lg mx-auto relative">
            
            {/* FORMULARIO DE CARGA (DESPLEGABLE) */}
            <div className={`${AppStyles.glassCard} p-0 overflow-hidden`}>
                
                {/* Botón Cabecera del Acordeón */}
                <button 
                    onClick={() => {
                        if (isFormOpen && (peso || preview)) {
                            resetForm();
                        } else {
                            setIsFormOpen(!isFormOpen);
                        }
                    }}
                    className="w-full p-5 flex items-center justify-between hover:bg-white/5 transition-colors rounded-2xl"
                >
                    <h3 className="text-white font-bold flex items-center gap-2">
                        ➕ Añadir Nuevo Registro
                    </h3>
                    <span className={`text-gray-400 transition-transform duration-300 ${isFormOpen ? 'rotate-180' : ''}`}>
                        ▼
                    </span>
                </button>

                {/* Contenido del Formulario (Animado) */}
                <div className={`transition-all duration-500 ease-in-out px-5 ${isFormOpen ? 'max-h-[800px] opacity-100 pb-5' : 'max-h-0 opacity-0'}`}>
                    <form onSubmit={handleGuardar} className="space-y-6 pt-4 border-t border-white/10">
                        <div className="flex gap-4 items-start">
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
                            
                            <div className="flex-1 flex flex-col gap-2"> 
                                <label className="text-xs text-gray-400 font-bold ml-1 tracking-wide">Foto (Opcional)</label>
                                <label className={`flex items-center justify-center border rounded-xl h-12 cursor-pointer transition-colors ${
                                    preview 
                                        ? 'bg-green-500/20 border-green-500/50 text-green-400' 
                                        : 'bg-gray-900/50 border-white/10 hover:bg-white/5 text-gray-400'
                                }`}>
                                    <span className="text-xl mr-2">{preview ? '✅' : '📷'}</span>
                                    <span className="text-sm font-semibold">{preview ? 'Foto lista' : 'Subir'}</span>
                                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                                </label>
                            </div>
                        </div>
                        
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
            </div>

            {/* HISTORIAL */}
            <div className="space-y-4">
                <h3 className="text-gray-400 font-bold text-sm uppercase tracking-wider pl-2">
                    {mostrarTodos ? "Todos los registros" : "Últimos registros"}
                </h3>
                
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
                    <>
                        {registrosVisibles.map(item => (
                            <div key={item.id} className="bg-gray-800/50 border border-white/5 rounded-2xl p-4 flex gap-4 items-center relative overflow-hidden group">
                                
                                {/* Decoración sutil de fondo */}
                                <div className="absolute -right-10 -top-10 w-32 h-32 bg-green-500/5 rounded-full blur-2xl pointer-events-none"></div>

                                {/* CONTENEDOR DE FOTO CLICABLE */}
                                <div 
                                    onClick={() => item.fotoUrl ? setFotoSeleccionada(item.fotoUrl) : null}
                                    className={`w-20 h-20 bg-black/50 shrink-0 rounded-xl overflow-hidden relative flex items-center justify-center border border-white/10 transition-colors ${item.fotoUrl ? 'cursor-pointer hover:border-green-500' : ''}`}
                                >
                                    {item.fotoUrl ? (
                                        <>
                                            <img src={item.fotoUrl} alt="Evolución" className="w-full h-full object-cover" loading="lazy" />
                                            {/* Icono de Lupa sutil sobre la foto */}
                                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                <span className="text-white text-xl drop-shadow-md">🔍</span>
                                            </div>
                                        </>
                                    ) : (
                                        <span className="text-3xl text-gray-600 opacity-50">⚖️</span>
                                    )}
                                </div>
                                
                                <div className="flex-1 z-10">
                                    <p className="text-3xl font-black text-white tracking-tight">
                                        {item.peso} <span className="text-sm text-green-400 font-bold tracking-normal uppercase ml-1">kg</span>
                                    </p>
                                    <div className="flex items-center gap-2 mt-1 text-xs font-medium text-gray-400">
                                        <span>📅 {new Date(item.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                    </div>
                                </div>
                                
                                <div className="flex flex-col gap-2 shrink-0 z-10">
                                    <button onClick={() => handleEliminar(item.id)} className={AppStyles.btnDelete} title="Eliminar registro">
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* BOTÓN VER TODOS / VER MENOS */}
                        {(!todosCargados || historial.length > 5) && (
                            <button 
                                onClick={handleVerTodos}
                                disabled={loadingMore}
                                className="w-full mt-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
                            >
                                {loadingMore ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Cargando todos...
                                    </>
                                ) : mostrarTodos ? (
                                    "Ver menos ▲"
                                ) : (
                                    "Ver historial completo ▼"
                                )}
                            </button>
                        )}
                    </>
                )}
            </div>

            {/* MODAL FOTO PANTALLA COMPLETA */}
            {fotoSeleccionada && createPortal(
                <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex flex-col p-4 animate-fade-in" onClick={() => setFotoSeleccionada(null)}>
                    {/* Botón de cerrar */}
                    <div className="flex justify-end pb-4 pt-safe mt-4">
                        <button 
                            onClick={() => setFotoSeleccionada(null)}
                            className="text-white bg-white/10 hover:bg-white/20 p-2 rounded-full px-6 font-bold transition-colors shadow-lg"
                        >
                            Cerrar ✕
                        </button>
                    </div>
                    
                    {/* Contenedor de la Imagen */}
                    <div className="flex-1 w-full max-w-3xl mx-auto pb-10 flex items-center justify-center">
                        <img 
                            src={fotoSeleccionada} 
                            alt="Foto Evolución" 
                            className="w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl" 
                            onClick={(e) => e.stopPropagation()} // Evita que se cierre si tocas la foto en sí
                        />
                    </div>
                </div>,
                document.body
            )}

        </div>
    );
};