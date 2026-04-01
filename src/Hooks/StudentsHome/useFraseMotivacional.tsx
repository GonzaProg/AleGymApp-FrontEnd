import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { FrasesApi } from '../../API/Frases/FrasesApi';

// Constantes para caché
const STORE_KEY_DATE = 'frase_daily_date';
const STORE_KEY_TEXT = 'frase_daily_text';
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
                            const file = await Filesystem.getUri({
                                directory: Directory.Data,
                                path: IMAGE_FILENAME
                            });
                            localImageUrl = Capacitor.convertFileSrc(file.uri);
                        } catch (e) {
                            // File not found, might have been cleared
                        }
                    } else {
                        // Web fallback
                        const { value: webUrl } = await Preferences.get({ key: 'frase_daily_web_url' });
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
                    if (Capacitor.isNativePlatform()) {
                        try {
                            // Descargar imagen como Base64 (muy simple en React Native/Capacitor para imágenes livianas)
                            const response = await fetch(backendQuote.imagenUrl);
                            const blob = await response.blob();
                            
                            // Convertir Blob a Base64 manualmente para Capacitor
                            const base64Data = await new Promise<string>((resolve, reject) => {
                                const reader = new FileReader();
                                reader.readAsDataURL(blob);
                                reader.onloadend = () => {
                                    const base64data = reader.result as string;
                                    resolve(base64data.split(',')[1]); // Quitar "data:image/jpeg;base64,"
                                };
                                reader.onerror = reject;
                            });

                            // Guardar en Filesystem (esto sobreescribe la anterior si ya existía el mismo path)
                            await Filesystem.writeFile({
                                path: IMAGE_FILENAME,
                                data: base64Data,
                                directory: Directory.Data
                            });

                            const file = await Filesystem.getUri({
                                directory: Directory.Data,
                                path: IMAGE_FILENAME
                            });
                            localImageUrl = Capacitor.convertFileSrc(file.uri);

                        } catch (error) {
                            console.error("Error guardando imagen offline", error);
                            localImageUrl = backendQuote.imagenUrl; // Fallback
                        }
                    } else {
                        // Web Fallback (El navegador la cachea automáticamente)
                        localImageUrl = backendQuote.imagenUrl;
                        await Preferences.set({ key: 'frase_daily_web_url', value: localImageUrl });
                    }
                } else if (!Capacitor.isNativePlatform()) {
                     await Preferences.remove({ key: 'frase_daily_web_url' });
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
