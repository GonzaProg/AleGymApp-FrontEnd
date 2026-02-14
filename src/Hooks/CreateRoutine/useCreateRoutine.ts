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

  // Usamos el hook centralizado
  const {
    busqueda,
    sugerencias,
    mostrarSugerencias,
    handleSearchChange,
    handleSelectAlumno,
    setMostrarSugerencias,
    setBusqueda // Necesario para pre-cargar el nombre al editar
  } = useAlumnoSearch();

  // 1. CARGA INICIAL
  // Quitamos las funciones del array de dependencias para evitar el bucle infinito
  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const dataEjercicios = await EjerciciosApi.getAll();
        if (mounted) setEjercicios(dataEjercicios);

        // SI HAY ID, ES EDICIÓN
        if (routineIdToEdit) {
            const rutina = await RutinasApi.getOne(routineIdToEdit);
            
            if (mounted) {
                setNombreRutina(rutina.nombreRutina);
                
                // Cargar datos del alumno en el buscador y en el estado local
                if (rutina.usuarioAlumno) {
                    setBusqueda(`${rutina.usuarioAlumno.nombre} ${rutina.usuarioAlumno.apellido}`);
                    setAlumnoId(rutina.usuarioAlumno.id.toString());
                }

                // Mapear detalles
                const detallesFormateados = rutina.detalles.map((d: any) => ({
                    ejercicioId: d.ejercicio.id,
                    nombreEjercicio: d.ejercicio.nombre,
                    series: d.series,
                    repeticiones: d.repeticiones,
                    peso: d.peso
                }));
                setDetalles(detallesFormateados);
            }
        }
      } catch (error) { 
          console.error(error); 
      }
    };

    fetchData();

    return () => { mounted = false; };
  }, [routineIdToEdit]); // <--- FIX: Solo se ejecuta si cambia el ID de edición

  // --- HANDLERS ALUMNO ---
  const handleSelectAlumnoWithId = (alumno: any) => {
    handleSelectAlumno(alumno);
    setAlumnoId(alumno.id);
  };

  const handleSearchChangeWithReset = (text: string) => {
    handleSearchChange(text);
    if (alumnoId) setAlumnoId(""); 
  };

  // --- HANDLERS INPUTS ---
  const handleSeriesChange = (e: any) => setSeries(e.target.value);
  const handleRepsChange = (e: any) => setReps(e.target.value);
  const handlePesoChange = (e: any) => setPeso(e.target.value);

  // --- LÓGICA TABLA (Agregar/Editar) ---
  const handleAddExercise = () => {
    if (!ejercicioId) return showError("Selecciona un ejercicio");
    if (Number(series) <= 0 || Number(reps) <= 0) return showError("Series y Reps deben ser mayor a 0");
    
    const pesoFinal = peso.trim() === "" ? "A elección" : peso;
    const ejercicioEncontrado = ejercicios.find((e) => e.id === Number(ejercicioId));
    const ejercicioNombre = ejercicioEncontrado?.nombre || "Desconocido";

    const nuevoDetalle = {
      ejercicioId: Number(ejercicioId),
      nombreEjercicio: ejercicioNombre,
      series: Number(series),
      repeticiones: Number(reps),
      peso: pesoFinal,
    };

    if (editIndex !== null) {
        // Editar
        setDetalles(prev => {
            const copia = [...prev];
            copia[editIndex] = nuevoDetalle;
            return copia;
        });
        setEditIndex(null); 
        showSuccess("Fila actualizada");
    } else {
        // Agregar
        setDetalles(prev => [...prev, nuevoDetalle]);
    }

    // Reset inputs
    setSeries(4); setReps(10); setPeso(""); setEjercicioId("");
  };

  const handleEditRow = (index: number) => {
      const item = detalles[index];
      setEjercicioId(item.ejercicioId.toString());
      setSeries(item.series);
      setReps(item.repeticiones);
      setPeso(item.peso === "A elección" ? "" : item.peso);
      setEditIndex(index);
      // Scroll suave hacia arriba
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditRow = () => {
      setEditIndex(null);
      setSeries(4); setReps(10); setPeso(""); setEjercicioId("");
  };

  const handleDeleteRow = (index: number) => {
      setDetalles(prev => prev.filter((_, i) => i !== index));
      if (editIndex === index) cancelEditRow();
  };

  // 4. GUARDAR
  const handleSubmit = async () => {
    // Validaciones
    if (!nombreRutina.trim()) return showError("El nombre de la rutina es obligatorio");
    if (detalles.length === 0) return showError("Agrega al menos un ejercicio");
    
    // Si NO es general y NO hay ID de alumno (ni nuevo ni precargado)
    if (!isGeneral && !alumnoId) {
        return showError("Debes seleccionar un alumno");
    }

    try {
      const body = {
        usuarioAlumnoId: isGeneral ? null : Number(alumnoId),
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
      console.error(error);
      showError("Error al guardar la rutina");
    }
  };

  return {
    // Datos
    ejercicios, nombreRutina, detalles,
    // Buscador
    busqueda, sugerencias, mostrarSugerencias, 
    handleSearchChange: handleSearchChangeWithReset, 
    handleSelectAlumno: handleSelectAlumnoWithId,
    setMostrarSugerencias, setNombreRutina,
    // Formulario
    ejercicioId, setEjercicioId,
    series, handleSeriesChange,
    reps, handleRepsChange,
    peso, handlePesoChange,
    // Acciones Tabla
    handleAddExercise, 
    editIndex, handleEditRow, cancelEditRow, handleDeleteRow,
    // Submit
    handleSubmit
  };
};