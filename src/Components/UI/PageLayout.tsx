import React from "react";
import { Navbar } from "../Navbar";

interface PageLayoutProps {
  children: React.ReactNode;
  showNavbar?: boolean;
  centered?: boolean;     // True para Login
  backgroundImage?: string; // Para el Home
}

export const PageLayout = ({ 
  children, 
  showNavbar = true, 
  centered = false,
  backgroundImage 
}: PageLayoutProps) => {
  
  // --- MODO LOGIN (Centrado y Degradado) ---
  if (centered) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-green-900 via-green-700 to-green-500">
        {/* En modo centrado no mostramos navbar ni imagen, solo el contenido centrado */}
        <div className="w-full max-w-md p-4">
          {children}
        </div>
      </div>
    );
  }

  // --- MODO NORMAL (Home, Rutinas, etc.) ---
  return (
    <div 
      className="min-h-screen flex flex-col relative"
      style={backgroundImage ? { 
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      } : {}}
    >
      {/* Capa oscura si hay imagen */}
      {backgroundImage && (
        <div className="absolute inset-0 bg-black/60 z-0"></div> 
      )}

      {/* Navbar arriba */}
      {showNavbar && <div className="relative z-20"><Navbar /></div>}

      {/* Contenido principal con margen superior */}
      <div className={`container mx-auto p-4 relative z-10 flex-1 mt-6 ${!backgroundImage ? "bg-gray-100" : ""}`}>
        {children}
      </div>
    </div>
  );
};