import api from '../../API/axios';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const VITE_API_URL_CLOUDINARY = import.meta.env.VITE_API_URL_CLOUDINARY;
const API_URL_BASE = `${VITE_API_URL_CLOUDINARY}${CLOUD_NAME}`;

const PRESETS = {
    usuarios: import.meta.env.VITE_PRESET_USUARIOS,
    ejercicios: import.meta.env.VITE_PRESET_EJERCICIOS,
    // Puedes crear un VITE_PRESET_PRODUCTOS en tu .env o reutilizar el de usuarios
    // Si no lo creas, usará el de usuarios por defecto en la lógica de abajo
    productos: import.meta.env.VITE_PRESET_PRODUCTOS || import.meta.env.VITE_PRESET_USUARIOS 
};

// 1. AÑADIMOS 'productos' AL TIPO
type UploadType = 'usuarios' | 'ejercicios' | 'logos' | 'productos';

export const CloudinaryApi = {
    
    upload: async (file: File, type: UploadType, customPath?: string, resourceType: 'image' | 'video' = 'image'): Promise<string> => {
        
        // 2. LÓGICA DE PRESETS
        let presetKey = type;
        
        // Mapeos especiales si reutilizamos presets
        if (type === 'logos') presetKey = 'usuarios';
        if (type === 'productos' && !PRESETS.productos) presetKey = 'usuarios'; // Fallback

        // @ts-ignore (Para que TS confíe en el acceso dinámico)
        const selectedPreset = PRESETS[presetKey] || PRESETS[type];

        if (!CLOUD_NAME || !selectedPreset) {
            throw new Error(`Falta configuración de Cloudinary para el tipo: ${type}`);
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', selectedPreset);

        // 3. LÓGICA DE CARPETAS (Default folders)
        if (customPath) {
            formData.append('folder', customPath);
        } else {
            let defaultFolder = '';
            switch (type) {
                case 'usuarios': defaultFolder = 'Usuarios/General'; break;
                case 'ejercicios': defaultFolder = 'Ejercicios'; break;
                case 'logos': defaultFolder = 'Logos'; break;
                case 'productos': defaultFolder = 'Productos/General'; break;
            }
            formData.append('folder', defaultFolder);
        }

        try {
            const response = await fetch(`${API_URL_BASE}/${resourceType}/upload`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || "Error al subir a Cloudinary");
            }

            const data = await response.json();
            return data.secure_url;

        } catch (error) {
            console.error(`Error CloudinaryService (${resourceType}):`, error);
            throw error;
        }
    },

    getThumbnail: (imagenUrl?: string, videoUrl?: string): string | null => {
        if (imagenUrl && imagenUrl.trim() !== "") return imagenUrl;
        if (videoUrl && videoUrl.includes("cloudinary.com")) {
            return videoUrl.replace(/\.[^/.]+$/, ".jpg");
        }
        return null;
    },

    delete: async (url: string, resourceType: 'image' | 'video' = 'image') => {
        if (!url || !url.includes("cloudinary.com")) return;

        try {
            await api.post('/cloudinary/delete', { url, type: resourceType });
        } catch (error) {
            console.error("Error eliminando archivo antiguo:", error);
        }
    },
};