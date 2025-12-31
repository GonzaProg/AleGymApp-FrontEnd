import { useState, useEffect } from "react";
import { useAuthUser } from "../useAuthUser"; 
import { RutinasApi } from "../../API/Rutinas/RutinasApi";

export const useMyRoutines = () => {
  // 1. Obtenemos el usuario del contexto global (Hook)
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
      // Si el usuario aún no se cargó, no hacemos nada
      if (!currentUser?.id) return;

      setLoading(true);
      try {
        // 2. Llamada limpia a la API
        const data = await RutinasApi.getByUser(currentUser.id);
        setRutinas(data);
      } catch (error) {
        console.error("Error al cargar rutinas", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRutinas();
  }, [currentUser]); // Se ejecuta cuando el usuario se carga o cambia

  // --- FUNCIONES AUXILIARES (Lógica de UI) ---
  const closeModal = () => setSelectedRoutine(null);
  const closeVideo = () => setVideoUrl(null);

  // Función pura para procesar la URL de YouTube
  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    // Regex para detectar ID de Youtube (soporta shorts, watch, embed, etc.)
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
    const match = url.match(regExp);

    if (match && match[2].length === 11) {
      const videoId = match[2];
      // Parámetros: autoplay, mute, loop, sin controles, diseño modesto
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&modestbranding=1`;
    }
    return null; 
  };

  const handleOpenVideo = (url: string) => {
    const embed = getEmbedUrl(url);
    if (embed) {
      setVideoUrl(embed);
    } else {
      // Si no es de youtube, lo abrimos en pestaña nueva
      window.open(url, "_blank");
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