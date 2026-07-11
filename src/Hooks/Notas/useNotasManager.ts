import { useState, useEffect, useCallback } from 'react';
import { NotasApi, type NotaDTO } from '../../API/Notas/NotasApi';
import { GymApi } from '../../API/Gym/GymApi';
import { showSuccess, showError, showPasswordPrompt, showEditNotePrompt } from '../../Helpers/Alerts';

export const useNotasManager = (onNavigate?: (tab: string) => void) => {
    const [notas, setNotas] = useState<NotaDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [verTodas, setVerTodas] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Formulario
    const [concepto, setConcepto] = useState<string>('');

    const fetchNotas = useCallback(async () => {
        setLoading(true);
        try {
            const data = await NotasApi.obtenerHistorial(verTodas ? undefined : 10);
            setNotas(data);
        } catch (error) {
            console.error("Error al cargar notas:", error);
            showError("No se pudo cargar el historial de notas");
        } finally {
            setLoading(false);
        }
    }, [verTodas]);

    useEffect(() => {
        fetchNotas();
    }, [fetchNotas]);

    const handleToggleVerTodas = () => {
        setVerTodas(prev => !prev);
    };

    const handleCrearNota = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!concepto.trim()) {
            return showError("El concepto es requerido");
        }

        setSubmitting(true);
        try {
            await NotasApi.crearNota({
                concepto
            });
            showSuccess("Nota registrada correctamente");
            setConcepto('');
            fetchNotas();
        } catch (error: any) {
            showError(error.response?.data?.error || "Error al registrar nota");
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleResuelta = async (nota: NotaDTO) => {
        const passwordPrompt = await showPasswordPrompt(
            "Modificar Estado", 
            "Ingrese la contraseña de finanzas para cambiar el estado de la nota."
        );

        if (!passwordPrompt.isConfirmed || !passwordPrompt.value) return;

        const isNowResolved = !nota.resuelta;
        let nuevoConcepto = nota.concepto;

        if (isNowResolved) {
            const today = new Date().toLocaleString('es-AR', { 
                timeZone: 'America/Argentina/Buenos_Aires',
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
            nuevoConcepto += `\n\nResuelto: ${today}`;
        } else {
            nuevoConcepto = nuevoConcepto.replace(/\n\nResuelto: .*$/, '');
        }

        try {
            await NotasApi.modificarNota(nota.id, passwordPrompt.value, { 
                resuelta: isNowResolved,
                concepto: nuevoConcepto !== nota.concepto ? nuevoConcepto : undefined 
            });
            showSuccess("Estado actualizado");
            fetchNotas();
        } catch (error: any) {
            showError(error.response?.data?.error || "Error al actualizar nota");
        }
    };

    const handleEditarNota = async (nota: NotaDTO) => {
        const editPrompt = await showEditNotePrompt(nota.concepto);
        if (!editPrompt.isConfirmed || !editPrompt.value) return;

        const { concepto: nuevoConcepto } = editPrompt.value;

        const passwordPrompt = await showPasswordPrompt(
            "Guardar Cambios", 
            "Ingrese la contraseña de finanzas para aplicar los cambios."
        );

        if (!passwordPrompt.isConfirmed || !passwordPrompt.value) return;

        try {
            await NotasApi.modificarNota(nota.id, passwordPrompt.value, { 
                concepto: nuevoConcepto
            });
            showSuccess("Nota modificada");
            fetchNotas();
        } catch (error: any) {
            showError(error.response?.data?.error || "Error al modificar nota");
        }
    };

    const handleEliminarNota = async (id: number) => {
        const passwordPrompt = await showPasswordPrompt(
            "Eliminar Nota", 
            "Ingrese la contraseña de finanzas para eliminar esta nota permanentemente."
        );

        if (!passwordPrompt.isConfirmed || !passwordPrompt.value) return;

        try {
            await NotasApi.eliminarNota(id, passwordPrompt.value);
            showSuccess("Nota eliminada correctamente");
            fetchNotas();
        } catch (error: any) {
            showError(error.response?.data?.error || "Error al eliminar nota");
        }
    };

    const handleConvertToGasto = async (nota: NotaDTO) => {
        const passwordPrompt = await showPasswordPrompt(
            "Convertir a Gasto", 
            "Ingrese la contraseña de finanzas para continuar."
        );

        if (!passwordPrompt.isConfirmed || !passwordPrompt.value) return;

        try {
            const res = await GymApi.verifyFinancePassword(passwordPrompt.value);
            if (res.success) {
                sessionStorage.setItem('pendingGastoNote', JSON.stringify({
                    notaId: nota.id,
                    concepto: nota.concepto,
                    password: passwordPrompt.value
                }));
                if (onNavigate) {
                    onNavigate("Control de Gastos");
                }
            }
        } catch (error) {
            showError("Contraseña incorrecta");
        }
    };

    return {
        notas,
        loading,
        verTodas,
        handleToggleVerTodas,
        concepto,
        setConcepto,
        handleCrearNota,
        submitting,
        handleToggleResuelta,
        handleEditarNota,
        handleEliminarNota,
        handleConvertToGasto
    };
};
