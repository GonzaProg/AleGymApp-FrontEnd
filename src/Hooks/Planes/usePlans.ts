import { useState, useEffect } from "react";
import { PlansApi, type PlanDTO } from "../../API/Planes/PlansApi";
import { UsuarioApi } from "../../API/Usuarios/UsuarioApi"; 
import { useAuthUser } from "../useAuthUser";

export const usePlans = () => {
    //  ESTADOS DE DATOS 
    const [planes, setPlanes] = useState<PlanDTO[]>([]);
    const [myPlan, setMyPlan] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    
    //  ESTADOS DE BUSQUEDA DE ALUMNOS  
    const [todosLosAlumnos, setTodosLosAlumnos] = useState<any[]>([]);
    const [busqueda, setBusqueda] = useState("");
    const [sugerencias, setSugerencias] = useState<any[]>([]);
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

            // Si es entrenador, cargamos los alumnos usando UsuarioApi
            if (isEntrenador) {
                try {
                    const dataAlumnos = await UsuarioApi.getAlumnos();
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

    //  LOGICA DE BUSCADOR (La misma de CreateRoutine) 
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

    const handleSelectAlumno = (alumno: any) => {
        setBusqueda(`${alumno.nombre} ${alumno.apellido}`);
        setAlumnoSeleccionadoId(alumno.id);
        setMostrarSugerencias(false);
    };

    // Funciones del Modal
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
        // Reseteamos el buscador al abrir el modal
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

    const handleSubscribeUser = async () => {
        if (!selectedPlanToSubscribe || !alumnoSeleccionadoId) {
            return alert("Por favor selecciona un alumno primero.");
        }
        try {
            await PlansApi.subscribeUser(alumnoSeleccionadoId, selectedPlanToSubscribe.id!);
            alert(`✅ Plan asignado a ${busqueda} correctamente.`);
            setIsSubscribeModalOpen(false);
            loadData();
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
        // Retornamos las props del buscador
        busqueda,
        sugerencias,
        mostrarSugerencias,
        // Setters
        setIsModalOpen,
        setIsSubscribeModalOpen,
        setMostrarSugerencias,
        // Funciones
        openCreateModal,
        openEditModal,
        openSubscribeModal,
        handleSavePlan,
        handleSubscribeUser,
        handleSearchChange,
        handleSelectAlumno
    };
};