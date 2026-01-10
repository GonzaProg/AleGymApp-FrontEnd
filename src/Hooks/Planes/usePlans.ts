import { useState, useEffect } from "react";
import { PlansApi, type PlanDTO } from "../../API/Planes/PlansApi";
import { UsuarioApi, type AlumnoDTO } from "../../API/Usuarios/UsuarioApi"; 
import { useAuthUser } from "../useAuthUser";

export const usePlans = () => {
    //  ESTADOS DE DATOS 
    const [planes, setPlanes] = useState<PlanDTO[]>([]);
    const [myPlan, setMyPlan] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    
    //  ESTADOS DE BUSQUEDA DE ALUMNOS 
    const [todosLosAlumnos, setTodosLosAlumnos] = useState<AlumnoDTO[]>([]);
    const [busqueda, setBusqueda] = useState("");
    const [sugerencias, setSugerencias] = useState<AlumnoDTO[]>([]);
    const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
    const [alumnoSeleccionadoId, setAlumnoSeleccionadoId] = useState<number | null>(null);

    //  ESTADOS DE UI 
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<PlanDTO | null>(null);
    const [selectedPlanToSubscribe, setSelectedPlanToSubscribe] = useState<PlanDTO | null>(null);

    const { isEntrenador } = useAuthUser();

    useEffect(() => {
        loadData();
    }, [isEntrenador]);

    const loadData = async () => {
        setLoading(true);
        try {
            const listaPlanes = await PlansApi.getAll();
            setPlanes(listaPlanes);

            if (isEntrenador) {
                try {
                    // Pedimos TRUE para traer también el 'planActual' de cada alumno
                    const dataAlumnos = await UsuarioApi.getAlumnos(true);
                    setTodosLosAlumnos(dataAlumnos);
                } catch (e) { console.error("Error cargando alumnos", e); }
            }

            try {
                const miPlanInfo = await PlansApi.getMyPlan();
                if (miPlanInfo.tienePlan) setMyPlan(miPlanInfo);
            } catch (e) { }

        } catch (err: any) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    //  LOGICA DE BUSCADOR 
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

    //  FUNCIONES DEL MODAL 
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
            } else {
                await PlansApi.create(formData);
            }
            setIsModalOpen(false);
            loadData();
        } catch (err: any) {
            alert("Error: " + (err.response?.data?.message || err.message));
        }
    };

    //  LOGICA PRINCIPAL DE SUSCRIPCIÓN 
    const handleSubscribeUser = async () => {
        if (!selectedPlanToSubscribe || !alumnoSeleccionadoId) {
            return alert("Por favor selecciona un alumno primero.");
        }

        // 1. Buscamos el objeto alumno completo para ver si tiene plan
        const alumnoObj = todosLosAlumnos.find(u => u.id === alumnoSeleccionadoId);

        if (alumnoObj && alumnoObj.planActual) {
            // TIENE PLAN: Pedimos confirmación de cambio
            const mensaje = 
                `⚠️ ${alumnoObj.nombre} ya tiene activo el plan "${alumnoObj.planActual.nombre}".\n\n` +
                `¿Deseas darlo de baja y activar el nuevo plan "${selectedPlanToSubscribe.nombre}" ahora mismo?\n` +
                `(La fecha de vencimiento se reiniciará a partir de hoy).`;
            
            if (!confirm(mensaje)) return;
        } else {
            // NO TIENE PLAN: Confirmación simple
            const nombreAlumno = alumnoObj ? alumnoObj.nombre : "este alumno";
            if (!confirm(`¿Confirmas asignar "${selectedPlanToSubscribe.nombre}" a ${nombreAlumno}?`)) return;
        }

        // 2. Ejecutamos la acción
        try {
            await PlansApi.subscribeUser(alumnoSeleccionadoId, selectedPlanToSubscribe.id!);
            alert(`✅ Plan asignado correctamente.`);
            setIsSubscribeModalOpen(false);
            loadData(); // Recargamos para actualizar la lista de alumnos con sus nuevos planes
        } catch (error: any) {
            alert("Error al asignar: " + (error.response?.data?.message || error.message));
        }
    };

    return {
        planes,
        myPlan,
        loading,
        isModalOpen,
        isSubscribeModalOpen,
        editingPlan,
        selectedPlanToSubscribe,
        isEntrenador,
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