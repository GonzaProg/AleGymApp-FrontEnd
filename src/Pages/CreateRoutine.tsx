import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../Components/Navbar";

export const CreateRoutine = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // --- DATOS ---
  const [todosLosAlumnos, setTodosLosAlumnos] = useState<any[]>([]); // Lista completa desde DB
  const [ejercicios, setEjercicios] = useState<any[]>([]);

  // --- BUSCADOR DE ALUMNOS ---
  const [busqueda, setBusqueda] = useState(""); // Lo que escribe el usuario
  const [sugerencias, setSugerencias] = useState<any[]>([]); // La lista filtrada
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  
  // --- FORMULARIO ---
  const [nombreRutina, setNombreRutina] = useState("");
  const [alumnoId, setAlumnoId] = useState("");
  
  // --- ESTADOS PARA AGREGAR UN DETALLE ---
  const [ejercicioId, setEjercicioId] = useState("");
  const [peso, setPeso] = useState(""); 
  const [series, setSeries] = useState<number | string>(4);
  const [reps, setReps] = useState<number | string>(10);

  // --- LISTA DE DETALLES AGREGADOS ---
  const [detalles, setDetalles] = useState<any[]>([]);

  // 1. CARGAR DATOS AL INICIAR
  useEffect(() => {
    const fetchData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        // 1. Cargar Ejercicios
        const resEjercicios = await axios.get("http://localhost:3000/api/ejercicios", config);
        setEjercicios(resEjercicios.data);

        // 2. Cargar Alumnos (NUEVO)
        const resAlumnos = await axios.get("http://localhost:3000/api/users/alumnos", config);
        setTodosLosAlumnos(resAlumnos.data);

      } catch (error) {
        console.error("Error cargando datos", error);
      }
    };
    fetchData();
  }, [token]);

  // 2. AGREGAR EJERCICIO A LA LISTA TEMPORAL
  const handleAddExercise = () => {
    if (!ejercicioId) return alert("Selecciona un ejercicio");

    // Convertimos los valores
    const pesoFinal = parseFloat(peso.toString().replace(',', '.')); 
    const seriesFinal = parseInt(series.toString());
    const repsFinal = parseInt(reps.toString());

    // Validaciones básicas (negativos)
    if (seriesFinal <= 0 || repsFinal <= 0 || pesoFinal < 0) {
      return alert("Los valores deben ser mayores a 0");
    }
    
    if (isNaN(pesoFinal)) return alert("El peso debe ser un número válido");

    // --- NUEVA VALIDACIÓN HULK ---
    // Si el peso es 1000 o más (tiene 4 dígitos enteros), mostramos el mensaje.
    if (pesoFinal >= 1000) {
       return alert("¿Vas a poder levantar ese Peso? ¿Sos HULK? 🟢💪");
    }
    // -----------------------------

    const ejercicioNombre = ejercicios.find(e => e.id === parseInt(ejercicioId))?.nombre;

    const nuevoDetalle = {
      ejercicioId: parseInt(ejercicioId),
      nombreEjercicio: ejercicioNombre,
      series: seriesFinal,
      repeticiones: repsFinal,
      peso: pesoFinal
    };

    setDetalles([...detalles, nuevoDetalle]);
    
    // Resetear inputs
    setSeries(4);
    setReps(10);
    setPeso("");
  };

  // Función cuando el usuario escribe en el buscador
  const handleSearchChange = (text: string) => {
    setBusqueda(text);
    
    if (text.length > 0) {
      // Filtramos por nombre O apellido (ignorando mayúsculas/minúsculas)
      const filtrados = todosLosAlumnos.filter(alumno => {
        const nombreCompleto = `${alumno.nombre} ${alumno.apellido}`.toLowerCase();
        return nombreCompleto.includes(text.toLowerCase());
      });
      setSugerencias(filtrados);
      setMostrarSugerencias(true);
    } else {
      setSugerencias([]);
      setMostrarSugerencias(false);
      // Si borra todo, limpiamos el ID seleccionado
      setAlumnoId(""); 
    }
  };

  // Función al hacer click en un nombre
  const handleSelectAlumno = (alumno: any) => {
    setBusqueda(`${alumno.nombre} ${alumno.apellido}`); // Ponemos el nombre en el input
    setAlumnoId(alumno.id); // Guardamos el ID internamente
    setMostrarSugerencias(false); // Ocultamos la lista
  };

  // 3. GUARDAR RUTINA EN BACKEND
  const handleSubmit = async () => {
    if (!alumnoId || !nombreRutina || detalles.length === 0) {
      return alert("Completa todos los datos y agrega al menos un ejercicio");
    }

    try {
      const body = {
        usuarioAlumnoId: parseInt(alumnoId),
        nombreRutina: nombreRutina,
        detalles: detalles // Enviamos el array que fuimos armando
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

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="container mx-auto p-4">
        <h2 className="text-2xl font-bold text-green-800 mb-6">Nueva Rutina</h2>

        {/* --- GRID RESPONSIVE: 1 col en Móvil, 2 en PC --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* SECCIÓN 1: DATOS GENERALES */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 border-b pb-2">1. Datos Generales</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Nombre de la Rutina</label>
              <input 
                type="text" 
                className="w-full border p-2 rounded mt-1 focus:ring-2 focus:ring-green-500"
                placeholder="Ej: Hipertrofia Semana 1"
                value={nombreRutina}
                onChange={e => setNombreRutina(e.target.value)}
              />
            </div>

            <div className="mb-4 relative"> {/* relative es importante para posicionar la lista */}
              <label className="block text-sm font-medium text-gray-700">Buscar Alumno</label>
              
              <input 
                type="text" 
                className="w-full border p-2 rounded mt-1 focus:ring-2 focus:ring-green-500"
                placeholder="Escribe el nombre del alumno..."
                value={busqueda}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => busqueda && setMostrarSugerencias(true)} // Si vuelve a hacer click, mostramos lista
              />
              
              {/* Campo oculto para verificar que tenemos el ID (Opcional, para debug) */}
              {/* <p className="text-xs text-gray-400 mt-1">ID Seleccionado: {alumnoId}</p> */}

              {/* LISTA DESPLEGABLE FLOTANTE */}
              {mostrarSugerencias && sugerencias.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                  {sugerencias.map((alumno) => (
                    <li 
                      key={alumno.id}
                      onClick={() => handleSelectAlumno(alumno)}
                      className="p-2 hover:bg-green-100 cursor-pointer border-b last:border-b-0 transition"
                    >
                      <span className="font-bold">{alumno.nombre} {alumno.apellido}</span>
                      <span className="text-gray-500 text-xs ml-2">({alumno.email})</span>
                    </li>
                  ))}
                </ul>
              )}
              
              {mostrarSugerencias && sugerencias.length === 0 && busqueda !== "" && (
                 <div className="absolute z-10 w-full bg-white border p-2 text-gray-500 text-sm shadow-lg mt-1">
                   No se encontraron alumnos.
                 </div>
              )}
            </div>
          </div>

          {/* SECCIÓN 2: AGREGAR EJERCICIOS */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 border-b pb-2">2. Agregar Ejercicios</h3>
            
            <div className="mb-3">
              <label className="block text-sm">Ejercicio</label>
              <select 
                className="w-full border p-2 rounded"
                value={ejercicioId}
                onChange={e => setEjercicioId(e.target.value)}
              >
                <option value="">-- Seleccionar --</option>
                {ejercicios.map(ej => (
                  <option key={ej.id} value={ej.id}>{ej.nombre}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              <div>
                <label className="text-xs font-bold">Series</label>
                <input 
                  type="number" 
                  min="1" // Mínimo 1 serie
                  className="w-full border p-2 rounded" 
                  value={series} 
                  // Evitamos que escriban negativos manualmente
                  onChange={e => {
                    const val = parseInt(e.target.value);
                    if (val < 0) return; // Si intenta poner negativo, no hace nada
                    setSeries(e.target.value);
                  }} 
                />
              </div>
              <div>
                <label className="text-xs font-bold">Reps</label>
                <input 
                  type="number" 
                  min="1" // Mínimo 1 repetición
                  className="w-full border p-2 rounded" 
                  value={reps} 
                  onChange={e => {
                    const val = parseInt(e.target.value);
                    if (val < 0) return;
                    setReps(e.target.value);
                  }} 
                />
              </div>
              <div>
                <label className="text-xs font-bold">Peso (kg)</label>
                <input 
                  type="number" 
                  min="0"
                  step="0.1" // IMPORTANTE: Permite decimales (ej: 12.5)
                  className="w-full border p-2 rounded" 
                  placeholder="0"
                  value={peso} 
                  onChange={e => {
                    // Validar negativo
                    if (parseFloat(e.target.value) < 0) return;
                    
                    // Guardamos tal cual escribe el usuario (string). 
                    // Esto permite escribir "12." sin que se borre el punto.
                    setPeso(e.target.value); 
                  }}
                  // Truco visual: Si presiona la tecla punto o coma, lo dejamos pasar
                  // Type="number" generalmente respeta la configuración de tu PC (punto o coma)
                />
              </div>
            </div>

            <button 
              onClick={handleAddExercise}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            >
              + Agregar a la lista
            </button>
          </div>
        </div>

        {/* --- LISTA DE EJERCICIOS AGREGADOS --- */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Resumen de Rutina</h3>
          
          {detalles.length === 0 ? (
            <p className="text-gray-400 italic">No has agregado ejercicios aún.</p>
          ) : (
            <div className="overflow-x-auto"> {/* Scroll horizontal si la tabla es muy ancha en móvil */}
              <table className="min-w-full text-sm text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-2">Ejercicio</th>
                    <th className="p-2">Series</th>
                    <th className="p-2">Reps</th>
                    <th className="p-2">Peso</th>
                    <th className="p-2">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {detalles.map((d, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2 font-medium">{d.nombreEjercicio}</td>
                      <td className="p-2">{d.series}</td>
                      <td className="p-2">{d.repeticiones}</td>
                      <td className="p-2">{d.peso} kg</td>
                      <td className="p-2">
                        <button 
                          onClick={() => setDetalles(detalles.filter((_, i) => i !== index))}
                          className="text-red-500 hover:text-red-700 font-bold"
                        >
                          X
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button 
              onClick={handleSubmit}
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 shadow-lg"
            >
              CONFIRMAR Y CREAR RUTINA
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};