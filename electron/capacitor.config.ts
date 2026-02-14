import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.GymMate.app',
  appName: 'GymMate',
  webDir: 'dist',

  server: {
    androidScheme: "http", // <--- ESTO SOLUCIONA EL ERROR
    cleartext: true,       // Permite tráfico sin encriptar
    allowNavigation: [
      "192.168.1.8" // Opcional: permite navegar a tu IP
    ]
  },
};



export default config;
