import { useState, useEffect, useMemo } from "react";
import { UsuarioApi } from "../../API/Usuarios/UsuarioApi";
import { PlansApi, type PlanDTO } from "../../API/Planes/PlansApi";
import { showConfirmSuccess, showError, showSuccess } from "../../Helpers/Alerts";

export const useRenewPlan = () => {
    // --- ESTADOS DE DATOS ---
    const [todosLosAlumnos, setTodosLosAlumnos] = useState<any[]>([]);
    const [planesDisponibles, setPlanesDisponibles] = useState<PlanDTO[]>([]);
    
    // --- ESTADOS DE UI Y SELECCIÓN ---
    const [busqueda, setBusqueda] = useState("");
    const [alumnoSeleccionado, setAlumnoSeleccionado] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadingAction, setLoadingAction] = useState(false); // Para spinners en botones
    const [metodoPago, setMetodoPago] = useState("Transferencia");

    // 1. Carga inicial de datos
    useEffect(() => {
        cargarDatosIniciales();
    }, []);

    const cargarDatosIniciales = async () => {
        setLoading(true);
        try {
            // Promise.all para cargar en paralelo (Más optimizado)
            const [alumnos, planes] = await Promise.all([
                UsuarioApi.getAlumnos(true), // Traemos planes relacionados
                PlansApi.getAll()
            ]);
            setTodosLosAlumnos(alumnos);
            setPlanesDisponibles(planes);
        } catch (error) {
            console.error("Error cargando datos:", error);
        } finally {
            setLoading(false);
        }
    };

    // 2. Lógica de Filtrado (Memoizado para rendimiento)
    const sugerencias = useMemo(() => {
        if (busqueda.length === 0) return [];
        return todosLosAlumnos.filter(u => 
            `${u.nombre} ${u.apellido}`.toLowerCase().includes(busqueda.toLowerCase())
        );
    }, [busqueda, todosLosAlumnos]);

    // 3. Handlers
    const seleccionarAlumno = (alumno: any) => {
        setAlumnoSeleccionado(alumno);
        setBusqueda(""); // Limpiamos búsqueda para estética
        setMetodoPago("Transferencia");
    };

    const limpiarSeleccion = () => {
        setAlumnoSeleccionado(null);
        setBusqueda("");
    };

    // --- ACCIONES CON LA API ---
    const renovarPlan = async () => {
        if (!alumnoSeleccionado) return;
        setLoadingAction(true);
        try {
            const response: any = await PlansApi.renewPlan(alumnoSeleccionado.id, metodoPago);
            
            switch (response.estadoRecibo) {
                case 'ENVIADO': showSuccess(`✅ Renovado. Recibo enviado 📱`); break;
                case 'DESACTIVADO': showSuccess(`✅ Renovado correctamente.\n(Recibo desactivado 🔕)`); break;
                case 'ERROR': showSuccess(`⚠️ Renovado, pero FALLÓ el envío del recibo.`); break;
                default: showSuccess(`✅ Renovado correctamente.`);
            }

            await cargarDatosIniciales(); 
            setAlumnoSeleccionado((prev: any) => ({...prev, estadoMembresia: 'Activo'})); 
            limpiarSeleccion(); 
        } catch (error: any) {
            showError(error.response?.data?.message || "Error al renovar");
        } finally {
            setLoadingAction(false);
        }
    };

    const cancelarPlan = async () => {
        if (!alumnoSeleccionado) return;

        const result = await showConfirmSuccess( 
                        `¿Cancelar plan?`,
                        `¿Deseas cancelar la membresía de ${alumnoSeleccionado.nombre}?`);
                        
        if (!result.isConfirmed) return;

        setLoadingAction(true);
        try {
            await PlansApi.cancelPlan(alumnoSeleccionado.id);
            // Actualización optimista local
            setAlumnoSeleccionado({ ...alumnoSeleccionado, planActual: null });
            await cargarDatosIniciales(); // Sincronización real de fondo
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
                        `¿Deseas asignar el plan "${plan.nombre}" a ${alumnoSeleccionado.nombre}?`);
                        
        if (!result.isConfirmed) return;

        setLoadingAction(true);
        try {
            const response: any = await PlansApi.subscribeUser(alumnoSeleccionado.id, plan.id!, metodoPago);
            
            switch (response.estadoRecibo) {
                case 'ENVIADO': showSuccess(`✅ Asignado. Recibo enviado 📱`); break;
                case 'DESACTIVADO': showSuccess(`✅ Asignado correctamente.\n(Recibo desactivado 🔕)`); break;
                case 'ERROR': showSuccess(`⚠️ Asignado, pero FALLÓ el envío del recibo.`); break;
                default: showSuccess(`✅ Asignado correctamente.`);
            }
            
            await cargarDatosIniciales();
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
        loading,
        loadingAction,
        metodoPago,
        
        // Acciones
        setBusqueda,
        seleccionarAlumno,
        limpiarSeleccion,
        renovarPlan,
        cancelarPlan,
        asignarPlan,
        setMetodoPago
    };
};