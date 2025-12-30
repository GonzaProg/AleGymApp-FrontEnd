import { useState, useEffect, useCallback } from 'react';
import { EjerciciosApi } from '../../API/Ejercicios/EjerciciosApi';
import { useAuthUser } from '../useAuthUser'; 

export interface Ejercicio {
    id: number;
    nombre: string;
    urlVideo?: string;
}

export const useEjerciciosCrud = () => {
    const { isAdmin } = useAuthUser(); 
    const [ejercicios, setEjercicios] = useState<Ejercicio[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Estados del Modal y Formulario
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({ nombre: '', urlVideo: '' });

    // --- Carga inicial ---
    const fetchEjercicios = useCallback(async () => {
        setLoading(true);
        try {
            const data = await EjerciciosApi.getAll();
            setEjercicios(data);
            setError(null);
        } catch (err: any) {
            // Axios devuelve el error en err.response.data
            const mensaje = err.response?.data?.message || err.message || "Error al cargar";
            setError(mensaje);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEjercicios();
    }, [fetchEjercicios]);

    // --- Manejadores Modal ---
    const handleOpenCreate = () => {
        setEditingId(null);
        setFormData({ nombre: '', urlVideo: '' });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (ejercicio: Ejercicio) => {
        setEditingId(ejercicio.id);
        setFormData({ nombre: ejercicio.nombre, urlVideo: ejercicio.urlVideo || '' });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setError(null);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // --- CRUD Operations ---
    const handleSubmit = async () => {
        // Validación de rol local
        if (!isAdmin) {
            alert("No tienes permisos de administrador.");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            if (editingId) {
                await EjerciciosApi.update(editingId, formData);
            } else {
                await EjerciciosApi.create(formData);
            }
            await fetchEjercicios();
            handleCloseModal();
        } catch (err: any) {
            // Captura de error mejorada para Axios
            const mensaje = err.response?.data?.message || err.response?.data?.error || "Error al guardar";
            setError(mensaje);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!isAdmin || !window.confirm("¿Seguro que deseas eliminar este ejercicio?")) return;
        setLoading(true);
        try {
            await EjerciciosApi.delete(id);
            await fetchEjercicios();
        } catch (err: any) {
            const mensaje = err.response?.data?.message || "Error al eliminar";
            alert(mensaje);
        } finally {
            setLoading(false);
        }
    };

    return {
        ejercicios, loading, error, isAdmin,
        isModalOpen, editingId, formData,
        handleOpenCreate, handleOpenEdit, handleCloseModal,
        handleInputChange, handleSubmit, handleDelete
    };
};