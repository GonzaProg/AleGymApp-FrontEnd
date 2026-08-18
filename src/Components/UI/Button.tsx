import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "cancelar" | "danger" | "info" | "purple" | "blue" | "orange" | "ghost";
  fullWidth?: boolean;
  size?: "sm" | "md" | "lg"; 
}

export const Button = ({ 
  variant = "primary", 
  fullWidth = false, 
  size = "md",
  className = "", 
  children, 
  ...props 
}: ButtonProps) => {
  
  // Estilos para cada tamaño
  const sizeStyles = {
    sm: "px-3 py-1 text-sm",          // Pequeño
    md: "px-6 py-2 font-bold",        // Normal
    lg: "px-8 py-3 text-lg font-bold" // Grande
  };

  const variantStyles = {
    primary: "bg-green-600 text-white hover:bg-green-700",
    cancelar: "bg-black/40 text-white hover:bg-black/20",
    danger: "bg-red-500 text-white hover:bg-red-600",
    info: "bg-blue-600 text-white hover:bg-blue-700",
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