import { useState, useEffect } from "react";
import { PlansApi, type PlanDTO } from "../../API/Planes/PlansApi";
import { UsuarioApi, type AlumnoDTO } from "../../API/Usuarios/UsuarioApi"; 
import { showError, showSuccess, showConfirmSuccess } from "../../Helpers/Alerts";

export const usePlans = () => {
    const [planes, setPlanes] = useState<PlanDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [filtroTipo, setFiltroTipo] = useState<'Gym' | 'Natacion' | 'Todos'>('Gym');
    const [todosLosAlumnos, setTodosLosAlumnos] = useState<AlumnoDTO[]>([]);
    const [busqueda, setBusqueda] = useState("");
    const [sugerencias, setSugerencias] = useState<AlumnoDTO[]>([]);
    const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
    const [alumnoSeleccionadoId, setAlumnoSeleccionadoId] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<PlanDTO | null>(null);
    const [selectedPlanToSubscribe, setSelectedPlanToSubscribe] = useState<PlanDTO | null>(null);
    const [metodoPago, setMetodoPago] = useState("Transferencia");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [listaPlanes, dataAlumnos] = await Promise.all([
                PlansApi.getAll(),
                UsuarioApi.getAlumnos(true) 
            ]);
            setPlanes(listaPlanes);
            setTodosLosAlumnos(dataAlumnos);
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

    const handleSearchChange = (text: string) => {
        setBusqueda(text);
        if (text.length > 0) {
            const filtrados = todosLosAlumnos.filter((alumno) => {
                const nombreCompleto = `${alumno.nombre} ${alumno.apellido}`.toLowerCase();
                return nombreCompleto.includes(text.toLowerCase());
            });
            setSugerencias(filtrados);
            setMostrarSugerencias(true);
        } else {
            setSugerencias([]);
            setMostrarSugerencias(false);
            setAlumnoSeleccionadoId(null);
        }
    };

    const handleSelectAlumno = (alumno: AlumnoDTO) => {
        setBusqueda(`${alumno.nombre} ${alumno.apellido}`);
        setAlumnoSeleccionadoId(alumno.id);
        setMostrarSugerencias(false);
    };

    const openCreateModal = () => { setEditingPlan(null); setIsModalOpen(true); };
    const openEditModal = (plan: PlanDTO) => { setEditingPlan(plan); setIsModalOpen(true); };
    const openSubscribeModal = (plan: PlanDTO) => {
        setSelectedPlanToSubscribe(plan);
        setBusqueda("");
        setAlumnoSeleccionadoId(null);
        setSugerencias([]);
        setMetodoPago("Transferencia");
        setIsSubscribeModalOpen(true);
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
    
    return {
        planes, planesFiltrados, loading, filtroTipo, setFiltroTipo,
        isModalOpen, isSubscribeModalOpen, editingPlan, selectedPlanToSubscribe,
        busqueda, sugerencias, mostrarSugerencias, metodoPago,
        setIsModalOpen, setIsSubscribeModalOpen, setMostrarSugerencias,
        openCreateModal, openEditModal, openSubscribeModal,
        handleSavePlan, handleSubscribeUser, handleSearchChange,
        handleSelectAlumno, setMetodoPago
    };
};