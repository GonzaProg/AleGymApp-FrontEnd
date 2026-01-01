import { useState, useEffect } from "react";
import { useAuthUser } from "../useAuthUser"; 
import { RutinasApi } from "../../API/Rutinas/RutinasApi";

export const useMyRoutines = () => {
  // 1. Obtenemos el usuario del contexto global
  const { currentUser } = useAuthUser();

  // --- ESTADOS ---
  const [rutinas, setRutinas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados de UI (Modal y Video)
  const [selectedRoutine, setSelectedRoutine] = useState<any>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // --- EFECTOS (Carga de datos) ---
  useEffect(() => {
    const fetchRutinas = async () => {
      // Si el usuario aún no cargó, no hacemos nada
      if (!currentUser?.id) return;

      setLoading(true);
      try {
        const data = await RutinasApi.getByUser(currentUser.id);
        setRutinas(data);
      } catch (error) {
        console.error("Error al cargar rutinas", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRutinas();
  }, [currentUser]);

  // --- FUNCIONES AUXILIARES (Lógica de UI) ---
  const closeModal = () => setSelectedRoutine(null);
  
  const closeVideo = () => setVideoUrl(null);

  // Lógica simplificada: Si hay URL, la guardamos para que el <VideoEjercicio> la reproduzca
  const handleOpenVideo = (url: string) => {
    if (url) {
        setVideoUrl(url); 
    }
  };

  return {
    rutinas,
    loading,
    selectedRoutine,
    setSelectedRoutine,
    videoUrl,
    closeModal,
    closeVideo,
    handleOpenVideo
  };
};