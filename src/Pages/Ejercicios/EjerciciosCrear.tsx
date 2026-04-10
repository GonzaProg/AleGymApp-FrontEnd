import { useNavigate } from 'react-router-dom';
import { useEjerciciosCrear } from '../../Hooks/Ejercicios/useEjerciciosCrear'; 
import { AppStyles } from '../../Styles/AppStyles';
import { useAuthUser } from '../../Hooks/Auth/useAuthUser';
import { TIPOS_AGARRE } from '../../API/Ejercicios/EjerciciosApi';

interface Props {
    onNavigate?: (tab: string) => void;
}

export const EjerciciosCrear = ({ onNavigate }: Props) => {
    const navigate = useNavigate();
    
    const { 
        form, loading, 
        selectedVideo, selectedImage, 
        handleInputChange, 
        handleVideoChange, handleImageChange, 
        handleSubmit 
    } = useEjerciciosCrear();

    const { isAdmin } = useAuthUser();

    // 1. Lógica para volver atrás (Soporta SPA y Router normal)
    const handleGoBack = () => {
        if (onNavigate) {
            onNavigate('Ejercicios'); // Volvemos al tab de lista en el Dashboard
        } else {
            navigate('/ejercicios/gestion'); // Fallback por si se usa por URL directa
        }
    };

    // 2. Lógica de Envío
    const onSubmitWrapper = async (e: React.FormEvent) => {
        // El hook optimizado se encarga del e.preventDefault(), las validaciones y las Alertas.
        // Esperamos a que nos devuelva true (éxito) o false (error).
        const success = await handleSubmit(e);
        
        // Solo si guardó correctamente, volvemos a la lista
        if (success) {
            handleGoBack();
        }
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-start pt-2 animate-fade-in">
            <div className="w-full max-w-2xl">
                
                <div className={AppStyles.headerContainer}>
                    <h2 className={AppStyles.title}>Nuevo Ejercicio</h2>
                </div>

                <div className={AppStyles.glassCard}>
                    <div className={AppStyles.gradientDivider}></div>
                    <h3 className={AppStyles.sectionTitle}>
                        <span className={AppStyles.numberBadge}>1</span> Datos del Ejercicio
                    </h3>

                    {/* El mensaje de error visual se eliminó porque ahora usamos SweetAlert en el Hook */}

                    <form onSubmit={onSubmitWrapper} className="space-y-6">
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

                        {/* DETALLES EXTRA (Músculo, Elementos, Agarre) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={AppStyles.label}>Músculo Trabajado <span className="text-gray-500 font-normal text-xs">(Opcional)</span></label>
                                <input 
                                    type="text" name="musculoTrabajado" 
                                    className={AppStyles.inputDark}
                                    placeholder="Ej: Pectoral Mayor"
                                    value={form.musculoTrabajado} onChange={handleInputChange}
                                />
                            </div>
                            <div>
                                <label className={AppStyles.label}>Elementos del Gym <span className="text-gray-500 font-normal text-xs">(Opcional)</span></label>
                                <input 
                                    type="text" name="elementosGym" 
                                    className={AppStyles.inputDark}
                                    placeholder="Ej: Banco plano, Barra, Discos"
                                    value={form.elementosGym} onChange={handleInputChange}
                                />
                            </div>
                            <div>
                                <label className={AppStyles.label}>Tipo de Agarre <span className="text-gray-500 font-normal text-xs">(Opcional)</span></label>
                                <select 
                                    name="tipoAgarre" 
                                    className={`${AppStyles.inputDark}`}
                                    value={form.tipoAgarre} onChange={handleInputChange}
                                >
                                    <option value="">Ninguno</option>
                                    {TIPOS_AGARRE.map(agarre => (
                                        <option key={agarre} value={agarre}>{agarre}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* DETALLES TEXTAREA */}
                        <div>
                            <label className={AppStyles.label}>Detalles a tener en cuenta <span className="text-gray-500 font-normal text-xs">(Opcional)</span></label>
                            <textarea 
                                name="detalles" 
                                className={AppStyles.inputDark + " min-h-[100px] resize-y"}
                                placeholder="Anotaciones extra sobre la técnica o cuidados especiales..."
                                value={form.detalles} onChange={handleInputChange}
                            />
                        </div>

                        {/* CAMPOS DE IMAGEN Y VIDEO - SOLO PARA ADMINS */}
                        {isAdmin && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* SUBIDA DE IMAGEN */}
                                <div>
                                    <label className={AppStyles.label}>Imagen (Opcional)</label>
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
                                                    <p className="text-gray-400 text-xs">Arrastra imagen</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* SUBIDA DE VIDEO */}
                                <div>
                                    <label className={AppStyles.label}>Video (Opcional)</label>
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
                                                    <p className="text-gray-400 text-xs">Arrastra video</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* MENSAJE INFORMATIVO PARA ENTRENADORES */}
                        {!isAdmin && (
                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                                <p className="text-blue-300 text-sm">
                                    <strong>Nota:</strong> Como entrenador, solo puedes poner el nombre. 
                                    Los campos imagen y video los cargo yo más tarde.
                                </p>
                            </div>
                        )}

                        {/* BOTONES */}
                        <div className="pt-4 flex gap-4 justify-center border-t border-white/10">
                            <button 
                                type="button" 
                                onClick={handleGoBack} 
                                className={AppStyles.btnSecondaryNotFlex} 
                                disabled={loading}
                            >
                                Cancelar
                            </button>
                            
                            <button 
                                type="submit" 
                                disabled={loading} 
                                className={`${AppStyles.btnPrimary} ${loading ? 'opacity-70 cursor-wait' : ''}`}
                            >
                                {loading ? 'Guardando...' : '💾 Guardar'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};