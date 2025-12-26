import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "danger" | "info" | "secondary" | "ghost";
  fullWidth?: boolean;
  size?: "sm" | "md" | "lg"; 
}

export const Button = ({ 
  variant = "primary", 
  fullWidth = false, 
  size = "md", // <--- Valor por defecto "md"
  className = "", 
  children, 
  ...props 
}: ButtonProps) => {
  
  // Definimos los estilos para cada tamaño
  const sizeStyles = {
    sm: "px-3 py-1 text-sm",      // Pequeño (ideal para tablas)
    md: "px-6 py-2 font-bold",    // Normal
    lg: "px-8 py-3 text-lg font-bold" // Grande (para CTAs importantes)
  };

  const variantStyles = {
    primary: "bg-green-600 text-white hover:bg-green-700",
    danger: "bg-red-500 text-white hover:bg-red-600",
    info: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-gray-700 hover:bg-gray-300",
    ghost: "text-gray-500 hover:bg-gray-100 shadow-none",
  };

  const base = "rounded-lg transition shadow-sm flex items-center justify-center gap-2";
  const width = fullWidth ? "w-full" : "";
  
  return (
    <button 
      className={`${base} ${width} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};