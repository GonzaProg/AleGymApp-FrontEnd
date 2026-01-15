import { Navbar } from '../../Components/Navbar';
import fondoGym from '../../assets/Fondo-CreateRoutine.jpg';
import { useEjerciciosCrear } from '../../Hooks/Ejercicios/useEjerciciosCrear'; 
import { AppStyles } from '../../Styles/AppStyles';

export const EjerciciosCrear = () => {
    const { 
        form, loading, error, 
        selectedVideo, selectedImage, // Nuevos estados
        handleInputChange, 
        handleVideoChange, handleImageChange, // Nuevos handlers
        handleSubmit, handleCancel 
    } = useEjerciciosCrear();

    return (
        <div className={AppStyles.pageContainer}>
            <div className={AppStyles.fixedBackground} style={{ backgroundImage: `url(${fondoGym})` }} />
            <Navbar />

            <div className={AppStyles.contentContainer}>
                <div className="w-full max-w-2xl">
                    <div className={AppStyles.headerContainer}>
                        <h2 className={AppStyles.title}>Nuevo Ejercicio</h2>
                    </div>

                    <div className={AppStyles.glassCard}>
                        <div className={AppStyles.gradientDivider}></div>
                        <h3 className={AppStyles.sectionTitle}>
                            <span className={AppStyles.numberBadge}>1</span> Datos del Ejercicio
                        </h3>

                        {error && <div className={AppStyles.errorBox}>⚠️ <span>{error}</span></div>}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            
                            {/* NOMBRE */}
                            <div>
                                <label className={AppStyles.label}>Nombre del Ejercicio</label>
                                <input 
                                    type="text" name="nombre" 
                                    className={AppStyles.inputDark}
                                    placeholder="Ej: Press de Banca Plano"
                                    value={form.nombre} onChange={handleInputChange} required autoFocus
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* SUBIDA DE IMAGEN */}
                                <div>
                                    <label className={AppStyles.label}>Imagen Representativa (Opcional)</label>
                                    <div className="mt-2 border-2 border-dashed border-white/20 rounded-xl p-4 text-center hover:border-purple-500/50 hover:bg-white/5 transition-all group cursor-pointer relative h-40 flex items-center justify-center">
                                        <input 
                                            type="file" accept="image/*" 
                                            onChange={handleImageChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        <div className="flex flex-col items-center gap-2 pointer-events-none">
                                            {selectedImage ? (
                                                <>
                                                    <span className="text-3xl">🖼️</span>
                                                    <p className="text-purple-400 font-bold text-sm truncate max-w-[150px]">{selectedImage.name}</p>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="text-3xl text-gray-500 group-hover:scale-110 transition">📷</span>
                                                    <p className="text-gray-400 text-xs">Arrastra imagen aquí</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* SUBIDA DE VIDEO */}
                                <div>
                                    <label className={AppStyles.label}>Video Demostrativo (Opcional)</label>
                                    <div className="mt-2 border-2 border-dashed border-white/20 rounded-xl p-4 text-center hover:border-green-500/50 hover:bg-white/5 transition-all group cursor-pointer relative h-40 flex items-center justify-center">
                                        <input 
                                            type="file" accept="video/*" 
                                            onChange={handleVideoChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        <div className="flex flex-col items-center gap-2 pointer-events-none">
                                            {selectedVideo ? (
                                                <>
                                                    <span className="text-3xl">📹</span>
                                                    <p className="text-green-400 font-bold text-sm truncate max-w-[150px]">{selectedVideo.name}</p>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="text-3xl text-gray-500 group-hover:scale-110 transition">📤</span>
                                                    <p className="text-gray-400 text-xs">Arrastra video aquí</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* BOTONES */}
                            <div className="pt-4 flex gap-4 justify-center border-t border-white/10">
                                <button type="button" onClick={handleCancel} className={AppStyles.btnSecondary} disabled={loading}>Cancelar</button>
                                <button type="submit" disabled={loading} className={`${AppStyles.btnPrimary} ${loading ? 'opacity-70 cursor-wait' : ''}`}>
                                    {loading ? 'Subiendo archivos...' : '💾 Guardar Ejercicio'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};