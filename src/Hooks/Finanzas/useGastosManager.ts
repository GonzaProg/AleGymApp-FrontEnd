import { useState, useEffect, useCallback } from 'react';
import { GastoApi, type GastoDTO } from '../../API/Finanzas/GastoApi';
import { NotasApi } from '../../API/Notas/NotasApi';
import { showSuccess, showError, showConfirmDelete } from '../../Helpers/Alerts';

export const useGastosManager = () => {
    const [gastos, setGastos] = useState<GastoDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [verTodos, setVerTodos] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Formulario
    const [monto, setMonto] = useState<string>('');
    const [concepto, setConcepto] = useState<string>('');
    
    const getLocalISODate = () => {
        const d = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" }));
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Default today date format YYYY-MM-DD in local time
    const [fechaGasto, setFechaGasto] = useState<string>(getLocalISODate());

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

    const handleCrearGasto = async (e: React.FormEvent, pendingNotaData?: any) => {
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

            // Lógica para marcar nota como resuelta
            if (pendingNotaData) {
                try {
                    const today = new Date().toLocaleString('es-AR', { 
                        timeZone: 'America/Argentina/Buenos_Aires',
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                    });
                    const nuevoConcepto = pendingNotaData.concepto + `\n\nResuelto: ${today}`;
                    await NotasApi.modificarNota(pendingNotaData.notaId, pendingNotaData.password, { 
                        resuelta: true,
                        concepto: nuevoConcepto 
                    });
                } catch (e) {
                    console.error("Error resolviendo nota", e);
                }
            }

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
