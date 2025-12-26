import { useState, useEffect } from "react";
import api from "../../API/axios"; 

export const useDeleteRoutine = () => {
  // --- ESTADOS ---
  const [todosLosAlumnos, setTodosLosAlumnos] = useState<any[]>([]);
  const [rutinas, setRutinas] = useState<any[]>([]);

  // Buscador
  const [busqueda, setBusqueda] = useState("");
  const [sugerencias, setSugerencias] = useState<any[]>([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState<any>(null);

  // 1. Cargar lista de alumnos
  useEffect(() => {
    const fetchAlumnos = async () => {
      try {
        const res = await api.get("/api/users/alumnos");
        setTodosLosAlumnos(res.data);
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
      const filtrados = todosLosAlumnos.filter(alumno => {
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

  const handleSelectAlumno = async (alumno: any) => {
    setBusqueda(`${alumno.nombre} ${alumno.apellido}`);
    setAlumnoSeleccionado(alumno);
    setMostrarSugerencias(false);

    try {
      const res = await api.get(`/api/rutinas/usuario/${alumno.id}`);
      setRutinas(res.data);
    } catch (error) {
      console.error("Error cargando rutinas", error);
    }
  };

  // 3. Eliminar Rutina
  const handleDelete = async (rutinaId: number) => {
    if (!window.confirm("¿Estás SEGURO de eliminar esta rutina? Esta acción no se puede deshacer.")) {
      return;
    }

    try {
      await api.delete(`/api/rutinas/${rutinaId}`);

      setRutinas(rutinas.filter(r => r.id !== rutinaId));
      alert("Rutina eliminada.");
    } catch (error) {
      alert("Error al eliminar la rutina.");
      console.error(error);
    }
  };

  return {
    busqueda,
    sugerencias,
    mostrarSugerencias,
    alumnoSeleccionado,
    rutinas,
    setMostrarSugerencias,
    handleSearchChange,
    handleSelectAlumno,
    handleDelete
  };
};