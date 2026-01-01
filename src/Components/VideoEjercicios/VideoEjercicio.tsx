import { useRef, useEffect } from 'react';

interface VideoProps {
  url: string;
}

export const VideoEjercicio = ({ url }: VideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Función para inyectar optimización de Cloudinary si no la tiene
  // Esto hace que el video pese la mitad sin perder calidad visible
  const getOptimizedUrl = (originalUrl: string) => {
    if (!originalUrl) return "";
    // Solo aplicamos esto si es un link de Cloudinary
    if (originalUrl.includes("cloudinary.com") && !originalUrl.includes("f_auto,q_auto")) {
      return originalUrl.replace("/upload/", "/upload/f_auto,q_auto/");
    }
    return originalUrl;
  };

  const finalUrl = getOptimizedUrl(url);

  useEffect(() => {
    // Forzamos el play apenas carga el componente
    if (videoRef.current) {
        videoRef.current.play().catch(err => console.log("Autoplay bloqueado:", err));
    }
  }, [finalUrl]);

  return (
    <div className="w-full h-full bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative">
      <video
        ref={videoRef}
        src={finalUrl}
        className="w-full h-full object-contain" // object-contain para que se vea todo el video sin recortes
        autoPlay
        loop
        muted
        playsInline // Vital para iPhone
        controls={false} // Sin barra de reproducción
      />
    </div>
  );
};