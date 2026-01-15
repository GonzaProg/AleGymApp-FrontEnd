export const getExerciseThumbnail = (imagenUrl?: string, videoUrl?: string): string | null => {
    // 1. Si hay una imagen manual subida, esa es la prioridad.
    if (imagenUrl) return imagenUrl;

    // 2. Si no hay imagen, pero hay video de Cloudinary, generamos la miniatura.
    if (videoUrl && videoUrl.includes("cloudinary.com")) {
        // Cloudinary permite cambiar la extensión .mp4 por .jpg para obtener una miniatura.        
        // Quitamos la extensión actual .mp4 y ponemos .jpg
        const base = videoUrl.substring(0, videoUrl.lastIndexOf("."));
        return `${base}.jpg`;
    }

    // 3. Si no hay nada, retornamos null (para que el componente muestre el ícono por defecto)
    return null;
};