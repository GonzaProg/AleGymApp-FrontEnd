import { useState, useEffect } from "react";
import { EjerciciosApi } from "../../API/Ejercicios/EjerciciosApi";
import { UsuarioApi } from "../../API/Usuarios/UsuarioApi";
import { RutinasApi } from "../../API/Rutinas/RutinasApi";
import { showSuccess, showError } from "../../Helpers/Alerts";

export const useCreateRoutine = (isGeneral: boolean = false, routineIdToEdit: number | null = null) => {

  const [todosLosAlumnos, setTodosLosAlumnos] = useState<any[]>([]);
  const [ejercicios, setEjercicios] = useState<any[]>([]);

  // Inputs
  const [busqueda, setBusqueda] = useState("");
  const [sugerencias, setSugerencias] = useState<any[]>([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [nombreRutina, setNombreRutina] = useState("");
  const [alumnoId, setAlumnoId] = useState("");

  // Inputs Detalle
  const [ejercicioId, setEjercicioId] = useState("");
  const [peso, setPeso] = useState(""); 
  const [series, setSeries] = useState<number | string>(4);
  const [reps, setReps] = useState<number | string>(10);

  // Tabla
  const [detalles, setDetalles] = useState<any[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null); // Índice de la fila que editamos

  // 1. CARGA INICIAL (Ejercicios y Datos de Edición)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const dataEjercicios = await EjerciciosApi.getAll();
        setEjercicios(dataEjercicios);

        if (!isGeneral) {
            const dataAlumnos = await UsuarioApi.getAlumnos();
            setTodosLosAlumnos(dataAlumnos);
        }

        // SI HAY ID, ES EDICIÓN: CARGAMOS LA RUTINA
        if (routineIdToEdit) {
            const rutina = await RutinasApi.getOne(routineIdToEdit);
            setNombreRutina(rutina.nombreRutina);
            const detallesFormateados = rutina.detalles.map((d: any) => ({
                ejercicioId: d.ejercicio.id,
                nombreEjercicio: d.ejercicio.nombre,
                series: d.series,
                repeticiones: d.repeticiones,
                peso: d.peso
            }));
            setDetalles(detallesFormateados);
        }

      } catch (error) { console.error(error); }
    };
    fetchData();
  }, [isGeneral, routineIdToEdit]);

  // HANDLERS
  const handleSearchChange = (text: string) => {
    setBusqueda(text);
    if (text.length > 0) {
      const filtrados = todosLosAlumnos.filter(a => `${a.nombre} ${a.apellido}`.toLowerCase().includes(text.toLowerCase()));
      setSugerencias(filtrados);
      setMostrarSugerencias(true);
    } else {
      setSugerencias([]);
      setMostrarSugerencias(false);
    }
  };

  const handleSelectAlumno = (alumno: any) => {
    setBusqueda(`${alumno.nombre} ${alumno.apellido}`);
    setAlumnoId(alumno.id);
    setMostrarSugerencias(false);
  };

  // INPUTS EJERCICIO
  const handleSeriesChange = (e: any) => setSeries(e.target.value);
  const handleRepsChange = (e: any) => setReps(e.target.value);
  const handlePesoChange = (e: any) => setPeso(e.target.value);

  // 2. LÓGICA AGREGAR / ACTUALIZAR FILA
  const handleAddExercise = () => {
    if (!ejercicioId) return showError("Selecciona un ejercicio");
    
    const pesoFinal = peso.trim() === "" ? "A elección" : peso;
    const ejercicioNombre = ejercicios.find((e) => e.id === parseInt(ejercicioId))?.nombre;

    const nuevoDetalle = {
      ejercicioId: parseInt(ejercicioId),
      nombreEjercicio: ejercicioNombre,
      series: parseInt(series.toString()),
      repeticiones: parseInt(reps.toString()),
      peso: pesoFinal,
    };

    if (editIndex !== null) {
        // ACTUALIZAR
        const copia = [...detalles];
        copia[editIndex] = nuevoDetalle;
        setDetalles(copia);
        setEditIndex(null); // Salir modo edición
        showSuccess("Fila actualizada");
    } else {
        // AGREGAR NUEVO
        setDetalles([...detalles, nuevoDetalle]);
    }

    // Reset inputs
    setSeries(4); setReps(10); setPeso("");
  };

  // 3. EDITAR FILA (Subir datos al form)
  const handleEditRow = (index: number) => {
      const item = detalles[index];
      setEjercicioId(item.ejercicioId.toString());
      setSeries(item.series);
      setReps(item.repeticiones);
      setPeso(item.peso === "A elección" ? "" : item.peso);
      setEditIndex(index);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditRow = () => {
      setEditIndex(null);
      setSeries(4); setReps(10); setPeso(""); setEjercicioId("");
  };

  // 4. GUARDAR TODO (POST/PUT)
  const handleSubmit = async () => {
    if ((!isGeneral && !alumnoId) || !nombreRutina || detalles.length === 0) {
      return showError("Faltan datos obligatorios.");
    }

    try {
      const body = {
        usuarioAlumnoId: isGeneral ? null : parseInt(alumnoId),
        nombreRutina,
        detalles,
        esGeneral: isGeneral
      };

      if (routineIdToEdit) {
          await RutinasApi.update(routineIdToEdit, body);
          await showSuccess("¡Rutina Actualizada!");
      } else {
          await RutinasApi.create(body);
          await showSuccess("¡Rutina Creada!");
      }
      
      window.location.reload();

    } catch (error: any) {
      showError("Error al guardar la rutina");
    }
  };

  return {
    ejercicios, busqueda, sugerencias, mostrarSugerencias, nombreRutina, detalles,
    ejercicioId, series, reps, peso,
    setNombreRutina, setEjercicioId, setMostrarSugerencias, setDetalles,
    handleSearchChange, handleSelectAlumno, handleSeriesChange, handleRepsChange, handlePesoChange, 
    handleAddExercise, handleSubmit,
    // Nuevos exports
    editIndex, handleEditRow, cancelEditRow
  };
};