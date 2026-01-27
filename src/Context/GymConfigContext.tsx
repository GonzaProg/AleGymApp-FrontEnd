import React, { createContext, useContext, useState, useEffect } from "react";

interface GymConfigContextType {
  gymCode: string | null;
  isConfigured: boolean;
  setGymLocal: (code: string) => void;
  clearConfig: () => void;
}

const GymConfigContext = createContext<GymConfigContextType | undefined>(undefined);

export const GymConfigProvider = ({ children }: { children: React.ReactNode }) => {
  const [gymCode, setGymCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Al iniciar la app, buscamos si ya existe la configuración guardada
    const storedCode = localStorage.getItem("GYMMATE_LOCAL_CODE");
    if (storedCode) {
      setGymCode(storedCode);
    }
    setLoading(false);
  }, []);

  const setGymLocal = (code: string) => {
    // Guardamos en disco (localStorage persiste aunque cierren la app)
    localStorage.setItem("GYMMATE_LOCAL_CODE", code);
    setGymCode(code);
  };

  const clearConfig = () => {
    // Por si necesitas resetear la instalación
    localStorage.removeItem("GYMMATE_LOCAL_CODE");
    setGymCode(null);
  };

  if (loading) return <div>Cargando configuración...</div>;

  return (
    <GymConfigContext.Provider 
      value={{ 
        gymCode, 
        isConfigured: !!gymCode, 
        setGymLocal, 
        clearConfig 
      }}
    >
      {children}
    </GymConfigContext.Provider>
  );
};

export const useGymConfig = () => {
  const context = useContext(GymConfigContext);
  if (!context) throw new Error("useGymConfig debe usarse dentro de GymConfigProvider");
  return context;
};