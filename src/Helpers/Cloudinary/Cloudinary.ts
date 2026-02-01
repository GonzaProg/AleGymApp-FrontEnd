const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const VITE_API_URL_CLOUDINARY = import.meta.env.VITE_API_URL_CLOUDINARY;
const API_URL_BASE = `${VITE_API_URL_CLOUDINARY}${CLOUD_NAME}`;

export const CloudinaryApi = {
    
    // Sube un archivo a Cloudinary
    upload: async (file: File, resourceType: 'image' | 'video' = 'image'): Promise<string> => {
        
        // Validaciones básicas de entorno
        if (!CLOUD_NAME || !UPLOAD_PRESET) {
            throw new Error("Faltan configurar las variables de entorno de Cloudinary (VITE_CLOUDINARY_...)");
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);

        try {
            // Usamos fetch nativo para no enviar los Headers de Autorización de tu Backend (Axios interceptor)
            // ya que Cloudinary rechazaría el token de tu backend.
            const response = await fetch(`${API_URL_BASE}/${resourceType}/upload`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || "Error desconocido al subir a Cloudinary");
            }

            const data = await response.json();
            return data.secure_url; // Retornamos la URL HTTPS

        } catch (error) {
            console.error(`Error CloudinaryService (${resourceType}):`, error);
            throw error; // Re-lanzamos para que el componente maneje la alerta
        }
    },

    // Obtiene la miniatura a partir de la URL del video o imagen
    getThumbnail: (imagenUrl?: string, videoUrl?: string): string | null => {
        // 1. Prioridad: Imagen manual subida
        if (imagenUrl && imagenUrl.trim() !== "") {
            return imagenUrl;
        }

        // 2. Si no hay imagen, pero hay video de Cloudinary, generamos la miniatura.
        if (videoUrl && videoUrl.includes("cloudinary.com")) {
            // Reemplazamos la extensión del video (.mp4, .mov, etc) por .jpg
            // Esta Regex busca el último punto y reemplaza lo que sigue por .jpg
            return videoUrl.replace(/\.[^/.]+$/, ".jpg");
        }

        // 3. Si no hay nada
        return null;
    }
};