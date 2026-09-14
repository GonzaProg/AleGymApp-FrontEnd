import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { Filesystem, Directory } from '@capacitor/filesystem';

const KEY_LAST_LOGO_URL = 'gym_last_logo_url';
const KEY_LAST_FONDO_URL = 'gym_last_fondo_url';
const KEY_LAST_LOGO_DATE = 'gym_last_logo_date';
const KEY_LAST_FONDO_DATE = 'gym_last_fondo_date';
const KEY_LAST_LOGO_FILENAME = 'gym_last_logo_filename';
const KEY_LAST_FONDO_FILENAME = 'gym_last_fondo_filename';

// Para evitar problemas de concurrencia ya que Navbar y StudentHome usan el hook simultáneamente
let cachePromise: Promise<void> | null = null;

export const useGymCachedImages = (
    logoUrlOnline: string | null | undefined,
    fondoUrlOnline: string | null | undefined,
    fechaModificacionLogo?: string | Date | number | null,
    fechaModificacionFondo?: string | Date | number | null
) => {
    const [localLogoUrl, setLocalLogoUrl] = useState<string | null>(null);
    const [localFondoUrl, setLocalFondoUrl] = useState<string | null>(null);
    const [loadingImages, setLoadingImages] = useState(true);

    useEffect(() => {
        const cacheImages = async () => {
            if (!Capacitor.isNativePlatform()) {
                const logoDateStr = fechaModificacionLogo ? new Date(fechaModificacionLogo).getTime().toString() : '';
                const fondoDateStr = fechaModificacionFondo ? new Date(fechaModificacionFondo).getTime().toString() : '';

                setLocalLogoUrl(logoUrlOnline ? `${logoUrlOnline}${logoDateStr ? `?v=${logoDateStr}` : ''}` : null);
                setLocalFondoUrl(fondoUrlOnline ? `${fondoUrlOnline}${fondoDateStr ? `?v=${fondoDateStr}` : ''}` : null);
                setLoadingImages(false);
                return;
            }

            // Esperar si otro componente está procesando la caché
            while (cachePromise) {
                await cachePromise;
            }

            let resolver: () => void;
            cachePromise = new Promise(resolve => { resolver = resolve; });

            try {
                // LOGICA LOGO
                let finalLogo: string | null = null;
                const newLogoDateStr = fechaModificacionLogo ? new Date(fechaModificacionLogo).toISOString() : 'none';

                if (logoUrlOnline) {
                    const { value: lastLogoUrl } = await Preferences.get({ key: KEY_LAST_LOGO_URL });
                    const { value: lastLogoDate } = await Preferences.get({ key: KEY_LAST_LOGO_DATE });
                    let { value: lastLogoFilename } = await Preferences.get({ key: KEY_LAST_LOGO_FILENAME });

                    // Para limpiar el archivo viejo que usaba nombre estático si existe
                    try { await Filesystem.deleteFile({ path: 'gym_logo_cache', directory: Directory.Data }); } catch (e) { }

                    if (lastLogoUrl === logoUrlOnline && lastLogoDate === newLogoDateStr && lastLogoFilename) {
                        try {
                            const file = await Filesystem.getUri({ directory: Directory.Data, path: lastLogoFilename });
                            finalLogo = Capacitor.convertFileSrc(file.uri);
                        } catch {
                            finalLogo = logoUrlOnline;
                        }
                    } else {
                        const newFilename = `gym_logo_cache_${Date.now()}.png`;
                        try {
                            await Filesystem.downloadFile({
                                url: logoUrlOnline,
                                path: newFilename,
                                directory: Directory.Data
                            });

                            if (lastLogoFilename) {
                                try { await Filesystem.deleteFile({ path: lastLogoFilename, directory: Directory.Data }); } catch (e) { }
                            }

                            const file = await Filesystem.getUri({ directory: Directory.Data, path: newFilename });
                            finalLogo = Capacitor.convertFileSrc(file.uri);

                            await Preferences.set({ key: KEY_LAST_LOGO_URL, value: logoUrlOnline });
                            await Preferences.set({ key: KEY_LAST_LOGO_DATE, value: newLogoDateStr });
                            await Preferences.set({ key: KEY_LAST_LOGO_FILENAME, value: newFilename });
                        } catch (error) {
                            console.error("Error downloading logo", error);
                            if (lastLogoFilename) {
                                try {
                                    const file = await Filesystem.getUri({ directory: Directory.Data, path: lastLogoFilename });
                                    finalLogo = Capacitor.convertFileSrc(file.uri);
                                } catch {
                                    finalLogo = logoUrlOnline;
                                }
                            } else {
                                finalLogo = logoUrlOnline;
                            }
                        }
                    }
                } else if (logoUrlOnline === null) {
                    let { value: lastLogoFilename } = await Preferences.get({ key: KEY_LAST_LOGO_FILENAME });
                    if (lastLogoFilename) {
                        try { await Filesystem.deleteFile({ path: lastLogoFilename, directory: Directory.Data }); } catch (e) { }
                    }
                    await Preferences.remove({ key: KEY_LAST_LOGO_URL });
                    await Preferences.remove({ key: KEY_LAST_LOGO_DATE });
                    await Preferences.remove({ key: KEY_LAST_LOGO_FILENAME });
                } else {
                    // Si es undefined (probablemente aún no carga currentUser), intentamos mostrar el último logo guardado
                    let { value: lastLogoFilename } = await Preferences.get({ key: KEY_LAST_LOGO_FILENAME });
                    if (lastLogoFilename) {
                        try {
                            const file = await Filesystem.getUri({ directory: Directory.Data, path: lastLogoFilename });
                            finalLogo = Capacitor.convertFileSrc(file.uri);
                        } catch { }
                    }
                }

                setLocalLogoUrl(finalLogo);

                // FONDO LOGICA
                let finalFondo: string | null = null;
                const newFondoDateStr = fechaModificacionFondo ? new Date(fechaModificacionFondo).toISOString() : 'none';

                if (fondoUrlOnline) {
                    const { value: lastFondoUrl } = await Preferences.get({ key: KEY_LAST_FONDO_URL });
                    const { value: lastFondoDate } = await Preferences.get({ key: KEY_LAST_FONDO_DATE });
                    let { value: lastFondoFilename } = await Preferences.get({ key: KEY_LAST_FONDO_FILENAME });

                    // Limpieza del archivo con nombre estático
                    try { await Filesystem.deleteFile({ path: 'gym_fondo_cache', directory: Directory.Data }); } catch (e) { }

                    if (lastFondoUrl === fondoUrlOnline && lastFondoDate === newFondoDateStr && lastFondoFilename) {
                        try {
                            const file = await Filesystem.getUri({ directory: Directory.Data, path: lastFondoFilename });
                            finalFondo = Capacitor.convertFileSrc(file.uri);
                        } catch {
                            finalFondo = fondoUrlOnline;
                        }
                    } else {
                        const newFilename = `gym_fondo_cache_${Date.now()}.jpg`;
                        try {
                            await Filesystem.downloadFile({
                                url: fondoUrlOnline,
                                path: newFilename,
                                directory: Directory.Data
                            });

                            if (lastFondoFilename) {
                                try { await Filesystem.deleteFile({ path: lastFondoFilename, directory: Directory.Data }); } catch (e) { }
                            }

                            const file = await Filesystem.getUri({ directory: Directory.Data, path: newFilename });
                            finalFondo = Capacitor.convertFileSrc(file.uri);

                            await Preferences.set({ key: KEY_LAST_FONDO_URL, value: fondoUrlOnline });
                            await Preferences.set({ key: KEY_LAST_FONDO_DATE, value: newFondoDateStr });
                            await Preferences.set({ key: KEY_LAST_FONDO_FILENAME, value: newFilename });
                        } catch (error) {
                            console.error("Error downloading fondo", error);
                            if (lastFondoFilename) {
                                try {
                                    const file = await Filesystem.getUri({ directory: Directory.Data, path: lastFondoFilename });
                                    finalFondo = Capacitor.convertFileSrc(file.uri);
                                } catch {
                                    finalFondo = fondoUrlOnline;
                                }
                            } else {
                                finalFondo = fondoUrlOnline;
                            }
                        }
                    }
                } else if (fondoUrlOnline === null) {
                    let { value: lastFondoFilename } = await Preferences.get({ key: KEY_LAST_FONDO_FILENAME });
                    if (lastFondoFilename) {
                        try { await Filesystem.deleteFile({ path: lastFondoFilename, directory: Directory.Data }); } catch (e) { }
                    }
                    await Preferences.remove({ key: KEY_LAST_FONDO_URL });
                    await Preferences.remove({ key: KEY_LAST_FONDO_DATE });
                    await Preferences.remove({ key: KEY_LAST_FONDO_FILENAME });
                } else {
                    // Si es undefined, intentar cargar de la caché local para no borrarlo por accidente
                    let { value: lastFondoFilename } = await Preferences.get({ key: KEY_LAST_FONDO_FILENAME });
                    if (lastFondoFilename) {
                        try {
                            const file = await Filesystem.getUri({ directory: Directory.Data, path: lastFondoFilename });
                            finalFondo = Capacitor.convertFileSrc(file.uri);
                        } catch { }
                    }
                }

                setLocalFondoUrl(finalFondo);

            } catch (error) {
                console.error("Error general gestionando caché de imágenes", error);
                setLocalLogoUrl(logoUrlOnline || null);
                setLocalFondoUrl(fondoUrlOnline || null);
            } finally {
                if (resolver!) resolver();
                cachePromise = null;
                setLoadingImages(false);
            }
        };

        cacheImages();

    }, [logoUrlOnline, fondoUrlOnline, fechaModificacionLogo, fechaModificacionFondo]);

    return { localLogoUrl, localFondoUrl, loadingImages };
};
