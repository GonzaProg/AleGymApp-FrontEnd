import type { EmpleadoDTO } from "../../API/Empleados/EmpleadoApi";
import { AppStyles } from "../../Styles/AppStyles";
import { usePagoEmpleadoForm } from "../../Hooks/Empleados/usePagoEmpleadoForm";
import { PaymentMethodSelect } from "../../Components/UI/PaymentMethodSelect";

interface Props {
    empleado: EmpleadoDTO;
    onBack: () => void;
    onSuccess: () => void;
    gymId: number;
}

export const PagoEmpleadoForm = ({ empleado, onBack, onSuccess, gymId }: Props) => {
    const {
        monto,
        setMonto,
        concepto,
        setConcepto,
        metodoPago,
        setMetodoPago,
        fechaPago,
        setFechaPago,
        loading,
        handleSubmit
    } = usePagoEmpleadoForm(gymId, empleado, onSuccess);

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
                        <label className={AppStyles.label}>Fecha de Pago *</label>
                        <input 
                            type="date"
                            value={fechaPago}
                            onChange={(e) => setFechaPago(e.target.value)}
                            className={AppStyles.inputDark}
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
                        <PaymentMethodSelect 
                            value={metodoPago} 
                            onChange={setMetodoPago} 
                            label="Método de Pago *"
                        />
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
