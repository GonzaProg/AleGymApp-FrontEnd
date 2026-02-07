// src/global.d.ts
export {};

declare global {
  interface Window {
    require: any;
  }
}