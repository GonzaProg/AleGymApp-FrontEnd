import { useState, useEffect } from "react";
import { PlansApi, type PlanDTO } from "../../API/Planes/PlansApi";
import { UsuarioApi, type AlumnoDTO } from "../../API/Usuarios/UsuarioApi"; 
import { showError, showSuccess } from "../../Helpers/Alerts";

export const usePlans = () => {
    // --- ESTADOS DE DATOS ---
    const [planes, setPlanes] = useState<PlanDTO[]>([]);
    const [loading, setLoading] = useState(false);
    
    // --- ESTADOS DE BUSQUEDA DE ALUMNOS ---
    const [todosLosAlumnos, setTodosLosAlumnos] = useState<AlumnoDTO[]>([]);
    const [busqueda, setBusqueda] = useState("");
    const [sugerencias, setSugerencias] = useState<AlumnoDTO[]>([]);
    const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
    const [alumnoSeleccionadoId, setAlumnoSeleccionadoId] = useState<number | null>(null);

    // --- ESTADOS DE UI ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<PlanDTO | null>(null);
    const [selectedPlanToSubscribe, setSelectedPlanToSubscribe] = useState<PlanDTO | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // Carga paralela de planes y alumnos para el admin
            const [listaPlanes, dataAlumnos] = await Promise.all([
                PlansApi.getAll(),
                UsuarioApi.getAlumnos(true) // true para traer planActual
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

    // --- LOGICA DE BUSCADOR ---
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

    // --- FUNCIONES DEL MODAL ---
    const openCreateModal = () => {
        setEditingPlan(null);
        setIsModalOpen(true);
    };

    const openEditModal = (plan: PlanDTO) => {
        setEditingPlan(plan);
        setIsModalOpen(true);
    };

    const openSubscribeModal = (plan: PlanDTO) => {
        setSelectedPlanToSubscribe(plan);
        setBusqueda("");
        setAlumnoSeleccionadoId(null);
        setSugerencias([]);
        setIsSubscribeModalOpen(true);
    };

    const handleSavePlan = async (formData: PlanDTO) => {
        try {
            if (editingPlan && editingPlan.id) {
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

    // --- LOGICA PRINCIPAL DE SUSCRIPCIÓN ---
    const handleSubscribeUser = async () => {
        if (!selectedPlanToSubscribe || !alumnoSeleccionadoId) {
            return showError("Por favor selecciona un alumno primero.");
        }

        const alumnoObj = todosLosAlumnos.find(u => u.id === alumnoSeleccionadoId);

        if (alumnoObj && alumnoObj.planActual) {
            const mensaje = 
                `⚠️ ${alumnoObj.nombre} ya tiene activo el plan "${alumnoObj.planActual.nombre}".\n\n` +
                `¿Deseas darlo de baja y activar el nuevo plan "${selectedPlanToSubscribe.nombre}" ahora mismo?\n` +
                `(La fecha de vencimiento se reiniciará a partir de hoy).`;
            
            if (!confirm(mensaje)) return;
        } else {
            const nombreAlumno = alumnoObj ? alumnoObj.nombre : "este alumno";
            if (!confirm(`¿Confirmas asignar "${selectedPlanToSubscribe.nombre}" a ${nombreAlumno}?`)) return;
        }

        try {
            await PlansApi.subscribeUser(alumnoSeleccionadoId, selectedPlanToSubscribe.id!);
            showSuccess(`✅ Plan asignado correctamente.`);
            setIsSubscribeModalOpen(false);
            loadData(); 
        } catch (error: any) {
            showError("Error al asignar: " + (error.response?.data?.message || error.message));
        }
    };

    return {
        planes,
        loading,
        isModalOpen,
        isSubscribeModalOpen,
        editingPlan,
        selectedPlanToSubscribe,
        busqueda,
        sugerencias,
        mostrarSugerencias,
        setIsModalOpen,
        setIsSubscribeModalOpen,
        setMostrarSugerencias,
        openCreateModal,
        openEditModal,
        openSubscribeModal,
        handleSavePlan,
        handleSubscribeUser,
        handleSearchChange,
        handleSelectAlumno
    };
};