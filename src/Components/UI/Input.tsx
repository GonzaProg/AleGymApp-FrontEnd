import React from 'react';

// Definimos los tipos para que acepte propiedades tanto de input como de select
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLSelectElement> {
  label?: string;
  labelClassName?: string;
  as?: "input" | "select" | "textarea"; // Propiedad para decirle qué ser
  children?: React.ReactNode; // Necesario para poner las <option> dentro del select
}

export const Input = ({ 
  label, 
  labelClassName = "", 
  className = "", 
  as = "input", // Por defecto se comporta como input normal
  children,
  ...props 
}: InputProps) => {

  // Estilos base compartidos
  const baseClasses = `w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all ${className}`;

  return (
    <div className="w-full">
      {label && (
        <label className={`block mb-1 text-sm font-bold ${labelClassName || "text-gray-700"}`}>
          {label}
        </label>
      )}

      {/* LÓGICA CONDICIONAL: Si as="select", renderiza un menú desplegable */}
      {as === "select" ? (
        <select 
          className={baseClasses}
          {...(props as any)} // "as any" evita conflictos estrictos de TypeScript entre input/select
        >
          {children}
        </select>
      ) : (
        <input
          className={baseClasses}
          {...(props as any)}
        />
      )}
    </div>
  );
};