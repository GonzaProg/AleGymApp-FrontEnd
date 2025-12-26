import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLSelectElement> {
  label?: string;
  as?: "input" | "select";
  children?: React.ReactNode;
}

export const Input = ({ label, as = "input", className = "", children, ...props }: InputProps) => {
  // Quitamos 'bg-white' de los estilos base para poder controlarlo desde fuera
  const baseStyles = "w-full border p-3 rounded-lg mt-1 focus:ring-2 focus:ring-green-500 outline-none transition";
  // Si no viene ninguna clase de fondo externa, usamos bg-white por defecto (para el resto de la app)
  const defaultBg = className.includes("bg-") ? "" : "bg-white text-gray-800 border-gray-300";

  const finalStyles = `${baseStyles} ${defaultBg} ${className}`;

  return (
    <div className="mb-4">
      {/* El label ahora se controla desde fuera en el Login, pero lo dejamos aquí por compatibilidad */}
      {label && !className.includes("bg-") && <label className="block text-sm font-bold text-gray-600 uppercase tracking-wide">{label}</label>}
      
      {as === "select" ? (
        <select className={finalStyles} {...(props as any)}>
          {children}
        </select>
      ) : (
        <input className={finalStyles} {...props} />
      )}
    </div>
  );
};