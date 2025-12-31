import { Navbar } from '../../Components/Navbar';
import fondoGym from '../../assets/Fondo-CreateRoutine.png';
import { useEjerciciosCrear } from '../../Hooks/Ejercicios/useEjerciciosCrear'; 
import { AppStyles } from '../../Styles/AppStyles';

export const EjerciciosCrear = () => {
    
    const { 
        form, 
        loading, 
        error, 
        handleInputChange, 
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
                                />
                            </div>

                            <div>
                                <label className={AppStyles.label}>URL Video (Opcional)</label>
                                <input 
                                    type="text"
                                    name="urlVideo" 
                                    className={AppStyles.inputDark}
                                    placeholder="https://youtube.com/..."
                                    value={form.urlVideo}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="pt-4 flex gap-4 justify-center">
                                <button 
                                    type="button" 
                                    onClick={handleCancel}
                                    className={AppStyles.btnSecondary}
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className={AppStyles.btnPrimary}
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