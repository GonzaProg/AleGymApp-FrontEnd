import React from "react";
import { Navbar } from "../Navbar";

interface PageLayoutProps {
  children: React.ReactNode;
  showNavbar?: boolean;
  centered?: boolean;
  backgroundImage?: string;
}

export const PageLayout = ({ 
  children, 
  showNavbar = true, 
  centered = false,
  backgroundImage 
}: PageLayoutProps) => {
  
  // --- MODO LOGIN (Centrado) ---
  if (centered) {
    return (
      <div 
        className={`min-h-screen w-full flex items-center justify-center relative ${!backgroundImage ? "bg-gradient-to-br from-green-900 via-green-700 to-green-500" : ""}`}
        style={backgroundImage ? { 
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
        } : {}}
      >
        {/* Bajamos la intensidad de bg-black/70 a bg-black/30 para probar */}
        {backgroundImage && (
          <div className="absolute inset-0 bg-black/30 z-0"></div> 
        )}

        <div className="w-full max-w-md p-4 relative z-10">
          {children}
        </div>
      </div>
    );
  }

  // --- MODO NORMAL (Home - SE MANTIENE IGUAL) ---
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
      {/* Aquí seguimos usando bg-black/60 para el Home */}
      {backgroundImage && (
        <div className="absolute inset-0 bg-black/60 z-0"></div> 
      )}
      
      {showNavbar && <div className="relative z-20"><Navbar /></div>}
      
      <div className={`container mx-auto p-4 relative z-10 flex-1 mt-6 ${!backgroundImage ? "bg-gray-100" : ""}`}>
        {children}
      </div>
    </div>
  );
};