import { useRef, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

interface VideoProps {
  url: string;
  // Añadimos estas props opcionales
  controls?: boolean;
  muted?: boolean;
  loop?: boolean;
}

export const VideoEjercicio = ({ url, controls = false, muted = true, loop = true }: VideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const isNativeFile = url.startsWith('file://');
  const finalUrl = isNativeFile ? Capacitor.convertFileSrc(url) : url;

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
    <div className="w-full h-full bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative flex items-center justify-center">
      <video
        ref={videoRef}
        src={finalUrl}
        className="w-full h-full object-contain" 
        autoPlay
        loop={loop}
        muted={muted}
        playsInline
        controls={controls} // Usamos la prop
        disablePictureInPicture={!controls}
        disableRemotePlayback={!controls}
        // Si tiene controles, permitimos los clicks. Si no, lo bloqueamos.
        style={{ pointerEvents: controls ? 'auto' : 'none' }}
      />
    </div>
  );
};