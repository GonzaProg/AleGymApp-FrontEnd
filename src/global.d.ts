// src/global.d.ts
export {};

declare global {
  interface Window {
    require: any;
  }
}

declare module 'swiper/css';
declare module 'swiper/css/pagination';
declare module 'swiper/css/navigation';
declare module 'swiper/css/scrollbar';