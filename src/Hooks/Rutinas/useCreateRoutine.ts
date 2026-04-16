import { useState, useEffect } from "react";
import { EjerciciosApi } from "../../API/Ejercicios/EjerciciosApi";
import { RutinasApi } from "../../API/Rutinas/RutinasApi";
import { showSuccess, showError } from "../../Helpers/Alerts";
import { useAlumnoSearch } from "../useAlumnoSearch";

export const useCreateRoutine = (isGeneral: boolean = false, routineIdToEdit: number | null = null, groupIdToEdit: string | null = null) => {

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
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);

  // Inputs Detalle
  const [peso, setPeso] = useState(""); 
  const [series, setSeries] = useState<number | string>(4);
  const [reps, setReps] = useState<string>("10");
  const [tipoSerie, setTipoSerie] = useState<'Estandar' | 'Ascendente' | 'Descendente'>('Estandar');
  const [repsInicial, setRepsInicial] = useState<string>("10");
  const [pesosArray, setPesosArray] = useState<string[]>(Array(4).fill(""));
  const [repsArrayCalculado, setRepsArrayCalculado] = useState<string[]>([]);

  // === SISTEMA MULTI-DÍA ===
  const [dias, setDias] = useState<any[][]>([[]]); // Array de arrays de detalles
  const [diaActual, setDiaActual] = useState(0);   // Índice del día activo
  const MAX_DIAS = 5;

  // Tabla (ahora referencia al día actual)
  const detalles = dias[diaActual] || [];
  const [editIndex, setEditIndex] = useState<number | null>(null);

  // Helper para actualizar detalles del día actual
  const setDetallesDiaActual = (updater: (prev: any[]) => any[]) => {
    setDias(prev => {
      const copia = [...prev];
      copia[diaActual] = updater(copia[diaActual] || []);
      return copia;
    });
  };

  // Agregar nuevo día
  const handleAddDay = () => {
    if (dias.length >= MAX_DIAS) {
      showError(`Máximo ${MAX_DIAS} días por rutina`);
      return;
    }
    setDias(prev => [...prev, []]);
    setDiaActual(dias.length); // Ir al nuevo día
    cancelEditRow();
  };

  // Eliminar día
  const handleRemoveDay = (dayIndex: number) => {
    if (dias.length <= 1) {
      showError("Debe haber al menos 1 día");
      return;
    }
    setDias(prev => prev.filter((_, i) => i !== dayIndex));
    // Ajustar día actual
    if (diaActual >= dias.length - 1) {
      setDiaActual(Math.max(0, dias.length - 2));
    } else if (dayIndex < diaActual) {
      setDiaActual(diaActual - 1);
    }
    cancelEditRow();
  };

  // Cambiar de día
  const handleSelectDay = (dayIndex: number) => {
    cancelEditRow();
    setDiaActual(dayIndex);
  };

  // Hook del buscador de Alumnos (Solo se usa si estamos CREANDO una rutina PERSONAL)
  const {
    busqueda,
    sugerencias,
    mostrarSugerencias,
    handleSearchChange,
    handleSelectAlumno,
    setMostrarSugerencias,
  } = useAlumnoSearch();

  // EFECTO PARA CALCULAR REPETICIONES Y AJUSTAR ARRAY DE PESOS
  useEffect(() => {
     let result: string[] = [];
     const cSeries = Number(series) || 1;
     
     if (tipoSerie === 'Estandar') {
         const parts = reps.split('/');
         for(let i=0; i<cSeries; i++) {
             result.push(parts[i] || parts[parts.length - 1] || "10");
         }
     } else {
         let current = Number(repsInicial) || 10;
         for (let i = 0; i < cSeries; i++) {
             result.push(String(current));
             
             if (tipoSerie === 'Ascendente') {
                 if (current < 12) current += 2;
                 else if (current % 5 === 2) current += 3;
                 else if (current % 5 === 0) current += 2;
                 else current += 2;
             } else {
                 if (current <= 12) current = Math.max(current - 2, 1);
                 else if (current % 5 === 0) current -= 3;
                 else if (current % 5 === 2) current -= 2;
                 else current = Math.max(current - 2, 1);
             }
         }
     }
     setRepsArrayCalculado(result);
     
     setPesosArray(prev => {
         const newArr = [...prev];
         if (newArr.length < cSeries) {
             return [...newArr, ...Array(cSeries - newArr.length).fill("")];
         } else if (newArr.length > cSeries) {
             return newArr.slice(0, cSeries);
         }
         return newArr;
     });
  }, [series, reps, tipoSerie, repsInicial]);

  // Flag de edición (individual o grupo)
  const isEditing = !!(routineIdToEdit || groupIdToEdit);

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

        // --- MODO EDICIÓN INDIVIDUAL ---
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
                setDias([detallesFormateados]); // Un solo día en edición
                setDiaActual(0);
            }
        }

        // --- MODO EDICIÓN MULTI-DÍA ---
        if (groupIdToEdit) {
            const grupo = await RutinasApi.getGrupo(groupIdToEdit);
            
            if (mounted) {
                setNombreRutina(grupo.nombreRutina);
                
                // Si es personalizada, extraemos el dueño original
                if (!grupo.esGeneral && grupo.usuario) {
                    setAlumnoId(grupo.usuario.id.toString());
                    setAlumnoNombreDisplay(`${grupo.usuario.nombre} ${grupo.usuario.apellido}`);
                }

                // Cargar todos los días
                const diasFormateados = grupo.dias.map((dia: any) => 
                    dia.detalles.map((d: any) => ({
                        ejercicioId: d.ejercicio.id,
                        nombreEjercicio: d.ejercicio.nombre,
                        series: d.series,
                        repeticiones: d.repeticiones,
                        peso: d.peso
                    }))
                );
                setDias(diasFormateados);
                setDiaActual(0);
            }
        }
      } catch (error) { 
          console.error(error); 
          showError("Error al cargar la rutina");
      }
    };

    fetchData();

    return () => { mounted = false; };
  }, [routineIdToEdit, groupIdToEdit]); 

  // --- WRAPPER PARA SELECCIONAR ALUMNO (SOLO CREACIÓN) ---
  const onSelectAlumno = (alumno: any) => {
    handleSelectAlumno(alumno); // Actualiza el buscador visual
    setAlumnoId(alumno.id);     // Guarda el ID para el submit
  };

  // --- EFECTO PARA FILTRAR EJERCICIOS ---
  useEffect(() => {
      let filtrados = ejercicios;
      if (selectedMuscle) {
          filtrados = filtrados.filter(e => e.musculoTrabajado === selectedMuscle);
      }
      if (ejercicioBusqueda) {
          filtrados = filtrados.filter(e => 
              e.nombre.toLowerCase().includes(ejercicioBusqueda.toLowerCase())
          );
      }
      setEjerciciosFiltrados(filtrados);
  }, [ejercicios, selectedMuscle, ejercicioBusqueda]);

  const handleEjercicioSearchChange = (text: string) => {
      setEjercicioBusqueda(text);
      setMostrarSugerenciasEjercicios(true);
      if (text === "") setEjercicioId("");
  };

  const handleSelectMuscle = (muscle: string | null) => {
      setSelectedMuscle(muscle);
      setMostrarSugerenciasEjercicios(true);
  };

  const handleSelectEjercicio = (ejercicio: any) => {
      setEjercicioBusqueda(ejercicio.nombre); // Ponemos el nombre en el input
      setEjercicioId(ejercicio.id.toString()); // Guardamos el ID
      setMostrarSugerenciasEjercicios(false); // Ocultamos lista
  };


  // --- HANDLERS INPUTS ---
  const handleSeriesChange = (e: any) => setSeries(e.target.value);
  const handleRepsChange = (e: any) => {
      const value = e.target.value;
      if (/^[\d/-]*$/.test(value)) {
          setReps(value);
      }
  };
  const handleRepsInicialChange = (e: any) => {
      const value = e.target.value;
      if (/^[\d]*$/.test(value)) {
          setRepsInicial(value);
      }
  };
  const handlePesoChange = (e: any) => setPeso(e.target.value);
  const handlePesoArrayChange = (index: number, value: string) => {
      setPesosArray(prev => {
          const newArr = [...prev];
          newArr[index] = value;
          return newArr;
      });
  };

  // --- LÓGICA TABLA ---
  const handleAddExercise = () => {
    if (!ejercicioId) return showError("Selecciona un ejercicio válido de la lista");
    
    // Si viene vacio algún peso, se pone 'A elección'
    const pesoFinal = tipoSerie === 'Estandar' 
        ? (peso.trim() === "" ? "A elección" : peso.trim())
        : pesosArray.map(p => p.trim() === "" || p.trim() === "A elección" ? "A elección" : p.trim()).join('/');
    const repsFinal = tipoSerie === 'Estandar' ? reps : repsArrayCalculado.join('/');

    const ejercicioEncontrado = ejercicios.find((e) => e.id === Number(ejercicioId));
    
    // Si por alguna razón no se encuentra por ID (raro), usamos el texto de búsqueda como fallback visual
    const nombreFinal = ejercicioEncontrado?.nombre || ejercicioBusqueda || "Desconocido";
    
    const nuevoDetalle = {
      ejercicioId: Number(ejercicioId),
      nombreEjercicio: nombreFinal,
      series: Number(series),
      repeticiones: repsFinal,
      peso: pesoFinal,
    };

    if (editIndex !== null) {
        setDetallesDiaActual(prev => {
            const copia = [...prev];
            copia[editIndex] = nuevoDetalle;
            return copia;
        });
        setEditIndex(null); 
    } else {
        setDetallesDiaActual(prev => [...prev, nuevoDetalle]);
    }

    // RESET COMPLETO DEL FORMULARIO DE EJERCICIO
    setSeries(4); 
    setReps("10");
    setTipoSerie('Estandar');
    setRepsInicial("10");
    setPeso("");
    setPesosArray(Array(4).fill(""));
    setEjercicioId(""); 
    setEjercicioBusqueda(""); // Limpiamos el input visual
  };

  const handleEditRow = (index: number) => {
      const item = detalles[index];
      // Al editar, rellenamos el buscador con el nombre para que el usuario sepa qué es
      setEjercicioId(item.ejercicioId.toString());
      setEjercicioBusqueda(item.nombreEjercicio); 
      setSeries(item.series);
      setTipoSerie('Estandar');
      setReps(item.repeticiones);
      setRepsInicial("10");
      
      const pesosParseados = item.peso.split('/');
      // Si es estandar y parseado es único, va a 'peso' general
      if (pesosParseados.length === 1) {
          setPeso(pesosParseados[0] === "A elección" ? "" : pesosParseados[0]);
      } else {
          setPeso("");
      }
      
      // Rellenamos o cortamos según las series puestas (por las dudas)
      const nuevosPesos = Array(item.series).fill("").map((_, i) => pesosParseados[i] === "A elección" ? "" : (pesosParseados[i] || ""));
      setPesosArray(nuevosPesos);
      
      setEditIndex(index);
      
      // Scroll al inicio
      const container = document.querySelector('.principalContainer'); 
      if(container) container.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditRow = () => {
      setEditIndex(null);
      setSeries(4); setReps("10"); setTipoSerie('Estandar'); setRepsInicial("10"); setPeso(""); setPesosArray(Array(4).fill(""));
      setEjercicioId(""); setEjercicioBusqueda("");
  };

  const handleDeleteRow = (index: number) => {
      setDetallesDiaActual(prev => prev.filter((_, i) => i !== index));
      if (editIndex === index) cancelEditRow();
  };

  const moveRowUp = (index: number) => {
      if (index === 0) return;
      setDetallesDiaActual(prev => {
          const copia = [...prev];
          const temp = copia[index];
          copia[index] = copia[index - 1];
          copia[index - 1] = temp;
          return copia;
      });
  };

  const moveRowDown = (index: number) => {
      if (index === detalles.length - 1) return;
      setDetallesDiaActual(prev => {
          const copia = [...prev];
          const temp = copia[index];
          copia[index] = copia[index + 1];
          copia[index + 1] = temp;
          return copia;
      });
  };

  // --- GUARDAR ---
  const handleSubmit = async () => {
    if (!nombreRutina.trim()) return showError("Falta el nombre de la rutina");
    
    // Validar que todos los días tengan al menos un ejercicio
    const diasVacios = dias.filter(d => d.length === 0);
    if (diasVacios.length > 0) {
      return showError(`Hay ${diasVacios.length} día(s) sin ejercicios. Agrega ejercicios a todos los días o elimina los vacíos.`);
    }
    
    // Validación de Alumno solo si es Personalizada
    if (!isGeneral && !alumnoId) {
        return showError("Debes seleccionar un alumno");
    }

    try {
      if (groupIdToEdit) {
        // --- MODO EDICIÓN MULTI-DÍA ---
        const body = {
          nombreRutina,
          dias: dias,
          esGeneral: isGeneral
        };
        await RutinasApi.updateGrupo(groupIdToEdit, body);
        await showSuccess(`Rutina actualizada (${dias.length} días)`);
      } else if (routineIdToEdit) {
        // --- MODO EDICIÓN INDIVIDUAL ---
        const body = {
          usuarioAlumnoId: isGeneral ? null : Number(alumnoId),
          nombreRutina,
          detalles: dias[0] || [],
          esGeneral: isGeneral
        };
        await RutinasApi.update(routineIdToEdit, body);
        await showSuccess("Rutina Actualizada");
      } else if (dias.length === 1) {
        // --- CREACIÓN SIMPLE (1 día) ---
        const body = {
          usuarioAlumnoId: isGeneral ? null : Number(alumnoId),
          nombreRutina,
          detalles: dias[0],
          esGeneral: isGeneral
        };
        await RutinasApi.create(body);
        await showSuccess("Rutina Creada");
      } else {
        // --- CREACIÓN MULTI-DÍA ---
        const body = {
          usuarioAlumnoId: isGeneral ? null : Number(alumnoId),
          nombreRutina,
          dias: dias,
          esGeneral: isGeneral
        };
        await RutinasApi.createMultiDay(body);
        await showSuccess(`Rutina creada con ${dias.length} días`);
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
    selectedMuscle,
    handleSelectMuscle,
    // Formulario Detalle (Viejos y Nuevos)
    ejercicioId, setEjercicioId,
    series, handleSeriesChange,
    tipoSerie, setTipoSerie,
    repsInicial, handleRepsInicialChange,
    reps, handleRepsChange,
    peso, handlePesoChange,
    pesosArray, handlePesoArrayChange, repsArrayCalculado,
    handleAddExercise, 
    editIndex, handleEditRow, cancelEditRow, handleDeleteRow,
    moveRowUp, moveRowDown,
    handleSubmit,
    // --- MULTI-DÍA ---
    dias,
    diaActual,
    handleAddDay,
    handleRemoveDay,
    handleSelectDay,
    MAX_DIAS,
    isEditing,
    groupIdToEdit
  };
};