import { Navbar } from '../../Components/Navbar';
import fondoGym from '../../assets/Fondo-CreateRoutine.png';
import { useEjerciciosCrear } from '../../Hooks/Ejercicios/useEjerciciosCrear'; 

export const EjerciciosCrear = () => {
    
    const { 
        form, 
        loading, 
        error, 
        handleInputChange, 
        handleSubmit, 
        handleCancel 
    } = useEjerciciosCrear();

    // --- ESTILOS VISUALES ---
    const darkInputClass = "w-full bg-black/30 border border-white/10 text-white focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 p-3 rounded-lg outline-none transition-all placeholder-gray-500";
    const darkLabelClass = "block text-gray-400 text-xs uppercase font-bold tracking-wider mb-2";
    const cardClass = "w-full backdrop-blur-xl bg-gray-900/80 border border-white/10 rounded-2xl shadow-xl p-8 relative overflow-hidden";

    return (
        <div className="relative min-h-screen font-sans bg-gray-900 text-gray-200">
            {/* --- FONDO FIJO --- */}
            <div
                className="fixed inset-0 z-0"
                style={{
                    backgroundImage: `url(${fondoGym})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundAttachment: 'fixed',
                    filter: 'brightness(0.3) contrast(1.1)'
                }}
            />

            <Navbar />

            {/* --- CONTENIDO --- */}
            <div className="relative z-10 pt-28 pb-10 px-4 w-full flex justify-center">
                <div className="w-full max-w-2xl">
                    
                    {/* Título */}
                    <h2 className="text-4xl font-black text-white mb-8 tracking-tight drop-shadow-lg text-center">
                        Nuevo <span className="text-green-500">Ejercicio</span>
                    </h2>

                    {/* Tarjeta del Formulario */}
                    <div className={cardClass}>
                        {/* Decoración Superior */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500/50 to-transparent"></div>

                        <h3 className="text-xl font-bold text-white border-b border-white/10 pb-4 mb-6 flex items-center gap-2">
                            <span className="bg-green-600/20 text-green-500 py-1 px-3 rounded-lg text-sm">1</span> Datos del Ejercicio
                        </h3>

                        {error && (
                            <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-lg mb-6 flex items-center gap-3">
                                ⚠️ <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className={darkLabelClass}>Nombre del Ejercicio</label>
                                <input 
                                    type="text"
                                    name="nombre" // IMPORTANTE: name coincide con la propiedad del estado
                                    className={darkInputClass}
                                    placeholder="Ej: Press de Banca Plano"
                                    value={form.nombre}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div>
                                <label className={darkLabelClass}>URL Video (Opcional)</label>
                                <input 
                                    type="text"
                                    name="urlVideo" // IMPORTANTE
                                    className={darkInputClass}
                                    placeholder="https://youtube.com/..."
                                    value={form.urlVideo}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="pt-4 flex gap-4">
                                <button 
                                    type="button" 
                                    onClick={handleCancel}
                                    className="flex-1 bg-gray-700/50 hover:bg-gray-700 text-gray-300 font-bold py-3 rounded-xl border border-white/5 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-green-900/20 border border-green-500/20 transition-all hover:scale-[1.02]"
                                >
                                    {loading ? 'Guardando...' : '💾 Guardar Ejercicio'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};