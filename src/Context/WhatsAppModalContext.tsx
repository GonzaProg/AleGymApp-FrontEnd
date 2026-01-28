import { createContext, useContext, useState, type ReactNode } from "react";

// Definimos qué datos y funciones tendrá nuestro contexto
interface WhatsAppModalContextType {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

// Creamos el contexto vacío
const WhatsAppModalContext = createContext<WhatsAppModalContextType | undefined>(undefined);

// Creamos el componente "Provider" que envolverá tu aplicación
export const WhatsAppModalProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <WhatsAppModalContext.Provider value={{ isOpen, openModal, closeModal }}>
      {children}
    </WhatsAppModalContext.Provider>
  );
};

// Hook personalizado para usar el contexto fácilmente en cualquier componente
export const useWhatsAppModal = () => {
  const context = useContext(WhatsAppModalContext);
  if (!context) {
    throw new Error("useWhatsAppModal debe usarse dentro de un WhatsAppModalProvider");
  }
  return context;
};