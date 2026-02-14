import { useState } from "react";
import { RutinasApi } from "../../API/Rutinas/RutinasApi";
import api from "../../API/axios";
import { showSuccess, showError, showConfirmSuccess } from "../../Helpers/Alerts";
import { useAlumnoSearch } from "../useAlumnoSearch";

export const useSendRoutinePDF = () => {
  // --- ESTADOS ---
  const [rutinas, setRutinas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false); 
  
  // Estado específico para saber qué rutina se está enviando (spinner individual)
  const [sendingId, setSendingId] = useState<number | null>(null);

  // Usamos el hook centralizado para la búsqueda de alumnos
  const {
    busqueda,
    sugerencias,
    mostrarSugerencias,
    alumnoSeleccionado,
    handleSearchChange,
    handleSelectAlumno,
    setMostrarSugerencias,
    clearSelection
  } = useAlumnoSearch({ initialLoad: true });

  // 3. Seleccionar Alumno
  const handleSelectAlumnoWithRutinas = async (alumno: any) => {
    handleSelectAlumno(alumno);
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
      // Enviamos el ID del alumno seleccionado para rutinas generales
      const payload = alumnoSeleccionado ? { alumnoId: alumnoSeleccionado.id } : {};
      
      // Llamamos al endpoint específico con el payload
      await api.post(`/rutinas/${rutinaId}/enviar-whatsapp`, payload);
      
      showSuccess("PDF enviado correctamente 📤");
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || "Error al enviar el PDF o conectar con WhatsApp.";
      showError(msg);
    } finally {
      setSendingId(null); // Apagamos spinner
    }
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
    handleSelectAlumno: handleSelectAlumnoWithRutinas,
    handleSendPDF,
    clearSelection
  };
};