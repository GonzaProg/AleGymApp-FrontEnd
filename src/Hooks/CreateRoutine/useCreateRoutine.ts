import { useState, useEffect } from "react";
import { EjerciciosApi } from "../../API/Ejercicios/EjerciciosApi";
import { RutinasApi } from "../../API/Rutinas/RutinasApi";
import { showSuccess, showError } from "../../Helpers/Alerts";
import { useAlumnoSearch } from "../useAlumnoSearch";

export const useCreateRoutine = (isGeneral: boolean = false, routineIdToEdit: number | null = null) => {

  // Estados para ejercicios y rutina
  const [ejercicios, setEjercicios] = useState<any[]>([]);
  const [nombreRutina, setNombreRutina] = useState("");
  const [alumnoId, setAlumnoId] = useState("");

  // Inputs Detalle
  const [ejercicioId, setEjercicioId] = useState("");
  const [peso, setPeso] = useState(""); 
  const [series, setSeries] = useState<number | string>(4);
  const [reps, setReps] = useState<number | string>(10);

  // Tabla
  const [detalles, setDetalles] = useState<any[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  // Usamos el hook centralizado para la búsqueda de alumnos
  const {
    busqueda,
    sugerencias,
    mostrarSugerencias,
    handleSearchChange,
    handleSelectAlumno,
    setMostrarSugerencias
  } = useAlumnoSearch();

  // Handler para seleccionar alumno con ID
  const handleSelectAlumnoWithId = (alumno: any) => {
    handleSelectAlumno(alumno);
    setAlumnoId(alumno.id);
  };

  // Handler para cambios en búsqueda que resetea el ID
  const handleSearchChangeWithReset = (text: string) => {
    handleSearchChange(text);
    // Si el usuario borra y escribe algo nuevo, reseteamos el ID seleccionado
    if (alumnoId) setAlumnoId(""); 
  };

  // 1. CARGA INICIAL (Solo Ejercicios y Datos de Edición)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const dataEjercicios = await EjerciciosApi.getAll();
        setEjercicios(dataEjercicios);

        // SI HAY ID, ES EDICIÓN: CARGAMOS LA RUTINA
        if (routineIdToEdit) {
            const rutina = await RutinasApi.getOne(routineIdToEdit);
            setNombreRutina(rutina.nombreRutina);
            
            // Si es edición, seteamos el nombre del alumno en el buscador para que se vea
            if (rutina.usuarioAlumno) {
                handleSearchChangeWithReset(`${rutina.usuarioAlumno.nombre} ${rutina.usuarioAlumno.apellido}`);
                setAlumnoId(rutina.usuarioAlumno.id.toString());
            }

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
  }, [isGeneral, routineIdToEdit, handleSearchChangeWithReset]);

  const handleSeriesChange = (e: any) => setSeries(e.target.value);
  const handleRepsChange = (e: any) => setReps(e.target.value);
  const handlePesoChange = (e: any) => setPeso(e.target.value);

  // 3. LÓGICA AGREGAR / ACTUALIZAR FILA
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
        const copia = [...detalles];
        copia[editIndex] = nuevoDetalle;
        setDetalles(copia);
        setEditIndex(null); 
        showSuccess("Fila actualizada");
    } else {
        setDetalles([...detalles, nuevoDetalle]);
    }

    setSeries(4); setReps(10); setPeso("");
  };

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

  // 4. GUARDAR
  const handleSubmit = async () => {
    if ((!isGeneral && !alumnoId) || !nombreRutina || detalles.length === 0) {
      return showError("Completa todos los Datos Generales y agrega al menos un Ejercicio");
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
    handleSearchChange: handleSearchChangeWithReset, handleSelectAlumno: handleSelectAlumnoWithId, 
    handleSeriesChange, handleRepsChange, handlePesoChange, 
    handleAddExercise, handleSubmit,
    editIndex, handleEditRow, cancelEditRow
  };
};