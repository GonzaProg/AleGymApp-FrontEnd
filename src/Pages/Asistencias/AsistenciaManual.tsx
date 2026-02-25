import { AppStyles } from "../../Styles/AppStyles";
import { useAsistenciaManual } from "../../Hooks/AsistenciaManual/useAsistenciaManual";

export const AsistenciaManual = () => {
    // Extraemos todo del hook en una sola línea
    const { dni, setDni, loading, handleGuardar } = useAsistenciaManual();

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in-up mt-10">
            <h2 className={AppStyles.sectionTitle}>✅ Asistencia Manual</h2>
            
            <div className={AppStyles.glassCard}>
                <p className="text-gray-400 mb-6 text-sm">
                    Ingresa el DNI del alumno para registrar su entrada al gimnasio. Usar esto cuando olvidó su celular o no puede escanear el código QR.
                </p>

                <form onSubmit={handleGuardar} className="space-y-6">
                    <div>
                        <label className={AppStyles.label}>DNI del Alumno</label>
                        <input 
                            type="number" 
                            min="0"
                            value={dni}
                            onChange={(e) => setDni(e.target.value)}
                            className={AppStyles.inputDark}
                            autoFocus
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading || !dni}
                        className={`${AppStyles.btnPrimary} w-full flex justify-center items-center gap-2 disabled:opacity-50`}
                    >
                        {loading ? "Registrando..." : "Registrar Entrada"}
                    </button>
                </form>
            </div>
        </div>
    );
};