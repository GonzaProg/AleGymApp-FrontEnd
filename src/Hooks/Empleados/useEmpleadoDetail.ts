import { useState, useEffect, useCallback } from "react";
import { EmpleadoApi, type EmpleadoDTO, type PagoEmpleadoDTO } from "../../API/Empleados/EmpleadoApi";
import { showSuccess, showError, showConfirmSuccess } from "../../Helpers/Alerts";

export const useEmpleadoDetail = (
    gymId: number, 
    empleado: EmpleadoDTO, 
    onRefresh: () => void,
    onBack: () => void
) => {
    const [pagos, setPagos] = useState<PagoEmpleadoDTO[]>([]);
    const [loading, setLoading] = useState(true);

    const loadPagos = useCallback(async () => {
        setLoading(true);
        try {
            const data = await EmpleadoApi.obtenerHistorialPagos(gymId, empleado.id);
            setPagos(data);
        } catch (error) {
            console.error("Error cargando historial de pagos", error);
        } finally {
            setLoading(false);
        }
    }, [gymId, empleado.id]);

    useEffect(() => {
        loadPagos();
    }, [loadPagos]);

    const handleToggleStatus = async () => {
        const action = empleado.activo ? 'dar de baja' : 'reactivar';
        const result = await showConfirmSuccess(
            '¿Estás seguro?',
            `Vas a ${action} a ${empleado.nombre}.`
        );

        if (result.isConfirmed) {
            try {
                await EmpleadoApi.bajaLogicaEmpleado(gymId, empleado.id);
                showSuccess('El empleado fue actualizado correctamente.');
                onRefresh(); 
                onBack(); // Volver a la lista para ver el cambio reflejado
            } catch (error: any) {
                showError(error.response?.data?.error || 'Ocurrió un error');
            }
        }
    };

    return {
        pagos,
        loading,
        handleToggleStatus
    };
};
