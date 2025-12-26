import React from "react";
import { Navbar } from "../Navbar"; // Ajusta la ruta si es necesario

interface PageLayoutProps {
  children: React.ReactNode;
  showNavbar?: boolean;
  centered?: boolean; // Para el Login
}

export const PageLayout = ({ children, showNavbar = true, centered = false }: PageLayoutProps) => {
  return (
    <div className={`min-h-screen bg-gray-100 pb-10 ${centered ? "flex items-center justify-center bg-gradient-to-br from-green-900 via-green-700 to-green-500" : ""}`}>
      {showNavbar && <Navbar />}
      <div className={`container mx-auto p-4 ${!centered ? "mt-6" : ""}`}>
        {children}
      </div>
    </div>
  );
};