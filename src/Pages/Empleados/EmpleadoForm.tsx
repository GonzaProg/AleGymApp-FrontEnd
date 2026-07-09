import type { EmpleadoDTO } from "../../API/Empleados/EmpleadoApi";
import { AppStyles } from "../../Styles/AppStyles";
import { useEmpleadoForm } from "../../Hooks/Empleados/useEmpleadoForm";

interface Props {
    empleadoToEdit?: EmpleadoDTO | null;
    onBack: () => void;
    onSuccess: () => void;
    gymId: number;
}

export const EmpleadoForm = ({ empleadoToEdit, onBack, onSuccess, gymId }: Props) => {
    const {
        nombre,
        setNombre,
        apellido,
        setApellido,
        telefono,
        setTelefono,
        fotoPreview,
        isUploading,
        fileInputRef,
        handleFileChange,
        handleRemovePhoto,
        handleSubmit
    } = useEmpleadoForm(gymId, onSuccess, empleadoToEdit);

    return (
        <div className="w-full max-w-2xl animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
                <button onClick={onBack} className={AppStyles.btnBack} disabled={isUploading}>
                    &larr; Volver
                </button>
            </div>

            <div className={AppStyles.glassCard}>
                <h2 className={AppStyles.sectionTitle}>
                    {empleadoToEdit ? 'Editar Empleado' : 'Nuevo Empleado'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                    
                    {/* FOTO DE PERFIL */}
                    <div className="flex flex-col items-center gap-4">
                        <label className={AppStyles.label}>Foto de Perfil</label>
                        <div className="relative group cursor-pointer">
                            {fotoPreview ? (
                                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-700 group-hover:border-green-500 transition-colors">
                                    <img src={fotoPreview} alt="Preview" className="w-full h-full object-cover" />
                                    <div 
                                        className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <span className="text-white text-xs font-bold">Cambiar</span>
                                    </div>
                                </div>
                            ) : (
                                <div 
                                    className="w-32 h-32 rounded-full border-4 border-dashed border-gray-600 flex items-center justify-center text-gray-500 hover:border-green-500 hover:text-green-500 transition-colors"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <span className="text-sm font-bold text-center">Subir<br/>Foto</span>
                                </div>
                            )}
                            <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                ref={fileInputRef}
                                onChange={handleFileChange}
                            />
                        </div>
                        {fotoPreview && (
                            <button 
                                type="button" 
                                onClick={handleRemovePhoto}
                                className="text-red-400 text-xs hover:text-red-300 font-bold"
                            >
                                Quitar foto
                            </button>
                        )}
                    </div>

                    {/* DATOS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className={AppStyles.label}>Nombre <span className="text-red-600">*</span></label>
                            <input 
                                type="text"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                className={AppStyles.inputDark}
                                required
                            />
                        </div>
                        <div>
                            <label className={AppStyles.label}>Apellido <span className="text-red-600">*</span></label>
                            <input 
                                type="text"
                                value={apellido}
                                onChange={(e) => setApellido(e.target.value)}
                                className={AppStyles.inputDark}
                                required
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className={AppStyles.label}>Teléfono</label>
                            <input 
                                type="text"
                                value={telefono}
                                onChange={(e) => setTelefono(e.target.value)}
                                className={AppStyles.inputDark}
                            />
                        </div>
                    </div>

                    {/* BOTONES */}
                    <div className="flex gap-4 pt-4 border-t border-white/10 mt-6">
                        <button 
                            type="button" 
                            onClick={onBack} 
                            className={AppStyles.btnSecondary}
                            disabled={isUploading}
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            className={`${AppStyles.btnPrimary} flex-1`}
                            disabled={isUploading}
                        >
                            {isUploading ? 'Guardando...' : 'Guardar Empleado'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
