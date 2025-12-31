import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EjerciciosApi, type EjercicioDTO } from '../../API/Ejercicios/EjerciciosApi'; 
import { useAuthUser } from '../useAuthUser';

export const useEjerciciosCrear = () => {
    const navigate = useNavigate();
    
    // 2. Obtenemos los permisos del usuario actual
    const { isAdmin, isEntrenador } = useAuthUser();

    // Estados tipados con el DTO
    const [form, setForm] = useState<EjercicioDTO>({ nombre: '', urlVideo: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 1. Manejar cambios en inputs
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // 2. Enviar Formulario
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 3. Validación de Seguridad (Frontend)
        // Si no es Admin Y no es Entrenador -> Bloqueamos
        if (!isAdmin && !isEntrenador) {
            alert("No tienes permisos para crear ejercicios.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // La lógica API ya estaba limpia, excelente.
            await EjerciciosApi.create(form);
            navigate('/ejercicios/gestion'); 
        } catch (err: any) {
            const msg = err.response?.data?.error || err.message || "Error al crear";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    // 3. Cancelar
    const handleCancel = () => {
        navigate(-1);
    };

    return {
        form,
        loading,
        error,
        isAdmin,      // Retornamos esto por si quieres ocultar el botón de "Guardar" visualmente
        isEntrenador, 
        handleInputChange,
        handleSubmit,
        handleCancel
    };
};