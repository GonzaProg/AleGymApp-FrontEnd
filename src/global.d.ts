// src/global.d.ts
export {};

declare global {
  interface Window {
    // Declaramos nuestra API personalizada
    electronAPI: {
      on: (channel: string, func: (...args: any[]) => void) => void;
      removeAllListeners: (channel: string) => void;
    };
    // Mantenemos el require por si acaso alguna librería de dev lo usa, 
    // pero en prod usaremos electronAPI
    require: any; 
  }
}

declare module 'swiper/css';
declare module 'swiper/css/pagination';
declare module 'swiper/css/navigation';
declare module 'swiper/css/scrollbar';