import api from '../axios';
import { CloudinaryApi } from '../../Helpers/Cloudinary/Cloudinary';

export const PersonalRecordApi = {
    getNombresEjercicios: async () => {
        const { data } = await api.get('/ejercicios/nombres');
        return data;
    },

    getMyPRs: async (limit?: number, search?: string) => {
        const params = new URLSearchParams();
        if (limit) params.append('limit', limit.toString());
        if (search) params.append('search', search);
        
        const { data } = await api.get(`/prs/me?${params.toString()}`);
        return data;
    },

    create: async (ejercicioId: number, peso: number, videoUrl?: string) => {
        const { data } = await api.post('/prs', { ejercicioId, peso, videoUrl });
        return data;
    },

    update: async (id: number, peso: number, videoUrl?: string, oldVideoUrl?: string) => {
        // Lógica eficiente: Si subimos un video nuevo y había uno viejo, borramos el viejo
        if (videoUrl && oldVideoUrl && videoUrl !== oldVideoUrl) {
            await CloudinaryApi.delete(oldVideoUrl, 'video');
        }
        const { data } = await api.put(`/prs/${id}`, { peso, videoUrl });
        return data;
    },

    delete: async (id: number, videoUrl?: string) => {
        // Si borramos el PR y tenía video, liberamos espacio en Cloudinary
        if (videoUrl) {
            await CloudinaryApi.delete(videoUrl, 'video');
        }
        const { data } = await api.delete(`/prs/${id}`);
        return data;
    }
};