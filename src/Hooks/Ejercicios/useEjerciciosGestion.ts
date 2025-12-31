import { useState, useEffect, useCallback } from 'react';
import { useAuthUser } from '../useAuthUser'; 
import { EjerciciosApi, type Ejercicio, type EjercicioDTO } from '../../API/Ejercicios/EjerciciosApi'; // Todo desde un solo lugar

export const useEjerciciosGestion = () => {
    const { isAdmin, isEntrenador } = useAuthUser(); 
    const [ejercicios, setEjercicios] = useState<Ejercicio[]>([]);
    const [loading, setLoading] = useState(false);
    
    // --- Estados para Edición ---
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<EjercicioDTO>({ nombre: '', urlVideo: '' });

    // 1. Cargar Ejercicios
    const fetchEjercicios = useCallback(async () => {
        setLoading(true);
        try {
            const data = await EjerciciosApi.getAll();
            setEjercicios(data);
        } catch (err) {
            console.error("Error al cargar ejercicios", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEjercicios();
    }, [fetchEjercicios]);

    // 2. Eliminar
    const handleDelete = async (id: number) => {
        if (!isAdmin) {
             alert("Solo administradores pueden eliminar.");
             return;
        }
        if (!window.confirm("¿Seguro que deseas eliminar este ejercicio?")) return;
        
        try {
            await EjerciciosApi.delete(id);
            setEjercicios(prev => prev.filter(e => e.id !== id));
        } catch (err: any) {
            alert(err.response?.data?.message || "Error al eliminar");
        }
    };

    // 3. Iniciar Edición
    const startEdit = (ejercicio: Ejercicio) => {
        if (!isAdmin && !isEntrenador) return;
        setEditingId(ejercicio.id);
        // Cargamos los datos actuales en el formulario de edición
        setEditForm({ nombre: ejercicio.nombre, urlVideo: ejercicio.urlVideo || '' });
    };

    // 4. Cancelar Edición
    const cancelEdit = () => {
        setEditingId(null);
        setEditForm({ nombre: '', urlVideo: '' });
    };

    // 5. Guardar Edición
    const saveEdit = async (id: number) => {
        try {
            const actualizado = await EjerciciosApi.update(id, editForm);
            setEjercicios(prev => prev.map(e => (e.id === id ? actualizado : e)));
            setEditingId(null);
        } catch (err: any) {
            alert(err.response?.data?.error || "Error al actualizar");
        }
    };

    // Manejador de Inputs para la Tabla (Tipado seguro)
    const handleEditInputChange = (field: keyof EjercicioDTO, value: string) => {
        setEditForm(prev => ({ ...prev, [field]: value }));
    };

    return {
        ejercicios,
        loading,
        isAdmin,
        editingId,
        editForm,
        handleDelete,
        startEdit,
        cancelEdit,
        saveEdit,
        handleEditInputChange,
        refetch: fetchEjercicios
    };
};