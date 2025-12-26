import { useState, useEffect } from "react";
import axios from "axios";

export const useDeleteRoutine = () => {
  const token = localStorage.getItem("token");

  // --- ESTADOS ---
  const [todosLosAlumnos, setTodosLosAlumnos] = useState<any[]>([]);
  const [rutinas, setRutinas] = useState<any[]>([]);

  // Buscador
  const [busqueda, setBusqueda] = useState("");
  const [sugerencias, setSugerencias] = useState<any[]>([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState<any>(null);

  // 1. Cargar lista de alumnos al iniciar
  useEffect(() => {
    const fetchAlumnos = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/users/alumnos", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTodosLosAlumnos(res.data);
      } catch (error) {
        console.error("Error cargando alumnos", error);
      }
    };
    fetchAlumnos();
  }, [token]);

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
      setRutinas([]); // Limpiamos rutinas si borra el nombre
    }
  };

  const handleSelectAlumno = async (alumno: any) => {
    setBusqueda(`${alumno.nombre} ${alumno.apellido}`);
    setAlumnoSeleccionado(alumno);
    setMostrarSugerencias(false);

    // Cargar rutinas de este alumno
    try {
      const res = await axios.get(`http://localhost:3000/api/rutinas/usuario/${alumno.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
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
      await axios.delete(`http://localhost:3000/api/rutinas/${rutinaId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Actualizamos la lista visualmente quitando la eliminada
      setRutinas(rutinas.filter(r => r.id !== rutinaId));
      alert("Rutina eliminada.");
    } catch (error) {
      alert("Error al eliminar la rutina.");
      console.error(error);
    }
  };

  // Retornamos lo que la vista necesita
  return {
    busqueda,
    sugerencias,
    mostrarSugerencias,
    alumnoSeleccionado,
    rutinas,
    setMostrarSugerencias, // Necesario para el onFocus del input
    handleSearchChange,
    handleSelectAlumno,
    handleDelete
  };
};