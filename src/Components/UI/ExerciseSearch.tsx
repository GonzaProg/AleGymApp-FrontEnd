import { useState, useRef, useEffect, useMemo } from "react";
import { AppStyles } from "../../Styles/AppStyles";

interface Exercise {
  id: number;
  nombre: string;
}

interface ExerciseSearchProps {
  exercises: Exercise[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  labelClassName?: string;
}

export const ExerciseSearch = ({ 
  exercises, 
  value, 
  onChange, 
  placeholder = "Seleccionar ejercicio...",
  className = "",
}: ExerciseSearchProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Usar useMemo para filtrar ejercicios eficientemente
  const filteredExercises = useMemo(() => {
    if (searchTerm.trim() === "") {
      return exercises;
    }
    return exercises.filter(exercise =>
      exercise.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [exercises, searchTerm]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Limpiar searchTerm cuando el value se limpia externamente
  useEffect(() => {
    if (!value) {
      setSearchTerm("");
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (!isOpen) setIsOpen(true);
  };

  const handleSelectExercise = (exercise: Exercise) => {
    onChange(exercise.id.toString());
    setSearchTerm(exercise.nombre);
    setIsOpen(false);
  };

  const handleFocus = () => {
    setIsOpen(true);
    if (!value) {
      setSearchTerm("");
    } else {
      // Si ya hay un valor seleccionado, mostrar su nombre
      const selectedExercise = exercises.find(ex => ex.id.toString() === value);
      setSearchTerm(selectedExercise?.nombre || "");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      // Si no hay selección válida, limpiar
      if (!value) {
        setSearchTerm("");
      }
    }
  };

  const handleBlur = () => {
    // En click sobre una opción, el input pierde el foco antes de que el parent actualice `value`.
    // Evitamos limpiar acá para no interferir con la selección.
    window.setTimeout(() => {
      if (!value && !isOpen) {
        setSearchTerm("");
      }
    }, 0);
  };

  // Obtener el nombre del ejercicio seleccionado
  const selectedExercise = exercises.find(ex => ex.id.toString() === value);
  const displayValue = searchTerm || (selectedExercise?.nombre || "");

  return (
    <div className="relative" ref={dropdownRef}>
      <input
        type="text"
        value={displayValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`${AppStyles.inputDark} ${className} cursor-pointer`}
      />
      
      {/* Icono de búsqueda/desplegable */}
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          )}
        </svg>
      </div>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl max-h-60 overflow-y-auto z-50">
          {filteredExercises.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              {searchTerm.trim() === "" ? "No hay ejercicios disponibles" : "No se encontraron ejercicios"}
            </div>
          ) : (
            <ul className="py-2">
              {filteredExercises.map((exercise) => (
                <li
                  key={exercise.id}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelectExercise(exercise);
                  }}
                  className={`px-4 py-3 cursor-pointer transition-colors hover:bg-white/10 ${
                    value === exercise.id.toString() ? 'bg-green-500/20 text-green-400' : 'text-gray-200'
                  }`}
                >
                  <div className="font-medium">{exercise.nombre}</div>
                  {value === exercise.id.toString() && (
                    <div className="text-xs text-green-400 mt-1">✓ Seleccionado</div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
