import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const useCreateRoutine = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // --- DATOS ---
  const [todosLosAlumnos, setTodosLosAlumnos] = useState<any[]>([]);
  const [ejercicios, setEjercicios] = useState<any[]>([]);

  // --- BUSCADOR ---
  const [busqueda, setBusqueda] = useState("");
  const [sugerencias, setSugerencias] = useState<any[]>([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);

  // --- FORMULARIO ---
  const [nombreRutina, setNombreRutina] = useState("");
  const [alumnoId, setAlumnoId] = useState("");

  // --- DETALLE ACTUAL ---
  const [ejercicioId, setEjercicioId] = useState("");
  const [peso, setPeso] = useState("");
  const [series, setSeries] = useState<number | string>(4);
  const [reps, setReps] = useState<number | string>(10);

  // --- LISTA FINAL ---
  const [detalles, setDetalles] = useState<any[]>([]);

  // 1. CARGAR DATOS INICIALES
  useEffect(() => {
    const fetchData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        const resEjercicios = await axios.get("http://localhost:3000/api/ejercicios", config);
        setEjercicios(resEjercicios.data);

        const resAlumnos = await axios.get("http://localhost:3000/api/users/alumnos", config);
        setTodosLosAlumnos(resAlumnos.data);
      } catch (error) {
        console.error("Error cargando datos", error);
      }
    };
    fetchData();
  }, [token]);

  // 2. LOGICA DEL BUSCADOR
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
      setAlumnoId("");
    }
  };

  const handleSelectAlumno = (alumno: any) => {
    setBusqueda(`${alumno.nombre} ${alumno.apellido}`);
    setAlumnoId(alumno.id);
    setMostrarSugerencias(false);
  };

  // 3. LOGICA DE INPUTS (Validaciones de negativos en tiempo real)
  const handleSeriesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    if (val < 0) return;
    setSeries(e.target.value);
  };

  const handleRepsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    if (val < 0) return;
    setReps(e.target.value);
  };

  const handlePesoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (parseFloat(e.target.value) < 0) return;
    setPeso(e.target.value);
  };

  // 4. AGREGAR EJERCICIO A LISTA
  const handleAddExercise = () => {
    if (!ejercicioId) return alert("Selecciona un ejercicio");

    const pesoFinal = parseFloat(peso.toString().replace(',', '.'));
    const seriesFinal = parseInt(series.toString());
    const repsFinal = parseInt(reps.toString());

    if (seriesFinal <= 0 || repsFinal <= 0 || pesoFinal < 0) {
      return alert("Los valores deben ser mayores a 0");
    }
    if (isNaN(pesoFinal)) return alert("El peso debe ser un número válido");

    // VALIDACIÓN HULK
    if (pesoFinal >= 1000) {
      return alert("¿Vas a poder levantar ese Peso? ¿Sos HULK? 🟢💪");
    }

    const ejercicioNombre = ejercicios.find(e => e.id === parseInt(ejercicioId))?.nombre;

    const nuevoDetalle = {
      ejercicioId: parseInt(ejercicioId),
      nombreEjercicio: ejercicioNombre,
      series: seriesFinal,
      repeticiones: repsFinal,
      peso: pesoFinal
    };

    setDetalles([...detalles, nuevoDetalle]);
    
    // Reset inputs
    setSeries(4);
    setReps(10);
    setPeso("");
  };

  // 5. GUARDAR EN BACKEND
  const handleSubmit = async () => {
    if (!alumnoId || !nombreRutina || detalles.length === 0) {
      return alert("Completa todos los datos y agrega al menos un ejercicio");
    }

    try {
      const body = {
        usuarioAlumnoId: parseInt(alumnoId),
        nombreRutina,
        detalles
      };

      await axios.post("http://localhost:3000/api/rutinas", body, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("Rutina creada con éxito!");
      navigate("/home");
    } catch (error: any) {
      alert(error.response?.data?.error || "Error al crear rutina");
    }
  };

  // Retornamos todo lo que la vista necesita
  return {
    // Datos
    ejercicios,
    busqueda,
    sugerencias,
    mostrarSugerencias,
    nombreRutina,
    detalles,
    // Inputs del form detalle
    ejercicioId,
    series,
    reps,
    peso,
    // Setters simples
    setNombreRutina,
    setEjercicioId,
    setMostrarSugerencias,
    setDetalles, // Para borrar items de la lista
    // Handlers complejos
    handleSearchChange,
    handleSelectAlumno,
    handleSeriesChange,
    handleRepsChange,
    handlePesoChange,
    handleAddExercise,
    handleSubmit
  };
};