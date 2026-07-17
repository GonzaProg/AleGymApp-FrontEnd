import { useState, useEffect } from 'react';
import { DietaApi } from '../../API/Dietas/DietaApi';
import { useAuthUser } from '../Auth/useAuthUser';
import { showError } from '../../Helpers/Alerts';

export const useStudentDietas = () => {
    const { currentUser: user } = useAuthUser();
    
    const [loadingDietas, setLoadingDietas] = useState(false);
    const [dietaAsignada, setDietaAsignada] = useState<any>(null);
    const [registroHoy, setRegistroHoy] = useState<any>(null);
    const [historial, setHistorial] = useState<any[]>([]);

    useEffect(() => {
        if (user?.id) {
            cargarDatos();
        }
    }, [user?.id]);

    const cargarDatos = async () => {
        if (!user?.id) return;
        
        setLoadingDietas(true);
        try {
            const [dieta, registro, hist] = await Promise.all([
                DietaApi.obtenerDietaDeAlumno(user.id),
                DietaApi.obtenerRegistroHoy(),
                DietaApi.obtenerHistorialRegistros(30) // Traemos últimos 30 días para armar semanas
            ]);
            setDietaAsignada(dieta);
            setRegistroHoy(registro);
            setHistorial(hist);
        } catch (e) {
            console.error("Error al cargar datos de dieta del alumno", e);
        } finally {
            setLoadingDietas(false);
        }
    };

    const registrarComida = async (comidaData: any) => {
        setLoadingDietas(true);
        try {
            await DietaApi.agregarComidaConsumida(comidaData, 0);
            await cargarDatos(); // Recargar para actualizar los totales
            return true;
        } catch (error) {
            console.error(error);
            showError("No se pudo registrar la comida");
            return false;
        } finally {
            setLoadingDietas(false);
        }
    };

    const registrarAgua = async (litros: number) => {
        setLoadingDietas(true);
        try {
            await DietaApi.agregarComidaConsumida(null, litros);
            await cargarDatos(); // Recargar para actualizar los totales
            return true;
        } catch (error) {
            console.error(error);
            showError("No se pudo registrar el agua");
            return false;
        } finally {
            setLoadingDietas(false);
        }
    };

    const borrarComida = async (comidaId: number) => {
        setLoadingDietas(true);
        try {
            await DietaApi.eliminarComidaConsumida(comidaId);
            await cargarDatos();
            return true;
        } catch (error) {
            console.error(error);
            showError("No se pudo eliminar la comida");
            return false;
        } finally {
            setLoadingDietas(false);
        }
    };

    return {
        dietaAsignada,
        registroHoy,
        historial,
        loadingDietas,
        registrarComida,
        registrarAgua,
        borrarComida
    };
};
