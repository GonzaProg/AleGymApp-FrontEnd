import { useState, useEffect } from "react";
import { PlansApi, type PlanDTO } from "../../API/Planes/PlansApi";
import { showError, showSuccess, showConfirmSuccess } from "../../Helpers/Alerts";
import { useAlumnoSearch } from "../useAlumnoSearch";

export const usePlans = () => {
    const [planes, setPlanes] = useState<PlanDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [filtroTipo, setFiltroTipo] = useState<'Gym' | 'Natacion' | 'Todos'>('Gym');
    const [alumnoSeleccionadoId, setAlumnoSeleccionadoId] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<PlanDTO | null>(null);
    const [selectedPlanToSubscribe, setSelectedPlanToSubscribe] = useState<PlanDTO | null>(null);
    const [metodoPago, setMetodoPago] = useState("Transferencia");

    // Usamos el hook centralizado para la búsqueda de alumnos
    const {
        busqueda,
        sugerencias,
        mostrarSugerencias,
        todosLosAlumnos,
        handleSearchChange,
        handleSelectAlumno,
        setMostrarSugerencias,
        clearSelection
    } = useAlumnoSearch({ includePlan: true, initialLoad: true });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const listaPlanes = await PlansApi.getAll();
            setPlanes(listaPlanes);
        } catch (err: any) {
            console.error(err);
            showError("Error al cargar los datos.");
        } finally {
            setLoading(false);
        }
    };

    const planesFiltrados = planes.filter(plan => {
        if (filtroTipo === 'Todos') return true;
        return plan.tipo === filtroTipo;
    });

    const handleSelectAlumnoWithId = (alumno: any) => {
        handleSelectAlumno(alumno);
        setAlumnoSeleccionadoId(alumno.id);
    };
    const openCreateModal = () => { setEditingPlan(null); setIsModalOpen(true); };
    const openEditModal = (plan: PlanDTO) => { setEditingPlan(plan); setIsModalOpen(true); };

    const openSubscribeModal = (plan: PlanDTO) => {
        setSelectedPlanToSubscribe(plan);
        clearSelection();
        setAlumnoSeleccionadoId(null);
        setMetodoPago("Transferencia");
        setIsSubscribeModalOpen(true);
    };

    const handleSubscribeUser = async () => {
        if (!selectedPlanToSubscribe || !alumnoSeleccionadoId) {
            return showError("Por favor selecciona un alumno primero.");
        }

        const alumnoObj = todosLosAlumnos.find(u => u.id === alumnoSeleccionadoId);
        
        // SEGURIDAD: Validamos que el alumno exista
        if (!alumnoObj) {
            return showError("El alumno seleccionado no es válido.");
        }

        // Buscamos si ya tiene un plan ACTIVO del MISMO TIPO
        const planMismoTipo = alumnoObj.userPlans?.find(
            (up) => up.activo && up.plan.tipo === selectedPlanToSubscribe.tipo
        );

        if (planMismoTipo) {
            const result = await showConfirmSuccess(
                `Sustituir Plan de ${selectedPlanToSubscribe.tipo}`,
                `⚠️ ${alumnoObj.nombre} ya tiene el plan "${planMismoTipo.plan.nombre}".\n\n` +
                `¿Deseas darlo de baja y activar el nuevo plan "${selectedPlanToSubscribe.nombre}"?`
            );
            
            if (!result.isConfirmed) return;

            try {
                setLoading(true);
                // Usamos el ID de la suscripción específica (UserPlan.id)
                await PlansApi.cancelPlan(planMismoTipo.id);
            } catch (err) {
                setLoading(false);
                return showError("No se pudo dar de baja el plan anterior.");
            }
        } else {
            const result = await showConfirmSuccess(
                "¿Confirmar Asignación?",
                `¿Asignar "${selectedPlanToSubscribe.nombre}" a ${alumnoObj.nombre}?`
            );
            if (!result.isConfirmed) return;
        }

        try {
            const response: any = await PlansApi.subscribeUser(
                alumnoSeleccionadoId, 
                selectedPlanToSubscribe.id!, 
                metodoPago
            );
            
            switch (response.estadoRecibo) {
                case 'ENVIADO': showSuccess(`✅ Plan asignado y recibo enviado.`); break;
                case 'ERROR': showSuccess(`⚠️ Plan asignado, pero falló el envío del recibo.`); break;
                default: showSuccess(`✅ Plan asignado correctamente.`);
            }

            setIsSubscribeModalOpen(false);
            loadData();
        } catch (error: any) {
            showError("Error: " + (error.response?.data?.error || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleSavePlan = async (formData: PlanDTO) => {
        try {
            if (editingPlan?.id) {
                await PlansApi.update(editingPlan.id, formData);
                showSuccess("Plan actualizado correctamente.");
            } else {
                await PlansApi.create(formData);
                showSuccess("Plan creado correctamente.");
            }
            setIsModalOpen(false);
            loadData();
        } catch (err: any) {
            showError("Error: " + (err.response?.data?.message || err.message));
        }
    };

    return {
        planes, planesFiltrados, loading, filtroTipo, setFiltroTipo,
        isModalOpen, isSubscribeModalOpen, editingPlan, selectedPlanToSubscribe,
        busqueda, sugerencias, mostrarSugerencias, metodoPago,
        setIsModalOpen, setIsSubscribeModalOpen, setMostrarSugerencias,
        openCreateModal, openEditModal, openSubscribeModal,
        handleSavePlan, handleSubscribeUser, handleSearchChange,
        handleSelectAlumno: handleSelectAlumnoWithId, setMetodoPago
    };
};