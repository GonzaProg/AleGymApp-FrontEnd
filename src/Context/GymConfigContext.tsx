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
    // Al iniciar, leemos del disco si ya se configuró esta PC
    const storedCode = localStorage.getItem("GYMMATE_LOCAL_CODE");
    if (storedCode) {
      setGymCode(storedCode);
    }
    setLoading(false);
  }, []);

  const setGymLocal = (code: string) => {
    localStorage.setItem("GYMMATE_LOCAL_CODE", code);
    setGymCode(code);
  };

  const clearConfig = () => {
    localStorage.removeItem("GYMMATE_LOCAL_CODE");
    setGymCode(null);
  };

  if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-green-500">Cargando configuración...</div>;

  return (
    <GymConfigContext.Provider value={{ gymCode, isConfigured: !!gymCode, setGymLocal, clearConfig }}>
      {children}
    </GymConfigContext.Provider>
  );
};

export const useGymConfig = () => {
  const context = useContext(GymConfigContext);
  if (!context) throw new Error("useGymConfig debe usarse dentro de GymConfigProvider");
  return context;
};