import { useState, useEffect } from "react";
import { UsuarioApi } from "../../API/Usuarios/UsuarioApi";
import { RutinasApi } from "../../API/Rutinas/RutinasApi";
import api from "../../API/axios";
import { showSuccess, showError, showConfirmSuccess } from "../../Helpers/Alerts";

export const useSendRoutinePDF = () => {
  // --- ESTADOS ---
  const [todosLosAlumnos, setTodosLosAlumnos] = useState<any[]>([]);
  const [rutinas, setRutinas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false); 
  
  // Estado específico para saber qué rutina se está enviando (spinner individual)
  const [sendingId, setSendingId] = useState<number | null>(null);

  // Buscador
  const [busqueda, setBusqueda] = useState("");
  const [sugerencias, setSugerencias] = useState<any[]>([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState<any>(null);

  // 1. Cargar lista de alumnos
  useEffect(() => {
    const fetchAlumnos = async () => {
      try {
        const data = await UsuarioApi.getAlumnos();
        setTodosLosAlumnos(data);
      } catch (error) {
        console.error("Error cargando alumnos", error);
      }
    };
    fetchAlumnos();
  }, []);

  // 2. Lógica del Buscador (Filtrado local)
  const handleSearchChange = (text: string) => {
    setBusqueda(text);
    if (text.length > 0) {
      const filtrados = todosLosAlumnos.filter((alumno) => {
        const nombreCompleto = `${alumno.nombre} ${alumno.apellido}`.toLowerCase();
        // Filtramos por nombre completo
        return nombreCompleto.includes(text.toLowerCase());
      });
      setSugerencias(filtrados);
      setMostrarSugerencias(true);
    } else {
      clearSelection();
    }
  };

  // 3. Seleccionar Alumno
  const handleSelectAlumno = async (alumno: any) => {
    setBusqueda(`${alumno.nombre} ${alumno.apellido}`);
    setAlumnoSeleccionado(alumno);
    setMostrarSugerencias(false);
    setLoading(true);

    try {
      // Reutilizamos tu API existente
      const data = await RutinasApi.getByUser(alumno.id);
      setRutinas(data);
    } catch (error) {
      console.error("Error cargando rutinas", error);
      showError("No se pudieron cargar las rutinas.");
      setRutinas([]);
    } finally {
      setLoading(false);
    }
  };

  // 4. Acción Principal: Enviar PDF
  const handleSendPDF = async (rutinaId: number, nombreRutina: string) => {

    const result = await showConfirmSuccess( 
                "Generar y Enviar PDF",
                `¿Deseas Generar y enviar PDF de "${nombreRutina}" al alumno por WhatsApp?`);
            
    if (!result.isConfirmed) return;

    setSendingId(rutinaId); // Activamos spinner solo en este botón

    try {
      // Llamamos al endpoint específico
      await api.post(`/rutinas/${rutinaId}/enviar-whatsapp`);
      
      showSuccess("PDF enviado correctamente 📤");
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || "Error al enviar el PDF o conectar con WhatsApp.";
      showError(msg);
    } finally {
      setSendingId(null); // Apagamos spinner
    }
  };

  // Helper para limpiar
  const clearSelection = () => {
    setSugerencias([]);
    setMostrarSugerencias(false);
    setAlumnoSeleccionado(null);
    setRutinas([]);
    setBusqueda("");
  };

  return {
    busqueda,
    sugerencias,
    mostrarSugerencias,
    alumnoSeleccionado,
    rutinas,
    loading,
    sendingId,
    setMostrarSugerencias,
    handleSearchChange,
    handleSelectAlumno,
    handleSendPDF,
    clearSelection
  };
};