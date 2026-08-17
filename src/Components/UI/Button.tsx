import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "purple" | "blue" | "orange" | "ghost";
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
    secondary: "bg-gray-200 text-gray-700 hover:bg-gray-300",
    purple: "bg-purple-500/20 text-purple-400 border border-purple-500/80 hover:bg-purple-500/30",
    blue: "bg-blue-500/20 text-blue-400 border border-blue-500/80 hover:bg-blue-500/30",
    orange: "bg-orange-500/20 text-orange-400 border border-orange-500/80 hover:bg-orange-500/30",
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