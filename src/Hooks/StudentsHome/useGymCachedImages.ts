import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { Filesystem, Directory } from '@capacitor/filesystem';

const LOGO_FILENAME = 'gym_logo_cache';
const FONDO_FILENAME = 'gym_fondo_cache';

const KEY_LAST_LOGO_URL = 'gym_last_logo_url';
const KEY_LAST_FONDO_URL = 'gym_last_fondo_url';

export const useGymCachedImages = (logoUrlOnline: string | null | undefined, fondoUrlOnline: string | null | undefined) => {
    const [localLogoUrl, setLocalLogoUrl] = useState<string | null>(null);
    const [localFondoUrl, setLocalFondoUrl] = useState<string | null>(null);
    const [loadingImages, setLoadingImages] = useState(true);

    useEffect(() => {
        const cacheImages = async () => {
             // Web Fallback Immediate
            if (!Capacitor.isNativePlatform()) {
                setLocalLogoUrl(logoUrlOnline || null);
                setLocalFondoUrl(fondoUrlOnline || null);
                setLoadingImages(false);
                return;
            }

            try {
                // LOGO LOGIC
                let finalLogo: string | null = null;
                if (logoUrlOnline) {
                    const { value: lastLogoUrl } = await Preferences.get({ key: KEY_LAST_LOGO_URL });
                    
                    if (lastLogoUrl === logoUrlOnline) {
                        // Already downloaded this exact URL, loading from cache
                        try {
                            const file = await Filesystem.getUri({ directory: Directory.Data, path: LOGO_FILENAME });
                            finalLogo = Capacitor.convertFileSrc(file.uri);
                        } catch {
                            // File not found physically
                            finalLogo = logoUrlOnline;
                        }
                    } else {
                        // Needs to be downloaded
                        try {
                            try { await Filesystem.deleteFile({ path: LOGO_FILENAME, directory: Directory.Data }); } catch(e) {}
                            
                            await Filesystem.downloadFile({
                                url: logoUrlOnline,
                                path: LOGO_FILENAME,
                                directory: Directory.Data
                            });
                            
                            const file = await Filesystem.getUri({ directory: Directory.Data, path: LOGO_FILENAME });
                            finalLogo = Capacitor.convertFileSrc(file.uri);
                            await Preferences.set({ key: KEY_LAST_LOGO_URL, value: logoUrlOnline });
                        } catch (error) {
                            console.error("Error downloading logo", error);
                            finalLogo = logoUrlOnline;
                        }
                    }
                } else {
                    // Si no hay logo online, nos aseguramos de borrar rastros
                    try { await Filesystem.deleteFile({ path: LOGO_FILENAME, directory: Directory.Data }); } catch(e) {}
                    await Preferences.remove({ key: KEY_LAST_LOGO_URL });
                }

                setLocalLogoUrl(finalLogo);

                // FONDO LOGIC
                let finalFondo: string | null = null;
                if (fondoUrlOnline) {
                    const { value: lastFondoUrl } = await Preferences.get({ key: KEY_LAST_FONDO_URL });
                    
                    if (lastFondoUrl === fondoUrlOnline) {
                        try {
                            const file = await Filesystem.getUri({ directory: Directory.Data, path: FONDO_FILENAME });
                            finalFondo = Capacitor.convertFileSrc(file.uri);
                        } catch {
                            finalFondo = fondoUrlOnline;
                        }
                    } else {
                        try {
                            try { await Filesystem.deleteFile({ path: FONDO_FILENAME, directory: Directory.Data }); } catch(e) {}
                            
                            await Filesystem.downloadFile({
                                url: fondoUrlOnline,
                                path: FONDO_FILENAME,
                                directory: Directory.Data
                            });
                            
                            const file = await Filesystem.getUri({ directory: Directory.Data, path: FONDO_FILENAME });
                            finalFondo = Capacitor.convertFileSrc(file.uri);
                            await Preferences.set({ key: KEY_LAST_FONDO_URL, value: fondoUrlOnline });
                        } catch (error) {
                            console.error("Error downloading fondo", error);
                            finalFondo = fondoUrlOnline;
                        }
                    }
                } else {
                    try { await Filesystem.deleteFile({ path: FONDO_FILENAME, directory: Directory.Data }); } catch(e) {}
                    await Preferences.remove({ key: KEY_LAST_FONDO_URL });
                }

                setLocalFondoUrl(finalFondo);

            } catch (error) {
                 console.error("Error general gestionando caché de imágenes", error);
                 setLocalLogoUrl(logoUrlOnline || null);
                 setLocalFondoUrl(fondoUrlOnline || null);
            } finally {
                setLoadingImages(false);
            }
        };

        // Al montar el custom hook con sus variables 
        cacheImages();

    }, [logoUrlOnline, fondoUrlOnline]);

    return { localLogoUrl, localFondoUrl, loadingImages };
};
