import { useRef, useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';

interface VideoProps {
  url: string;
  fallbackUrl?: string; // URL de la nube para fallback
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

// Intentar leer un archivo de Capacitor Filesystem y devolver un blob URL
const readLocalFile = async (path: string): Promise<string | null> => {
  try {
    const file = await Filesystem.readFile({
      path: path,
      directory: Directory.Data
    });
    const blob = b64toBlob(file.data as string, 'video/mp4');
    return URL.createObjectURL(blob);
  } catch {
    return null;
  }
};

export const VideoEjercicio = ({ url, fallbackUrl, controls = false, muted = true, loop = true }: VideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoSrc, setVideoSrc] = useState<string>('');

  useEffect(() => {
    let objectUrl: string | null = null;
    let isMounted = true;

    const loadVideo = async () => {
      if (!url) return;

      // === NATIVO (Android/iOS) ===
      if (Capacitor.isNativePlatform()) {
        const isNativeFile = url.startsWith('file://');
        if (isMounted) setVideoSrc(isNativeFile ? Capacitor.convertFileSrc(url) : url);
        return;
      }

      // === WEB ===
      // Si es una URL directa (http, data, blob), usarla directamente
      if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) {
        if (isMounted) setVideoSrc(url);
        return;
      }

      // Si NO es URL directa, es un archivo local guardado en IndexedDB

      // 1. Intentar con el path tal cual (para formato fileName directo: "vid_123_456.mp4")
      let blobUrl = await readLocalFile(url);
      if (blobUrl) {
        objectUrl = blobUrl;
        if (isMounted) setVideoSrc(blobUrl);
        return;
      }

      // 2. Intentar extrayendo solo el fileName del path
      const fileName = url.split('/').pop();
      if (fileName && fileName !== url) {
        blobUrl = await readLocalFile(fileName);
        if (blobUrl) {
          objectUrl = blobUrl;
          if (isMounted) setVideoSrc(blobUrl);
          return;
        }
      }

      // 3. Fallback: usar la URL de la nube si se proporcionó
      if (fallbackUrl) {
        console.warn("⚠️ Video offline no encontrado, usando nube:", fallbackUrl);
        if (isMounted) setVideoSrc(fallbackUrl);
        return;
      }

      // 4. Último recurso
      if (isMounted) setVideoSrc(url);
    };

    loadVideo();

    return () => {
      isMounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [url, fallbackUrl]);

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
            controls={controls}
            disablePictureInPicture={!controls}
            disableRemotePlayback={!controls}
            style={{ pointerEvents: controls ? 'auto' : 'none' }}
          />
      )}
    </div>
  );
};