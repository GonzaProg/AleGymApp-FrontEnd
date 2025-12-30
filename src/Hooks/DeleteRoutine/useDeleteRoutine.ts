import { useState, useEffect } from "react";
// 1. Importamos las APIs y el Auth
import { UsuarioApi } from "../../API/Usuarios/UsuarioApi";
import { RutinasApi } from "../../API/Rutinas/RutinasApi";
import { useAuthUser } from "../useAuthUser"; 

export const useDeleteRoutine = () => {
  // --- SEGURIDAD ---
  const { isAdmin, isEntrenador } = useAuthUser(); // Traemos el rol del usuario

  // --- ESTADOS ---
  const [todosLosAlumnos, setTodosLosAlumnos] = useState<any[]>([]);
  const [rutinas, setRutinas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false); // Útil para mostrar spinners

  // Buscador
  const [busqueda, setBusqueda] = useState("");
  const [sugerencias, setSugerencias] = useState<any[]>([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState<any>(null);

  // 1. Cargar lista de alumnos (Al montar)
  useEffect(() => {
    const fetchAlumnos = async () => {
      try {
        // Llamada limpia a la API
        const data = await UsuarioApi.getAlumnos();
        setTodosLosAlumnos(data);
      } catch (error) {
        console.error("Error cargando alumnos", error);
      }
    };
    fetchAlumnos();
  }, []);

  // 2. Lógica del Buscador
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
      setAlumnoSeleccionado(null);
      setRutinas([]);
    }
  };

  // Seleccionar Alumno y cargar sus rutinas
  const handleSelectAlumno = async (alumno: any) => {
    setBusqueda(`${alumno.nombre} ${alumno.apellido}`);
    setAlumnoSeleccionado(alumno);
    setMostrarSugerencias(false);
    setLoading(true);

    try {
      // Llamada limpia a la API
      const data = await RutinasApi.getByUser(alumno.id);
      setRutinas(data);
    } catch (error) {
      console.error("Error cargando rutinas", error);
      setRutinas([]); // Limpiamos si hay error
    } finally {
        setLoading(false);
    }
  };

  // 3. Eliminar Rutina
  const handleDelete = async (rutinaId: number) => {
    // Validación de Seguridad Extra
    if (!isAdmin && !isEntrenador) {
        return alert("Solo los administradores y entrenadores pueden eliminar rutinas.");
    }

    if (!window.confirm("¿Estás SEGURO de eliminar esta rutina? Esta acción no se puede deshacer.")) {
      return;
    }

    try {
      // Llamada limpia a la API
      await RutinasApi.delete(rutinaId);

      // Actualizamos el estado local (Optimistic update)
      setRutinas((prev) => prev.filter((r) => r.id !== rutinaId));
      alert("Rutina eliminada.");
    } catch (error: any) {
      const msg = error.response?.data?.message || "Error al eliminar la rutina.";
      alert(msg);
      console.error(error);
    }
  };

  return {
    busqueda,
    sugerencias,
    mostrarSugerencias,
    alumnoSeleccionado,
    rutinas,
    loading, 
    isAdmin, 
    isEntrenador,
    setMostrarSugerencias,
    handleSearchChange,
    handleSelectAlumno,
    handleDelete,
  };
};