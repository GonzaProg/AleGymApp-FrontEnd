import { useState, useEffect } from "react";
import { PagosApi, type PagoDTO } from "../../API/Pagos/PagosApi";
import { useAlumnoSearch } from "../useAlumnoSearch";
import { showConfirmSuccess, showSuccess, showError } from "../../Helpers/Alerts";

export const useFinancialManager = () => {
    
    // 1. Estado de Pagos (Lista dinámica)
    const [pagos, setPagos] = useState<PagoDTO[]>([]);
    const [loadingPagos, setLoadingPagos] = useState(false);

    // 2. Integración Buscador
    const {
        busqueda,
        sugerencias,
        mostrarSugerencias,
        alumnoSeleccionado,
        handleSearchChange,
        handleSelectAlumno,
        setMostrarSugerencias,
        clearSelection
    } = useAlumnoSearch();

    // 3. Efecto: Cargar datos según estado del buscador
    useEffect(() => {
        const cargarDatos = async () => {
            setLoadingPagos(true);
            try {
                let data;
                if (alumnoSeleccionado) {
                    // Si hay alumno seleccionado -> Traer SUS pagos (últimos 5)
                    data = await PagosApi.getHistorialPorUsuario(alumnoSeleccionado.id);
                } else {
                    // Si no -> Traer historial general (últimos 10)
                    data = await PagosApi.getHistorial();
                }
                setPagos(data);
            } catch (error) {
                console.error("Error cargando pagos:", error);
                setPagos([]);
            } finally {
                setLoadingPagos(false);
            }
        };

        cargarDatos();
    }, [alumnoSeleccionado]); // Se dispara al seleccionar/deseleccionar alumno

    // 4. Acción: Devolución
    const handleDevolucion = async (pago: PagoDTO) => {
        // Validar si es una devolución (monto negativo) para no devolver una devolución
        if (pago.monto < 0) return showError("No puedes devolver una devolución.");

        const confirm = await showConfirmSuccess(
            "¿Confirmar Devolución?",
            `Se generará un contra-asiento de $${pago.monto} para ${pago.usuario.nombre}.`
        );

        if (!confirm.isConfirmed) return;

        try {
            await PagosApi.revertirPago(pago.id);
            await showSuccess("Devolución registrada correctamente.");
            
            // Recargar la lista actual
            if (alumnoSeleccionado) {
                const data = await PagosApi.getHistorialPorUsuario(alumnoSeleccionado.id);
                setPagos(data);
            } else {
                const data = await PagosApi.getHistorial();
                setPagos(data);
            }

        } catch (error: any) {
            showError(error.response?.data?.error || "Error al procesar devolución");
        }
    };

    // Helper para limpiar todo
    const handleClearSearch = () => {
        clearSelection();
        // El useEffect se encargará de recargar el historial general al cambiar alumnoSeleccionado a null
    };

    return {
        // Data
        pagos,
        loadingPagos,
        
        // Search Props
        busqueda,
        sugerencias,
        mostrarSugerencias,
        alumnoSeleccionado,
        handleSearchChange,
        handleSelectAlumno,
        setMostrarSugerencias,
        handleClearSearch,

        // Actions
        handleDevolucion
    };
};