import { useState, useEffect } from "react";
import api from "../../API/axios"; 

export const useMyRoutines = () => {
  // Nota: Ya no necesitamos recuperar el token aquí manualmente
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // --- ESTADOS ---
  const [rutinas, setRutinas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoutine, setSelectedRoutine] = useState<any>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // --- EFECTOS (Carga de datos) ---
  useEffect(() => {
    const fetchRutinas = async () => {
      try {
        // Llamada limpia sin host ni headers manuales
        const res = await api.get(`/api/rutinas/usuario/${user.id}`);
        setRutinas(res.data);
      } catch (error) {
        console.error("Error al cargar rutinas", error);
      } finally {
        setLoading(false);
      }
    };

    if (user.id) fetchRutinas();
  }, [user.id]);

  // --- FUNCIONES AUXILIARES ---
  const closeModal = () => setSelectedRoutine(null);
  const closeVideo = () => setVideoUrl(null);

  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
    const match = url.match(regExp);

    if (match && match[2].length === 11) {
      const videoId = match[2];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&modestbranding=1`;
    }
    return null; 
  };

  const handleOpenVideo = (url: string) => {
    const embed = getEmbedUrl(url);
    if (embed) {
      setVideoUrl(embed);
    } else {
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