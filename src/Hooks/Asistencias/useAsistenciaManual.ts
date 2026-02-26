import { useState, useEffect } from "react";
import { AsistenciaApi } from "../../API/Asistencias/AsistenciaApi";
import { showSuccess, showError } from "../../Helpers/Alerts";

export const useAsistenciaManual = () => {
    const [dni, setDni] = useState("");
    const [loading, setLoading] = useState(false);
    
    // Estados del reporte principal
    const [concurrencia, setConcurrencia] = useState(0);
    const [excedidosHoy, setExcedidosHoy] = useState<any[]>([]);
    const [excedidosMes, setExcedidosMes] = useState<any[]>([]);
    const [loadingReporte, setLoadingReporte] = useState(true);

    // Estados para la interfaz
    const [tabActiva, setTabActiva] = useState<'hoy' | 'mes'>('hoy');
    
    // Estados para el Modal de Historial
    const [modalAbierto, setModalAbierto] = useState(false);
    const [alumnoSeleccionado, setAlumnoSeleccionado] = useState<any>(null);
    const [historialAlumno, setHistorialAlumno] = useState<any[]>([]);
    const [loadingHistorial, setLoadingHistorial] = useState(false);

    const cargarReporte = async () => {
        try {
            const data = await AsistenciaApi.obtenerReporteAdmin();
            setConcurrencia(data.concurrenciaActual);
            setExcedidosHoy(data.excedidosHoy);
            setExcedidosMes(data.excedidosMes);
        } catch (error) {
            console.error("Error al cargar el reporte");
        } finally {
            setLoadingReporte(false);
        }
    };

    useEffect(() => {
        cargarReporte();
    }, []);

    const handleGuardar = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!dni) return showError("Ingresa un DNI");
        
        setLoading(true);
        try {
            await AsistenciaApi.registrarEntradaManual(dni);
            showSuccess("Asistencia registrada correctamente.");
            setDni(""); 
            cargarReporte(); // Refresca las listas si se excede con este ingreso
        } catch (error: any) {
            const errorMsg = error.response?.data?.error || "Error al registrar la asistencia";
            showError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    // Abre el modal y busca el historial de ese alumno
    const verHistorialAlumno = async (alumno: any) => {
        setAlumnoSeleccionado(alumno);
        setModalAbierto(true);
        setLoadingHistorial(true);
        
        try {
            const historial = await AsistenciaApi.obtenerHistorialUsuario(alumno.usuarioId);
            setHistorialAlumno(historial);
        } catch (error) {
            showError("No se pudo cargar el historial del alumno.");
        } finally {
            setLoadingHistorial(false);
        }
    };

    const cerrarModal = () => {
        setModalAbierto(false);
        setHistorialAlumno([]);
        setAlumnoSeleccionado(null);
    };

    return {
        dni, setDni, loading, handleGuardar,
        concurrencia, excedidosHoy, excedidosMes, loadingReporte,
        tabActiva, setTabActiva,
        modalAbierto, cerrarModal, alumnoSeleccionado, historialAlumno, loadingHistorial, verHistorialAlumno
    };
};