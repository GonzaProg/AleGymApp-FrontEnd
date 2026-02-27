import { createPortal } from "react-dom";
import { AppStyles } from "../../Styles/AppStyles";
import { useAsistenciaManual } from "../../Hooks/Asistencias/useAsistenciaManual";

export const AsistenciaManual = () => {
    const { 
        dni, setDni, loading, handleGuardar,
        concurrencia, excedidosHoy, excedidosMes, loadingReporte,
        tabActiva, setTabActiva,
        modalAbierto, cerrarModal, alumnoSeleccionado, historialAlumno, loadingHistorial, verHistorialAlumno
    } = useAsistenciaManual();

    // Determinamos qué lista mostrar según la pestaña
    const listaExcedidos = tabActiva === 'hoy' ? excedidosHoy : excedidosMes;

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up mt-10 pt-6 pb-10 relative">
            <h2 className={AppStyles.title}>✅ Control de Recepción</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`${AppStyles.glassCard} flex items-center gap-6`}>
                    <div className="bg-green-500/20 p-4 rounded-2xl border border-green-500/30">
                        <span className="text-4xl">🔥</span>
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm font-bold uppercase tracking-wider">Entrenando Ahora</p>
                        {loadingReporte ? (
                            <div className="h-10 w-20 bg-white/10 animate-pulse rounded mt-2"></div>
                        ) : (
                            <p className="text-4xl font-black text-white mt-1">{concurrencia} <span className="text-lg text-gray-500 font-medium">personas</span></p>
                        )}
                    </div>
                </div>

                <div className={AppStyles.glassCard}>
                    <p className="text-gray-400 mb-4 text-xs font-bold uppercase tracking-wider">Ingreso Manual sin QR</p>
                    <form onSubmit={handleGuardar} className="flex gap-4">
                        <input 
                            type="number" 
                            placeholder="DNI del Alumno..." 
                            min={0}
                            value={dni}
                            onChange={(e) => setDni(e.target.value)}
                            className={`${AppStyles.inputDark} flex-1`}
                        />
                        <button 
                            type="submit" 
                            disabled={loading || !dni}
                            className={`${AppStyles.btnPrimary} py-2 px-6 disabled:opacity-50 min-w-[120px]`}
                        >
                            {loading ? "..." : "Ingresar"}
                        </button>
                    </form>
                </div>
            </div>

            {/* PANEL INFERIOR: ALERTAS */}
            <div className={`${AppStyles.glassCard} border-red-500/20 shadow-lg shadow-red-900/10`}>
                
                {/* Cabecera con Pestañas */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-white/5 pb-4">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">⚠️</span>
                        <div>
                            <h3 className="text-lg font-bold text-red-400">Alertas de Plan Excedido</h3>
                            <p className="text-xs text-gray-400">Toca un alumno para ver su historial del mes.</p>
                        </div>
                    </div>

                    {/* Selector Hoy / Mes */}
                    <div className="flex bg-black/40 rounded-lg p-1 border border-white/5">
                        <button 
                            onClick={() => setTabActiva('hoy')}
                            className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${tabActiva === 'hoy' ? 'bg-red-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            Hoy
                        </button>
                        <button 
                            onClick={() => setTabActiva('mes')}
                            className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${tabActiva === 'mes' ? 'bg-red-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            Este Mes
                        </button>
                    </div>
                </div>

                {loadingReporte ? (
                    <p className="text-gray-500 text-center py-4 animate-pulse">Cargando reportes...</p>
                ) : listaExcedidos.length === 0 ? (
                    <div className="text-center py-8">
                        <span className="text-4xl opacity-50 mb-2 block">✨</span>
                        <p className="text-gray-400 font-medium">Todo en orden. Ningún exceso registrado {tabActiva === 'hoy' ? 'hoy' : 'este mes'}.</p>
                    </div>
                ) : (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {listaExcedidos.map((excedido) => (
                            <div 
                                key={excedido.id} 
                                onClick={() => verHistorialAlumno(excedido)}
                                className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center justify-between hover:bg-red-500/30 transition-colors cursor-pointer group"
                            >
                                <div>
                                    <p className="text-white font-bold text-lg group-hover:text-red-300 transition-colors">{excedido.alumno}</p>
                                    <p className="text-gray-400 text-sm">DNI: {excedido.dni}</p>
                                </div>
                                <div className="text-right flex flex-col items-end gap-2">
                                    <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                                        Excedido
                                    </span>
                                    <p className="text-xs text-red-300 font-medium">
                                        {new Date(excedido.hora).toLocaleDateString()} - {new Date(excedido.hora).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* MODAL HISTORIAL DEL ALUMNO */}
            {modalAbierto && createPortal(
                <div className={AppStyles.modalOverlay} onClick={cerrarModal}>
                    <div className={`${AppStyles.modalContent} p-6`} onClick={e => e.stopPropagation()}>
                        
                        <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                            <div>
                                <h3 className="text-xl font-bold text-white">{alumnoSeleccionado?.alumno}</h3>
                                <p className="text-sm text-gray-400">Historial de asistencias (Mes Actual)</p>
                            </div>
                            <button onClick={cerrarModal} className="text-gray-400 hover:text-white text-2xl">×</button>
                        </div>

                        {loadingHistorial ? (
                            <div className="flex justify-center items-center py-10">
                                <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                                {historialAlumno.length === 0 ? (
                                    <p className="text-center text-gray-500 py-4">No hay asistencias registradas este mes.</p>
                                ) : (
                                    historialAlumno.map((item, index) => {
                                        const fecha = new Date(item.fecha);
                                        const diaSemana = fecha.toLocaleDateString('es-ES', { weekday: 'long' }); // ej: "lunes"
                                        
                                        return (
                                            <div 
                                                key={index} 
                                                className={`p-3 rounded-lg border flex justify-between items-center ${
                                                    item.excedido 
                                                    ? 'bg-red-500/10 border-red-500/20' 
                                                    : 'bg-white/5 border-white/5'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xl">{item.excedido ? '❌' : '✅'}</span>
                                                    <div>
                                                        <p className={`font-bold capitalize ${item.excedido ? 'text-red-300' : 'text-white'}`}>
                                                            {diaSemana}
                                                        </p>
                                                        <p className="text-xs text-gray-400">
                                                            {fecha.toLocaleDateString()} a las {fecha.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div>
                                                    {item.excedido && (
                                                        <span className="text-xs font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded">Fuera de límite</span>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        )}
                        
                        <div className="mt-6 pt-4 border-t border-white/10 text-right">
                            <p className="text-xs text-gray-500">Total asistencias este mes: <span className="text-white font-bold">{historialAlumno.length}</span></p>
                        </div>

                    </div>
                </div>,
                document.body
            )}

        </div>
    );
};