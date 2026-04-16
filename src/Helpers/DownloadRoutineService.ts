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

    // 1. GUARDAR RUTINA COMPLETA (JSON + VIDEOS + MINIATURAS)
    downloadRoutine: async (rutina: any, onProgress: (msg: string) => void) => {
        try {
            const rutinaId = rutina.id;
            const rutinaLocal = { ...rutina, detalles: [] as any[] };

            let count = 0;
            const total = rutina.detalles.length;

            for (const detalle of rutina.detalles) {
                const ejercicio = { ...detalle.ejercicio };
                
                // Descargar miniatura
                const thumbUrl = DownloadRoutineService.getThumbnailUrl(ejercicio);
                if (thumbUrl) {
                    onProgress(`Descargando miniatura ${count + 1}/${total}: ${ejercicio.nombre}...`);
                    const thumbFileName = `thumb_${ejercicio.id}_${Date.now()}.jpg`;
                    const savedThumb = await DownloadRoutineService.downloadAndSaveFile(thumbUrl, thumbFileName);
                    if (savedThumb) {
                        ejercicio.localThumbnailPath = savedThumb;
                    }
                }

                // Descargar video
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

            // Guardamos el JSON
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

    // HELPER: Obtener URL de miniatura (replica la lógica de CloudinaryApi.getThumbnail)
    getThumbnailUrl: (ejercicio: any): string | null => {
        if (ejercicio.imagenUrl && ejercicio.imagenUrl.trim() !== "") return ejercicio.imagenUrl;
        if (ejercicio.urlVideo && ejercicio.urlVideo.includes("cloudinary.com")) {
            return ejercicio.urlVideo.replace(/\.[^/.]+$/, ".jpg");
        }
        return null;
    },

    // 2. HELPER: DESCARGAR UN ARCHIVO
    downloadAndSaveFile: async (url: string, fileName: string) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const base64Data = await DownloadRoutineService.blobToBase64(blob) as string;
            
            await Filesystem.writeFile({
                path: fileName,
                data: base64Data.split(',')[1], 
                directory: Directory.Data, 
            });

            // Retornamos el fileName que usamos para guardar (no el URI opaco de Capacitor)
            // Así VideoEjercicio puede leerlo con Filesystem.readFile({ path: fileName })
            return fileName;
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
                // Borrar video local
                if (d.ejercicio.localVideoPath) {
                    try {
                        const fileName = d.ejercicio.localVideoPath.split('/').pop();
                        await Filesystem.deleteFile({ path: fileName, directory: Directory.Data });
                    } catch (e) { console.warn("Archivo video ya borrado"); }
                }
                // Borrar miniatura local
                if (d.ejercicio.localThumbnailPath) {
                    try {
                        const fileName = d.ejercicio.localThumbnailPath.split('/').pop();
                        await Filesystem.deleteFile({ path: fileName, directory: Directory.Data });
                    } catch (e) { console.warn("Archivo miniatura ya borrado"); }
                }
            }
        }
        await Preferences.remove({ key: `${ROUTINE_KEY_PREFIX}${rutina.id}` });
    },

    // 6. VERIFICAR SI ESTÁ DESCARGADA
    isRoutineDownloaded: async (rutinaId: number) => {
        const { value } = await Preferences.get({ key: `${ROUTINE_KEY_PREFIX}${rutinaId}` });
        return !!value;
    },

    // === MULTI-DÍA ===

    // 7. DESCARGAR GRUPO COMPLETO (todos los días)
    downloadGroup: async (grupo: any, onProgress: (msg: string) => void) => {
        try {
            const dias = grupo.dias || [];
            const totalDias = dias.length;
            
            // Contar total de media en todos los días
            let totalMedia = 0;
            let mediaDescargados = 0;
            for (const dia of dias) {
                for (const det of (dia.detalles || [])) {
                    if (det.ejercicio?.urlVideo) totalMedia++;
                    if (DownloadRoutineService.getThumbnailUrl(det.ejercicio)) totalMedia++;
                }
            }

            for (let diaIdx = 0; diaIdx < totalDias; diaIdx++) {
                const dia = dias[diaIdx];
                const rutinaId = dia.id;
                const rutinaLocal = { ...dia, detalles: [] as any[] };

                for (const detalle of (dia.detalles || [])) {
                    const ejercicio = { ...detalle.ejercicio };
                    
                    // Descargar miniatura
                    const thumbUrl = DownloadRoutineService.getThumbnailUrl(ejercicio);
                    if (thumbUrl) {
                        mediaDescargados++;
                        onProgress(`Día ${diaIdx + 1}/${totalDias} — ${mediaDescargados}/${totalMedia}: miniatura ${ejercicio.nombre}...`);
                        const thumbFileName = `thumb_${ejercicio.id}_${Date.now()}.jpg`;
                        const savedThumb = await DownloadRoutineService.downloadAndSaveFile(thumbUrl, thumbFileName);
                        if (savedThumb) {
                            ejercicio.localThumbnailPath = savedThumb;
                        }
                    }

                    // Descargar video
                    if (ejercicio.urlVideo) {
                        mediaDescargados++;
                        onProgress(`Día ${diaIdx + 1}/${totalDias} — ${mediaDescargados}/${totalMedia}: ${ejercicio.nombre}...`);
                        const fileName = `vid_${ejercicio.id}_${Date.now()}.mp4`;
                        const savedPath = await DownloadRoutineService.downloadAndSaveFile(ejercicio.urlVideo, fileName);
                        if (savedPath) {
                            ejercicio.localVideoPath = savedPath;
                        }
                    }
                    
                    rutinaLocal.detalles.push({ ...detalle, ejercicio });
                }

                // Guardar cada día como rutina independiente
                await Preferences.set({
                    key: `${ROUTINE_KEY_PREFIX}${rutinaId}`,
                    value: JSON.stringify(rutinaLocal),
                });
            }

            onProgress("¡Descarga completada! ✅");
            return true;

        } catch (error) {
            console.error("Error descargando grupo:", error);
            throw new Error("Fallo en la descarga del grupo. Verifica tu conexión.");
        }
    },

    // 8. OBTENER GRUPO OFFLINE (todos los días con videos locales)
    getOfflineGroup: async (grupo: any) => {
        const dias = grupo.dias || [];
        const diasOffline: any[] = [];
        
        for (const dia of dias) {
            const offlineData = await DownloadRoutineService.getOfflineRoutine(dia.id);
            diasOffline.push(offlineData || dia); // Fallback a online si no está guardado
        }
        
        return {
            ...grupo,
            dias: diasOffline
        };
    },

    // 9. ELIMINAR GRUPO OFFLINE
    deleteOfflineGroup: async (grupo: any) => {
        const dias = grupo.dias || [];
        for (const dia of dias) {
            const localData = await DownloadRoutineService.getOfflineRoutine(dia.id);
            if (localData) {
                await DownloadRoutineService.deleteOfflineRoutine(localData);
            } else {
                // FALLBACK: al menos limpiar la clave de Preferences
                await Preferences.remove({ key: `${ROUTINE_KEY_PREFIX}${dia.id}` });
            }
        }
    },

    // 10. VERIFICAR SI TODO EL GRUPO ESTÁ DESCARGADO
    isGroupDownloaded: async (grupo: any) => {
        const dias = grupo.dias || [];
        if (dias.length === 0) return false;
        
        for (const dia of dias) {
            const isDown = await DownloadRoutineService.isRoutineDownloaded(dia.id);
            if (!isDown) return false;
        }
        return true;
    }
};