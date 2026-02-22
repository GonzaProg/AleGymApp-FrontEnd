import { Filesystem, Directory } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';

const ROUTINE_KEY_PREFIX = 'offline_routine_';
const USER_ROUTINES_LIST_KEY = 'user_routines_list_'; // Nueva clave para la lista

export const DownloadRoutineService = {
    
    // GUARDAR LISTA MAESTRA
    saveUserRoutinesList: async (userId: number, rutinas: any[]) => {
        try {
            await Preferences.set({
                key: `${USER_ROUTINES_LIST_KEY}${userId}`,
                value: JSON.stringify(rutinas),
            });
        } catch (e) {
            console.error("Error guardando lista de rutinas offline", e);
        }
    },

    // RECUPERAR LISTA MAESTRA
    getUserRoutinesList: async (userId: number) => {
        try {
            const { value } = await Preferences.get({ key: `${USER_ROUTINES_LIST_KEY}${userId}` });
            return value ? JSON.parse(value) : [];
        } catch (e) {
            return [];
        }
    },

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
                    
                    if (savedPath) {
                        ejercicio.localVideoPath = savedPath;
                    }
                }
                
                rutinaLocal.detalles.push({ ...detalle, ejercicio });
                count++;
            }

            // B. Guardamos el JSON actualizado
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

    // 2. HELPER: DESCARGAR UN ARCHIVO
    downloadAndSaveFile: async (url: string, fileName: string) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const base64Data = await DownloadRoutineService.blobToBase64(blob) as string;
            
            const savedFile = await Filesystem.writeFile({
                path: fileName,
                data: base64Data.split(',')[1], 
                directory: Directory.Data, 
            });

            return savedFile.uri;
        } catch (e) {
            console.warn("No se pudo descargar el video:", url);
            return null;
        }
    },

    // 3. CONVERTIR BLOB
    blobToBase64: (blob: Blob) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = reject;
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        });
    },

    // 4. OBTENER RUTINA GUARDADA (DETALLE)
    getOfflineRoutine: async (rutinaId: number) => {
        const { value } = await Preferences.get({ key: `${ROUTINE_KEY_PREFIX}${rutinaId}` });
        return value ? JSON.parse(value) : null;
    },

    // 5. BORRAR RUTINA LOCAL
    deleteOfflineRoutine: async (rutina: any) => {
        if (rutina.detalles) {
            for (const d of rutina.detalles) {
                if (d.ejercicio.localVideoPath) {
                    try {
                        const fileName = d.ejercicio.localVideoPath.split('/').pop();
                        await Filesystem.deleteFile({
                            path: fileName,
                            directory: Directory.Data
                        });
                    } catch (e) { console.warn("Archivo ya borrado"); }
                }
            }
        }
        await Preferences.remove({ key: `${ROUTINE_KEY_PREFIX}${rutina.id}` });
    },

    // 6. VERIFICAR SI ESTÁ DESCARGADA
    isRoutineDownloaded: async (rutinaId: number) => {
        const { value } = await Preferences.get({ key: `${ROUTINE_KEY_PREFIX}${rutinaId}` });
        return !!value;
    }
};