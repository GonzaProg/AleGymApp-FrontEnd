import React from "react";

interface CardProps {
  children: React.ReactNode;
  title?: string; // Título opcional de la tarjeta
  className?: string; // Para agregar clases extra si hace falta
  onClick?: () => void;
}

export const Card = ({ children, title, className = "", onClick }: CardProps) => {
  const isInteractive = !!onClick;
  
  return (
    <div 
      onClick={onClick}
      className={`
        bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden
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