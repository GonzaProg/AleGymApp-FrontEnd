import { useState, useEffect } from "react";
import axios from "axios";

export const useMyRoutines = () => {
  const token = localStorage.getItem("token");
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
        const res = await axios.get(`http://localhost:3000/api/rutinas/usuario/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRutinas(res.data);
      } catch (error) {
        console.error("Error al cargar rutinas", error);
      } finally {
        setLoading(false);
      }
    };

    if (user.id) fetchRutinas();
  }, [user.id, token]);

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

  // --- RETORNAMOS LO QUE LA VISTA NECESITA ---
  return {
    rutinas,
    loading,
    selectedRoutine,
    setSelectedRoutine, // Necesitamos este setter para abrir el modal al clickear la card
    videoUrl,
    closeModal,
    closeVideo,
    handleOpenVideo
  };
};