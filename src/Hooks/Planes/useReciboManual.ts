import { useState, useEffect, useMemo } from "react";
import { UsuarioApi } from "../../API/Usuarios/UsuarioApi";
import { PlansApi } from "../../API/Planes/PlansApi";
import { showError, showSuccess } from "../../Helpers/Alerts";

export const useManualReceipt = () => {
    // Datos
    const [todosLosAlumnos, setTodosLosAlumnos] = useState<any[]>([]);
    
    // UI
    const [busqueda, setBusqueda] = useState("");
    const [alumnoSeleccionado, setAlumnoSeleccionado] = useState<any | null>(null);
    const [loadingData, setLoadingData] = useState(false);
    const [sending, setSending] = useState(false);

    // 1. Carga inicial
    useEffect(() => {
        const cargar = async () => {
            setLoadingData(true);
            try {
                // Traemos alumnos con sus planes (true)
                const data = await UsuarioApi.getAlumnos(true);
                setTodosLosAlumnos(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoadingData(false);
            }
        };
        cargar();
    }, []);

    // 2. Filtrado optimizado
    const sugerencias = useMemo(() => {
        if (busqueda.length === 0) return [];
        return todosLosAlumnos.filter(u => 
            `${u.nombre} ${u.apellido}`.toLowerCase().includes(busqueda.toLowerCase())
        );
    }, [busqueda, todosLosAlumnos]);

    // 3. Handlers
    const seleccionarAlumno = (alumno: any) => {
        setAlumnoSeleccionado(alumno);
        setBusqueda("");
    };

    const limpiarSeleccion = () => {
        setAlumnoSeleccionado(null);
        setBusqueda("");
    };

    // 4. Acción Enviar
    const enviarRecibo = async () => {
        if (!alumnoSeleccionado) return;
        
        if (!alumnoSeleccionado.planActual) {
            return showError("Este usuario no tiene un plan activo.");
        }

        setSending(true);
        try {
            const response: any = await PlansApi.enviarReciboManual(alumnoSeleccionado.id);

            switch (response.estadoEnvio) {
                case 'ENVIADO': 
                    showSuccess(`📤 Recibo enviado a ${alumnoSeleccionado.nombre} por WhatsApp 📱`); 
                    break;
                case 'SIN_TELEFONO': 
                    showError(`El usuario no tiene teléfono registrado.`); 
                    break;
                case 'ERROR': 
                    showError(`Falló el envío. Verifica la conexión a WhatsApp.`); 
                    break;
            }
        } catch (error: any) {
            showError(error.response?.data?.message || "Error al enviar recibo");
        } finally {
            setSending(false);
        }
    };

    return {
        alumnoSeleccionado,
        sugerencias,
        busqueda,
        setBusqueda,
        seleccionarAlumno,
        limpiarSeleccion,
        enviarRecibo,
        loadingData,
        sending
    };
};