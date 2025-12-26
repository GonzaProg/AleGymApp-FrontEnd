import React from "react";

interface CardProps {
  children: React.ReactNode;
  title?: string; 
  className?: string; 
  onClick?: () => void;
}

export const Card = ({ children, title, className = "", onClick }: CardProps) => {
  const isInteractive = !!onClick;
  
  const defaultStyles = className.includes("bg-") 
    ? "" // Si trae color, no ponemos nada base
    : "bg-white border-gray-100"; // Si no trae, ponemos blanco y borde gris

  return (
    <div 
      onClick={onClick}
      className={`
        rounded-xl shadow-lg border overflow-hidden
        ${defaultStyles}
        ${isInteractive ? "cursor-pointer hover:shadow-2xl transition duration-300 transform hover:-translate-y-1" : ""}
        ${className}
      `}
    >
      {title && (
        <div className="border-b px-6 py-4">
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};