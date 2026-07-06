import { useState } from "react";
import { EmpleadoApi, type EmpleadoDTO } from "../../API/Empleados/EmpleadoApi";
import { AppStyles } from "../../Styles/AppStyles";
import { showSuccess, showError } from "../../Helpers/Alerts";

interface Props {
    empleado: EmpleadoDTO;
    onBack: () => void;
    onSuccess: () => void;
    gymId: number;
}

export const PagoEmpleadoForm = ({ empleado, onBack, onSuccess, gymId }: Props) => {
    const [monto, setMonto] = useState("");
    const [concepto, setConcepto] = useState("Sueldo Mensual");
    const [metodoPago, setMetodoPago] = useState("Efectivo");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!monto || isNaN(Number(monto)) || Number(monto) <= 0) {
            showError('Ingrese un monto válido');
            return;
        }

        setLoading(true);
        try {
            await EmpleadoApi.asignarPago(gymId, empleado.id, {
                monto: Number(monto),
                concepto,
                metodoPago
            });
            
            showSuccess('Pago registrado correctamente.');
            onSuccess();
        } catch (error: any) {
            showError(error.response?.data?.error || 'Ocurrió un error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-xl animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
                <button onClick={onBack} className={AppStyles.btnBack} disabled={loading}>
                    &larr; Volver
                </button>
            </div>

            <div className={AppStyles.glassCard}>
                <h2 className={AppStyles.sectionTitle}>
                    Asignar Pago
                </h2>
                <p className="text-gray-400 mb-6">
                    Empleado: <span className="font-bold text-white">{empleado.nombre} {empleado.apellido}</span>
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className={AppStyles.label}>Monto *</label>
                        <input 
                            type="number"
                            min="1"
                            step="0.01"
                            value={monto}
                            onChange={(e) => setMonto(e.target.value)}
                            className={AppStyles.inputDark}
                            placeholder="Ej: 20000"
                            required
                        />
                    </div>
                    
                    <div>
                        <label className={AppStyles.label}>Concepto</label>
                        <input 
                            type="text"
                            value={concepto}
                            onChange={(e) => setConcepto(e.target.value)}
                            className={AppStyles.inputDark}
                            placeholder="Ej: Sueldo Mensual, Adelanto..."
                        />
                    </div>

                    <div>
                        <label className={AppStyles.label}>Método de Pago *</label>
                        <select 
                            value={metodoPago}
                            onChange={(e) => setMetodoPago(e.target.value)}
                            className={`${AppStyles.inputDark} ${AppStyles.darkBackgroundSelect}`}
                            required
                        >
                            <option value="Efectivo">Efectivo</option>
                            <option value="Transferencia">Transferencia</option>
                        </select>
                    </div>

                    <div className="flex gap-4 pt-4 border-t border-white/10 mt-6">
                        <button 
                            type="button" 
                            onClick={onBack} 
                            className={AppStyles.btnSecondary}
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            className={`${AppStyles.btnPrimary} flex-1`}
                            disabled={loading}
                        >
                            {loading ? 'Procesando...' : 'Registrar Pago'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
