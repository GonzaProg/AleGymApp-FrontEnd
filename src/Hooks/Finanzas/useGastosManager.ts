import { useState, useEffect, useCallback } from 'react';
import { GastoApi, type GastoDTO } from '../../API/Finanzas/GastoApi';
import { showSuccess, showError, showConfirmDelete } from '../../Helpers/Alerts';

export const useGastosManager = () => {
    const [gastos, setGastos] = useState<GastoDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [verTodos, setVerTodos] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Formulario
    const [monto, setMonto] = useState<string>('');
    const [concepto, setConcepto] = useState<string>('');
    
    // Default today date format YYYY-MM-DD
    const [fechaGasto, setFechaGasto] = useState<string>(new Date().toISOString().split('T')[0]);

    const fetchGastos = useCallback(async () => {
        setLoading(true);
        try {
            const data = await GastoApi.obtenerHistorial(verTodos ? undefined : 10);
            setGastos(data);
        } catch (error) {
            console.error("Error al cargar gastos:", error);
            showError("No se pudo cargar el historial de gastos");
        } finally {
            setLoading(false);
        }
    }, [verTodos]);

    useEffect(() => {
        fetchGastos();
    }, [fetchGastos]);

    const handleToggleVerTodos = () => {
        setVerTodos(prev => !prev);
    };

    const handleCrearGasto = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const montoNum = Number(monto);
        if (!montoNum || montoNum <= 0) {
            return showError("El monto debe ser mayor a 0");
        }
        
        if (!concepto.trim()) {
            return showError("El concepto es requerido");
        }

        setSubmitting(true);
        try {
            let finalDate = undefined;
            if (fechaGasto) {
                // Tomamos la fecha seleccionada y le agregamos la hora actual local
                const currentTime = new Date().toTimeString().split(' ')[0];
                finalDate = new Date(`${fechaGasto}T${currentTime}`);
            }

            await GastoApi.crearGasto({
                monto: montoNum,
                concepto,
                fechaGasto: finalDate
            });
            showSuccess("Gasto registrado correctamente");
            setMonto('');
            setConcepto('');
            fetchGastos();
        } catch (error: any) {
            showError(error.response?.data?.error || "Error al registrar gasto");
        } finally {
            setSubmitting(false);
        }
    };

    const handleRevertirGasto = async (id: number) => {
        const confirmar = await showConfirmDelete(
            "¿Estás seguro?", 
            "El gasto se revertirá y se ajustarán las finanzas. Esta acción no se puede deshacer."
        );
        
        if (!confirmar.isConfirmed) return;

        try {
            await GastoApi.revertirGasto(id);
            showSuccess("Gasto revertido correctamente");
            fetchGastos();
        } catch (error: any) {
            showError(error.response?.data?.error || "Error al revertir gasto");
        }
    };

    return {
        gastos,
        loading,
        verTodos,
        handleToggleVerTodos,
        monto,
        setMonto,
        concepto,
        setConcepto,
        fechaGasto,
        setFechaGasto,
        handleCrearGasto,
        submitting,
        handleRevertirGasto
    };
};
