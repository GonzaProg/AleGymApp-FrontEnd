import api from '../../API/axios';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const VITE_API_URL_CLOUDINARY = import.meta.env.VITE_API_URL_CLOUDINARY;
const API_URL_BASE = `${VITE_API_URL_CLOUDINARY}${CLOUD_NAME}`;

const PRESETS = {
    usuarios: import.meta.env.VITE_PRESET_USUARIOS,
    ejercicios: import.meta.env.VITE_PRESET_EJERCICIOS
};

type UploadType = 'usuarios' | 'ejercicios' | 'logos';

export const CloudinaryApi = {
    
    // AÑADIDO: parametro 'customPath'
    upload: async (file: File, type: UploadType, customPath?: string, resourceType: 'image' | 'video' = 'image'): Promise<string> => {
        
        // Mapeo: Si es 'logos', usamos el preset de USUARIOS
        // pero le cambiaremos la carpeta abajo.
        const presetKey = type === 'logos' ? 'usuarios' : type;
        const selectedPreset = PRESETS[presetKey];

        if (!CLOUD_NAME || !selectedPreset) {
            throw new Error(`Falta configuración de Cloudinary para el tipo: ${type}`);
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', selectedPreset);

        // LÓGICA DE CARPETAS
        if (customPath) {
            // Si mandamos ruta específica (ej: "Usuarios/Gym_1"), usamos esa.
            formData.append('folder', customPath);
        } else {
            let defaultFolder = '';
            switch (type) {
                case 'usuarios': defaultFolder = 'Usuarios/General'; break;
                case 'ejercicios': defaultFolder = 'Ejercicios'; break;
                case 'logos': defaultFolder = 'Logos'; break;
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
            // Llamamos al backend, no a Cloudinary directo
            await api.post('/cloudinary/delete', { url, type: resourceType });
        } catch (error) {
            console.error("Error eliminando archivo antiguo:", error);
            // Fallo silencioso: no queremos detener la app si falla el borrado de basura
        }
    },
};