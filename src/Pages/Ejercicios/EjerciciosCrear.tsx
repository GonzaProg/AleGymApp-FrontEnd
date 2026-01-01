import { Navbar } from '../../Components/Navbar';
import fondoGym from '../../assets/Fondo-CreateRoutine.png';
import { useEjerciciosCrear } from '../../Hooks/Ejercicios/useEjerciciosCrear'; 
import { AppStyles } from '../../Styles/AppStyles';

export const EjerciciosCrear = () => {
    
    const { 
        form, 
        loading, 
        error, 
        selectedFile, // Recibimos el archivo seleccionado
        handleInputChange, 
        handleFileChange, // Recibimos el handler de archivo
        handleSubmit, 
        handleCancel 
    } = useEjerciciosCrear();

    return (
        <div className={AppStyles.pageContainer}>
            {/* --- FONDO FIJO --- */}
            <div
                className={AppStyles.fixedBackground}
                style={{ backgroundImage: `url(${fondoGym})`, 
                filter: 'brightness(0.8) contrast(1.1)' }}
            />

            <Navbar />

            {/* --- CONTENIDO --- */}
            <div className={AppStyles.contentContainer}>
                <div className="w-full max-w-2xl">
                    
                    {/* Título */}
                    <h2 className={AppStyles.title}>
                        Nuevo <span className={AppStyles.highlight}>Ejercicio</span>
                    </h2>

                    {/* Tarjeta del Formulario */}
                    <div className={AppStyles.glassCard}>
                        {/* Decoración Superior */}
                        <div className={AppStyles.gradientDivider}></div>

                        <h3 className={AppStyles.sectionTitle}>
                            <span className={AppStyles.numberBadge}>1</span> Datos del Ejercicio
                        </h3>

                        {error && (
                            <div className={AppStyles.errorBox}>
                                ⚠️ <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            
                            {/* NOMBRE */}
                            <div>
                                <label className={AppStyles.label}>Nombre del Ejercicio</label>
                                <input 
                                    type="text"
                                    name="nombre" 
                                    className={AppStyles.inputDark}
                                    placeholder="Ej: Press de Banca Plano"
                                    value={form.nombre}
                                    onChange={handleInputChange}
                                    required
                                    autoFocus
                                />
                            </div>

                            {/* SUBIDA DE VIDEO */}
                            <div>
                                <label className={AppStyles.label}>Video Demostrativo (Opcional)</label>
                                
                                <div className="mt-2 border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-green-500/50 hover:bg-white/5 transition-all group cursor-pointer relative">
                                    <input 
                                        type="file" 
                                        accept="video/*" 
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    
                                    <div className="flex flex-col items-center gap-2 pointer-events-none">
                                        <span className="text-4xl group-hover:scale-110 transition-transform">
                                            {selectedFile ? '📹' : '📤'}
                                        </span>
                                        
                                        {selectedFile ? (
                                            <>
                                                <p className="text-green-400 font-bold text-lg">{selectedFile.name}</p>
                                                <p className="text-gray-500 text-xs">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB - Listo para subir</p>
                                            </>
                                        ) : (
                                            <>
                                                <p className="text-gray-300 font-medium group-hover:text-white">Haz clic o arrastra un video aquí</p>
                                                <p className="text-gray-500 text-xs">Soporta MP4, WebM (Máx 100MB recomendado)</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* BOTONES */}
                            <div className="pt-4 flex gap-4 justify-center">
                                <button 
                                    type="button" 
                                    onClick={handleCancel}
                                    className={AppStyles.btnSecondary}
                                    disabled={loading}
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className={`${AppStyles.btnPrimary} ${loading ? 'opacity-70 cursor-wait' : ''}`}
                                >
                                    {loading ? 'Subiendo Video...' : '💾 Guardar Ejercicio'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};