import { useRef, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

interface VideoProps {
  url: string;
}

export const VideoEjercicio = ({ url }: VideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // 1. Detectar si es archivo local (Offline)
  const isNativeFile = url.startsWith('file://');
  
  // 2. Construir la URL final
  const finalUrl = isNativeFile 
    ? Capacitor.convertFileSrc(url) 
    : url;

  useEffect(() => {
    if (videoRef.current) {
        videoRef.current.load(); 
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
            playPromise.catch(err => {
                console.log("Autoplay bloqueado (interacción requerida):", err);
            });
        }
    }
  }, [finalUrl]);

  return (
    // 'bg-black' para bordes elegantes
    <div className="w-full h-full bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative flex items-center justify-center">
      <video
        ref={videoRef}
        src={finalUrl}
        className="w-full h-full object-contain" 
        autoPlay
        loop
        muted
        playsInline
        controls={false}
        disablePictureInPicture
        disableRemotePlayback
        style={{ pointerEvents: 'none' }}
      />
    </div>
  );
};