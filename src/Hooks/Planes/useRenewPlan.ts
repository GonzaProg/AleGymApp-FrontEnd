import { useState, useEffect } from "react";
import { PlansApi, type PlanDTO } from "../../API/Planes/PlansApi";
import { showConfirmSuccess, showError, showSuccess } from "../../Helpers/Alerts";
// Asegúrate de que la ruta de importación sea correcta según tu estructura
import { useAlumnoSearch } from "../useAlumnoSearch"; 

export const useRenewPlan = () => {

    // --- ESTADOS DE DATOS ---
    const [planesDisponibles, setPlanesDisponibles] = useState<PlanDTO[]>([]);
    
    // --- ESTADOS DE UI ---
    const [loadingPlans, setLoadingPlans] = useState(false);
    const [loadingAction, setLoadingAction] = useState(false); 
    const [metodoPago, setMetodoPago] = useState("Transferencia");

    // --- BÚSQUEDA CENTRALIZADA ---
    // includePlan: true porque necesitamos saber si está activo o vencido
    const {
        busqueda,
        sugerencias,
        alumnoSeleccionado,
        loading: loadingSearch,
        handleSearchChange,
        handleSelectAlumno,
        clearSelection,
        setBusqueda
    } = useAlumnoSearch({ includePlan: true });

    // 1. Carga inicial de PLANES (No alumnos, eso lo maneja el buscador)
    useEffect(() => {
        const cargarPlanes = async () => {
            setLoadingPlans(true);
            try {
                const planes = await PlansApi.getAll();
                setPlanesDisponibles(planes);
            } catch (error) {
                console.error("Error cargando planes:", error);
            } finally {
                setLoadingPlans(false);
            }
        };
        cargarPlanes();
    }, []);

    // Wrappers para la UI (Mantenemos compatibilidad con tu componente visual)
    const seleccionarAlumno = (alumno: any) => {
        handleSelectAlumno(alumno);
        setMetodoPago("Transferencia");
    };

    const limpiarSeleccion = () => {
        clearSelection();
    };

    // --- ACCIONES ---

    const renovarPlan = async (userPlanId?: number, forzarDesdeVencimiento: boolean = false) => {
        if (!alumnoSeleccionado) return;
        
        // Buscamos un plan para renovar si no viene el ID específico
        const idRenovar = userPlanId || alumnoSeleccionado.userPlans?.find((p:any) => p.activo)?.id;
        
        // Si no tiene plan activo, quizás queremos renovar el último vencido? 
        // Por seguridad, pedimos que seleccione explícitamente si hay ambigüedad, 
        // pero aquí asumimos el flujo simple.
        if (!idRenovar) return showError("No se encontró una suscripción activa para renovar.");

        setLoadingAction(true);
        try {
            const response: any = await PlansApi.renewPlan(idRenovar, metodoPago, forzarDesdeVencimiento);

            switch (response.estadoRecibo) {
                case 'ENVIADO': showSuccess(`✅ Renovado. Recibo enviado 📱`); break;
                case 'DESACTIVADO': showSuccess(`✅ Renovado correctamente.`); break;
                case 'ERROR': showSuccess(`⚠️ Renovado, pero FALLÓ el envío del recibo.`); break;
                default: showSuccess(`✅ Renovado correctamente.`);
            }

            limpiarSeleccion(); 
        } catch (error: any) {
            showError(error.response?.data?.message || "Error al renovar");
        } finally {
            setLoadingAction(false);
        }
    };

    const cancelarPlan = async (userPlanId?: number) => {
        if (!alumnoSeleccionado) return;

        const idCancelar = userPlanId || alumnoSeleccionado.userPlans?.find((p:any) => p.activo)?.id;
        if (!idCancelar) return showError("No hay plan activo para cancelar");

        const result = await showConfirmSuccess( 
            `¿Cancelar plan?`,
            `¿Deseas cancelar la membresía de ${alumnoSeleccionado.nombre}?`
        );
                        
        if (!result.isConfirmed) return;

        setLoadingAction(true);
        try {
            await PlansApi.cancelPlan(idCancelar);
            showSuccess("Plan cancelado correctamente");
            limpiarSeleccion();
        } catch (error: any) {
            showError("Error al cancelar");
        } finally {
            setLoadingAction(false);
        }
    };

    const asignarPlan = async (plan: PlanDTO) => {
        if (!alumnoSeleccionado) return;

        const result = await showConfirmSuccess( 
            `Asignar ${plan.nombre}`,
            `¿Deseas asignar el plan "${plan.nombre}" a ${alumnoSeleccionado.nombre}?`
        );
                        
        if (!result.isConfirmed) return;

        setLoadingAction(true);
        try {
            const response: any = await PlansApi.subscribeUser(alumnoSeleccionado.id, plan.id!, metodoPago);
            
            switch (response.estadoRecibo) {
                case 'ENVIADO': showSuccess(`✅ Asignado. Recibo enviado 📱`); break;
                case 'DESACTIVADO': showSuccess(`✅ Asignado correctamente.`); break;
                case 'ERROR': showSuccess(`⚠️ Asignado, pero FALLÓ el envío del recibo.`); break;
                default: showSuccess(`✅ Asignado correctamente.`);
            }
            
            limpiarSeleccion();
        } catch (error: any) {
            showError("Error al asignar plan");
        } finally {
            setLoadingAction(false);
        }
    };

    return {
        // Datos
        planesDisponibles,
        alumnoSeleccionado,
        sugerencias,
        busqueda,
        loading: loadingPlans || loadingSearch, // Loading combinado
        loadingAction,
        metodoPago,
        
        // Acciones
        setBusqueda, // Para el input
        handleSearchChange, // Para el onChange
        seleccionarAlumno,
        limpiarSeleccion,
        renovarPlan,
        cancelarPlan,
        asignarPlan,
        setMetodoPago
    };
};