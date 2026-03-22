import { useRef, useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';

interface VideoProps {
  url: string;
  // Añadimos estas props opcionales
  controls?: boolean;
  muted?: boolean;
  loop?: boolean;
}

const b64toBlob = (b64Data: string, contentType = '', sliceSize = 512) => {
  const byteCharacters = atob(b64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: contentType });
};

export const VideoEjercicio = ({ url, controls = false, muted = true, loop = true }: VideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoSrc, setVideoSrc] = useState<string>('');

  useEffect(() => {
    let objectUrl: string | null = null;
    let isMounted = true;

    const loadVideo = async () => {
      if (!url) return;

      if (Capacitor.isNativePlatform()) {
        const isNativeFile = url.startsWith('file://');
        if (isMounted) setVideoSrc(isNativeFile ? Capacitor.convertFileSrc(url) : url);
      } else {
        // En WEB
        if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) {
          if (isMounted) setVideoSrc(url);
        } else {
          // Asumimos que es un archivo guardado en Web (IndexedDB vía Capacitor Filesystem)
          try {
            const fileName = url.split('/').pop() || url;
            const file = await Filesystem.readFile({
              path: fileName,
              directory: Directory.Data
            });
            
            // Convertir de base64 a Blob sin usar fetch() para evitar límites de longitud en Data URI
            const blob = b64toBlob(file.data as string, 'video/mp4');
            objectUrl = URL.createObjectURL(blob);
            
            if (isMounted) setVideoSrc(objectUrl);
          } catch (e) {
            console.error("Error al cargar vídeo offline en web", e);
            if (isMounted) setVideoSrc(url); // fallback
          }
        }
      }
    };

    loadVideo();

    return () => {
      isMounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [url]);

  useEffect(() => {
    if (videoSrc && videoRef.current) {
        videoRef.current.load(); 
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
            playPromise.catch(err => {
                console.log("Autoplay bloqueado (interacción requerida):", err);
            });
        }
    }
  }, [videoSrc]);

  return (
    <div className="w-full h-full bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative flex items-center justify-center">
      {videoSrc && (
          <video
            ref={videoRef}
            src={videoSrc}
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
      )}
    </div>
  );
};