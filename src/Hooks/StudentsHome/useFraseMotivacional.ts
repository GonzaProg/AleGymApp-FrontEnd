import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { FrasesApi } from '../../API/Frases/FrasesApi';

// Constantes para caché
const STORE_KEY_DATE = 'frase_daily_date';
const STORE_KEY_TEXT = 'frase_daily_text';
const STORE_KEY_FALLBACK_URL = 'frase_daily_fallback_image';
const IMAGE_FILENAME = 'daily_quote.jpg';

export const useFraseMotivacional = () => {
    const [frase, setFrase] = useState<{ texto: string, localImageUrl: string | null } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkDailyQuote = async () => {
            try {
                // 1. Obtener la semilla de fecha actual (YYYYMMDD)
                const today = new Date();
                const currentDateSeed = String(today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate());

                // 2. Revisar si ya descargamos la frase de HOY
                const { value: lastDate } = await Preferences.get({ key: STORE_KEY_DATE });
                
                if (lastDate === currentDateSeed) {
                    // Ya tenemos la de hoy guardada, cargarla desde el almacenamiento local
                    const { value: savedText } = await Preferences.get({ key: STORE_KEY_TEXT });
                    
                    let localImageUrl: string | null = null;
                    if (Capacitor.isNativePlatform()) {
                        try {
                            // Validar físicamente si el archivo fue creado y existe
                            await Filesystem.stat({
                                directory: Directory.Data,
                                path: IMAGE_FILENAME
                            });
                            
                            const file = await Filesystem.getUri({
                                directory: Directory.Data,
                                path: IMAGE_FILENAME
                            });
                            localImageUrl = Capacitor.convertFileSrc(file.uri) + '?v=' + currentDateSeed;
                        } catch (e) {
                            // El archivo nunca se guardó (error de blob/escritura) o se borró. 
                            // Usamos directamente la URL original que guardamos de respaldo.
                            const { value: fallbackUrl } = await Preferences.get({ key: STORE_KEY_FALLBACK_URL });
                            localImageUrl = fallbackUrl;
                        }
                    } else {
                        // Web fallback
                        const { value: webUrl } = await Preferences.get({ key: STORE_KEY_FALLBACK_URL });
                        localImageUrl = webUrl;
                    }

                    if (savedText) {
                        setFrase({ texto: savedText, localImageUrl });
                        setLoading(false);
                        return; // ¡Terminamos rápido y sin gastar red!
                    }
                }

                // 3. Si no la tenemos O es un día nuevo, a buscarla al backend
                const backendQuote = await FrasesApi.getDaily();

                let localImageUrl: string | null = null;

                // 4. Descargar la imagen si existe
                if (backendQuote.imagenUrl) {
                    
                    // SIEMPRE guardamos la URL online como respaldo vital
                    await Preferences.set({ key: STORE_KEY_FALLBACK_URL, value: backendQuote.imagenUrl });
                    
                    if (Capacitor.isNativePlatform()) {
                        try {
                            // Borrar rastro anterior
                            try {
                                await Filesystem.deleteFile({
                                    path: IMAGE_FILENAME,
                                    directory: Directory.Data
                                });
                            } catch (e) {}

                            // Descargar y guardar nativamente de a un solo paso (Evita cortes por RAM en Blob a Base64)
                            await Filesystem.downloadFile({
                                url: backendQuote.imagenUrl,
                                path: IMAGE_FILENAME,
                                directory: Directory.Data,
                            });

                            const file = await Filesystem.getUri({
                                directory: Directory.Data,
                                path: IMAGE_FILENAME
                            });
                            localImageUrl = Capacitor.convertFileSrc(file.uri) + '?v=' + currentDateSeed;

                        } catch (error) {
                            console.error("Error guardando imagen local, usando nativa en su lugar.", error);
                            localImageUrl = backendQuote.imagenUrl;
                        }
                    } else {
                        // Web
                        localImageUrl = backendQuote.imagenUrl;
                    }
                } else {
                     // Si hoy no hay imagen en ninguna
                     if (Capacitor.isNativePlatform()) {
                        try {
                            await Filesystem.deleteFile({
                                path: IMAGE_FILENAME,
                                directory: Directory.Data
                            });
                        } catch (e) {}
                     }
                     await Preferences.remove({ key: STORE_KEY_FALLBACK_URL });
                }

                // 5. Guardar el nuevo estado para de hoy en adelante
                await Preferences.set({ key: STORE_KEY_DATE, value: currentDateSeed });
                await Preferences.set({ key: STORE_KEY_TEXT, value: backendQuote.texto });

                setFrase({ texto: backendQuote.texto, localImageUrl });

            } catch (error) {
                console.error("Error obteniendo frase motivacional", error);
            } finally {
                setLoading(false);
            }
        };

        checkDailyQuote();
    }, []);

    return { frase, loading };
};
