import { Filesystem, Directory } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';

const ROUTINE_KEY_PREFIX = 'offline_routine_';

export const DownloadRoutineService = {
    
    // 1. GUARDAR RUTINA COMPLETA (JSON + VIDEOS)
    downloadRoutine: async (rutina: any, onProgress: (msg: string) => void) => {
        try {
            const rutinaId = rutina.id;
            const rutinaLocal = { ...rutina, detalles: [] as any[] };

            // A. Recorremos los ejercicios
            let count = 0;
            const total = rutina.detalles.length;

            for (const detalle of rutina.detalles) {
                const ejercicio = { ...detalle.ejercicio };
                
                // Si tiene video, lo descargamos
                if (ejercicio.urlVideo) {
                    onProgress(`Descargando video ${count + 1}/${total}: ${ejercicio.nombre}...`);
                    
                    const fileName = `vid_${ejercicio.id}_${Date.now()}.mp4`;
                    const savedPath = await DownloadRoutineService.downloadAndSaveFile(ejercicio.urlVideo, fileName);
                    
                    // Reemplazamos la URL de internet por la ruta local del archivo
                    if (savedPath) {
                        ejercicio.localVideoPath = savedPath;
                    }
                }
                
                // Agregamos el ejercicio modificado (con path local) a la rutina local
                rutinaLocal.detalles.push({ ...detalle, ejercicio });
                count++;
            }

            // B. Guardamos el JSON actualizado en Preferencias
            await Preferences.set({
                key: `${ROUTINE_KEY_PREFIX}${rutinaId}`,
                value: JSON.stringify(rutinaLocal),
            });

            onProgress("¡Descarga completada! ✅");
            return true;

        } catch (error) {
            console.error("Error descargando rutina:", error);
            throw new Error("Fallo en la descarga. Verifica tu conexión.");
        }
    },

    // 2. HELPER: DESCARGAR UN ARCHIVO AL DISPOSITIVO
    downloadAndSaveFile: async (url: string, fileName: string) => {
        try {
            // Fetch al video (obtenemos el blob)
            const response = await fetch(url);
            const blob = await response.blob();

            // Convertimos Blob a Base64 para Capacitor
            const base64Data = await DownloadRoutineService.blobToBase64(blob) as string;
            
            // Quitamos el prefijo del base64 (ej: "data:video/mp4;base64,") para guardar puro binario
            const savedFile = await Filesystem.writeFile({
                path: fileName,
                data: base64Data.split(',')[1], 
                directory: Directory.Data, // Carpeta segura de la app
                // encoding: Encoding.UTF8 // NO usar encoding para binarios grandes si pasamos base64
            });

            // Devolvemos la URI nativa para reproducirlo luego (file://...)
            return savedFile.uri;

        } catch (e) {
            console.warn("No se pudo descargar el video:", url);
            return null; // Si falla, que siga usando la URL online
        }
    },

    // 3. CONVERTIR BLOB A BASE64
    blobToBase64: (blob: Blob) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = reject;
            reader.onload = () => {
                resolve(reader.result);
            };
            reader.readAsDataURL(blob);
        });
    },

    // 4. OBTENER RUTINA GUARDADA
    getOfflineRoutine: async (rutinaId: number) => {
        const { value } = await Preferences.get({ key: `${ROUTINE_KEY_PREFIX}${rutinaId}` });
        return value ? JSON.parse(value) : null;
    },

    // 5. BORRAR RUTINA LOCAL (Liberar espacio)
    deleteOfflineRoutine: async (rutina: any) => {
        // Borrar videos físicos
        if (rutina.detalles) {
            for (const d of rutina.detalles) {
                if (d.ejercicio.localVideoPath) {
                    try {
                        // Extraemos el nombre del archivo de la URI
                        const fileName = d.ejercicio.localVideoPath.split('/').pop();
                        await Filesystem.deleteFile({
                            path: fileName,
                            directory: Directory.Data
                        });
                    } catch (e) { console.warn("Archivo ya borrado o no encontrado"); }
                }
            }
        }
        // Borrar referencia en JSON
        await Preferences.remove({ key: `${ROUTINE_KEY_PREFIX}${rutina.id}` });
    },

    // 6. VERIFICAR SI ESTÁ DESCARGADA
    isRoutineDownloaded: async (rutinaId: number) => {
        const { value } = await Preferences.get({ key: `${ROUTINE_KEY_PREFIX}${rutinaId}` });
        return !!value;
    }
};