import { useState, useEffect } from "react";
import { EjerciciosApi } from "../../API/Ejercicios/EjerciciosApi";
import { RutinasApi } from "../../API/Rutinas/RutinasApi";
import { showSuccess, showError } from "../../Helpers/Alerts";
import { useAlumnoSearch } from "../useAlumnoSearch";

export const useCreateRoutine = (isGeneral: boolean = false, routineIdToEdit: number | null = null) => {

  // Estados Base
  const [ejercicios, setEjercicios] = useState<any[]>([]);
  const [nombreRutina, setNombreRutina] = useState("");
  
  // ESTADOS CRÍTICOS PARA EDICIÓN
  const [alumnoId, setAlumnoId] = useState(""); 
  const [alumnoNombreDisplay, setAlumnoNombreDisplay] = useState(""); // Solo para mostrar en el cartel

  // --- NUEVA LÓGICA DE EJERCICIOS ---
  // Separamos el texto de búsqueda del ID seleccionado
  const [ejercicioBusqueda, setEjercicioBusqueda] = useState(""); 
  const [ejercicioId, setEjercicioId] = useState("");
  
  // Sugerencias filtradas localmente
  const [ejerciciosFiltrados, setEjerciciosFiltrados] = useState<any[]>([]);
  const [mostrarSugerenciasEjercicios, setMostrarSugerenciasEjercicios] = useState(false);

  // Inputs Detalle
  const [peso, setPeso] = useState(""); 
  const [series, setSeries] = useState<number | string>(4);
  const [reps, setReps] = useState<number | string>(10);

  // Tabla
  const [detalles, setDetalles] = useState<any[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  // Hook del buscador de Alumnos (Solo se usa si estamos CREANDO una rutina PERSONAL)
  const {
    busqueda,
    sugerencias,
    mostrarSugerencias,
    handleSearchChange,
    handleSelectAlumno,
    setMostrarSugerencias,
  } = useAlumnoSearch();

  // 1. CARGA INICIAL (Ejercicios y Datos de Rutina si es edición)
  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const dataEjercicios = await EjerciciosApi.getAll();
        if (mounted) {
            setEjercicios(dataEjercicios);
            setEjerciciosFiltrados(dataEjercicios); // Inicialmente todos
        }

        // --- MODO EDICIÓN ---
        if (routineIdToEdit) {
            const rutina = await RutinasApi.getOne(routineIdToEdit);
            
            if (mounted) {
                setNombreRutina(rutina.nombreRutina);
                
                // Si es personalizada, extraemos el dueño original
                if (!rutina.esGeneral && rutina.usuario) {
                    setAlumnoId(rutina.usuario.id.toString());
                    setAlumnoNombreDisplay(`${rutina.usuario.nombre} ${rutina.usuario.apellido}`);
                }

                // Cargar detalles
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
          showError("Error al cargar la rutina");
      }
    };

    fetchData();

    return () => { mounted = false; };
  }, [routineIdToEdit]); 

  // --- WRAPPER PARA SELECCIONAR ALUMNO (SOLO CREACIÓN) ---
  const onSelectAlumno = (alumno: any) => {
    handleSelectAlumno(alumno); // Actualiza el buscador visual
    setAlumnoId(alumno.id);     // Guarda el ID para el submit
  };

  // --- HANDLERS BUSQUEDA EJERCICIOS ---
  
  const handleEjercicioSearchChange = (text: string) => {
      setEjercicioBusqueda(text);
      setMostrarSugerenciasEjercicios(true);
      
      // Si borra el texto, reseteamos el ID seleccionado y mostramos todos
      if (text === "") {
          setEjercicioId("");
          setEjerciciosFiltrados(ejercicios); 
          return;
      }

      // Filtrar localmente
      const filtrados = ejercicios.filter(e => 
          e.nombre.toLowerCase().includes(text.toLowerCase())
      );
      setEjerciciosFiltrados(filtrados);
  };

  const handleSelectEjercicio = (ejercicio: any) => {
      setEjercicioBusqueda(ejercicio.nombre); // Ponemos el nombre en el input
      setEjercicioId(ejercicio.id.toString()); // Guardamos el ID
      setMostrarSugerenciasEjercicios(false); // Ocultamos lista
  };


  // --- HANDLERS INPUTS ---
  const handleSeriesChange = (e: any) => setSeries(e.target.value);
  const handleRepsChange = (e: any) => setReps(e.target.value);
  const handlePesoChange = (e: any) => setPeso(e.target.value);

  // --- LÓGICA TABLA ---
  const handleAddExercise = () => {
    if (!ejercicioId) return showError("Selecciona un ejercicio válido de la lista");
    
    const pesoFinal = peso.trim() === "" ? "A elección" : peso;
    const ejercicioEncontrado = ejercicios.find((e) => e.id === Number(ejercicioId));
    
    // Si por alguna razón no se encuentra por ID (raro), usamos el texto de búsqueda como fallback visual
    const nombreFinal = ejercicioEncontrado?.nombre || ejercicioBusqueda || "Desconocido";
    
    const nuevoDetalle = {
      ejercicioId: Number(ejercicioId),
      nombreEjercicio: nombreFinal,
      series: Number(series),
      repeticiones: Number(reps),
      peso: pesoFinal,
    };

    if (editIndex !== null) {
        setDetalles(prev => {
            const copia = [...prev];
            copia[editIndex] = nuevoDetalle;
            return copia;
        });
        setEditIndex(null); 
    } else {
        setDetalles(prev => [...prev, nuevoDetalle]);
    }

    // RESET COMPLETO DEL FORMULARIO DE EJERCICIO
    setSeries(4); 
    setReps(10); 
    setPeso(""); 
    setEjercicioId(""); 
    setEjercicioBusqueda(""); // Limpiamos el input visual
  };

  const handleEditRow = (index: number) => {
      const item = detalles[index];
      // Al editar, rellenamos el buscador con el nombre para que el usuario sepa qué es
      setEjercicioId(item.ejercicioId.toString());
      setEjercicioBusqueda(item.nombreEjercicio); 
      setSeries(item.series);
      setReps(item.repeticiones);
      setPeso(item.peso === "A elección" ? "" : item.peso);
      setEditIndex(index);
      
      // Scroll al inicio
      const container = document.querySelector('.principalContainer'); 
      if(container) container.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditRow = () => {
      setEditIndex(null);
      setSeries(4); setReps(10); setPeso(""); 
      setEjercicioId(""); setEjercicioBusqueda("");
  };

  const handleDeleteRow = (index: number) => {
      setDetalles(prev => prev.filter((_, i) => i !== index));
      if (editIndex === index) cancelEditRow();
  };

  // --- GUARDAR ---
  const handleSubmit = async () => {
    if (!nombreRutina.trim()) return showError("Falta el nombre de la rutina");
    if (detalles.length === 0) return showError("Agrega al menos un ejercicio");
    
    // Validación de Alumno solo si es Personalizada
    if (!isGeneral && !alumnoId) {
        return showError("Debes seleccionar un alumno");
    }

    try {
      const body = {
        // Si es general, mandamos null. Si es personal, mandamos el ID.
        usuarioAlumnoId: isGeneral ? null : Number(alumnoId),
        nombreRutina,
        detalles,
        esGeneral: isGeneral
      };

      if (routineIdToEdit) {
          await RutinasApi.update(routineIdToEdit, body);
          await showSuccess("Rutina Actualizada");
      } else {
          await RutinasApi.create(body);
          await showSuccess("Rutina Creada");
      }
      
      // Recarga suave o redirección
      window.location.reload(); 

    } catch (error: any) {
      console.error(error);
      showError("Error al guardar");
    }
  };

  return {
    ejercicios, nombreRutina, detalles,
    // Buscador (Solo se usa en creación)
    busqueda, sugerencias, mostrarSugerencias, 
    handleSearchChange, 
    handleSelectAlumno: onSelectAlumno,
    setMostrarSugerencias, setNombreRutina,
    // Datos de Edición
    alumnoNombreDisplay,
    // Formulario Detalle (NUEVOS)
    ejercicioBusqueda, 
    ejerciciosFiltrados,
    mostrarSugerenciasEjercicios,
    handleEjercicioSearchChange,
    handleSelectEjercicio,
    setMostrarSugerenciasEjercicios,
    // Formulario Detalle (Viejos)
    ejercicioId, setEjercicioId,
    series, handleSeriesChange,
    reps, handleRepsChange,
    peso, handlePesoChange,
    handleAddExercise, 
    editIndex, handleEditRow, cancelEditRow, handleDeleteRow,
    handleSubmit
  };
};