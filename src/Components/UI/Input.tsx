import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLSelectElement> {
  label?: string;
  as?: "input" | "select"; // Para reutilizar estilos en selects
  children?: React.ReactNode; // Para las opciones del select
}

export const Input = ({ label, as = "input", className = "", children, ...props }: InputProps) => {
  const inputStyles = "w-full border p-2 rounded-lg mt-1 focus:ring-2 focus:ring-green-500 outline-none transition bg-white";

  return (
    <div className={`mb-4 ${className}`}>
      {label && <label className="block text-sm font-bold text-gray-600 uppercase tracking-wide">{label}</label>}
      
      {as === "select" ? (
        <select className={inputStyles} {...(props as any)}>
          {children}
        </select>
      ) : (
        <input className={inputStyles} {...props} />
      )}
    </div>
  );
};