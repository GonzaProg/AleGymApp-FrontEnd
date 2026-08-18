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
    const [comidasPredefinidas, setComidasPredefinidas] = useState<any[]>([]);
    const [platosFavoritos, setPlatosFavoritos] = useState<any[]>([]);

    useEffect(() => {
        if (user?.id) {
            cargarDatos();
        }
    }, [user?.id]);

    const cargarDatos = async () => {
        if (!user?.id) return;

        setLoadingDietas(true);
        try {
            const [dieta, registro, hist, predefinidas, platos] = await Promise.all([
                DietaApi.obtenerDietaDeAlumno(user.id),
                DietaApi.obtenerRegistroHoy(),
                DietaApi.obtenerHistorialRegistros(30), // Traemos últimos 30 días para armar semanas
                DietaApi.obtenerComidasPredefinidas(),
                DietaApi.obtenerPlatosFavoritos()
            ]);
            setDietaAsignada(dieta);
            setRegistroHoy(registro);
            setHistorial(hist);
            setComidasPredefinidas(predefinidas);
            setPlatosFavoritos(platos);
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

    const crearPredefinida = async (datos: any) => {
        setLoadingDietas(true);
        try {
            await DietaApi.crearComidaPredefinida(datos);
            await cargarDatos();
            return true;
        } catch (error) {
            console.error(error);
            showError("No se pudo guardar la comida predefinida");
            return false;
        } finally {
            setLoadingDietas(false);
        }
    };

    const actualizarPredefinida = async (id: number, datos: any) => {
        setLoadingDietas(true);
        try {
            await DietaApi.actualizarComidaPredefinida(id, datos);
            await cargarDatos();
            return true;
        } catch (error) {
            console.error(error);
            showError("No se pudo actualizar la comida predefinida");
            return false;
        } finally {
            setLoadingDietas(false);
        }
    };

    const eliminarPredefinida = async (id: number) => {
        setLoadingDietas(true);
        try {
            await DietaApi.eliminarComidaPredefinida(id);
            await cargarDatos();
            return true;
        } catch (error) {
            console.error(error);
            showError("No se pudo eliminar la comida predefinida");
            return false;
        } finally {
            setLoadingDietas(false);
        }
    };

    const crearPlatoFavorito = async (datos: any) => {
        setLoadingDietas(true);
        try {
            await DietaApi.crearPlatoFavorito(datos);
            await cargarDatos();
            return true;
        } catch (error) {
            console.error(error);
            showError("No se pudo guardar el plato favorito");
            return false;
        } finally {
            setLoadingDietas(false);
        }
    };

    const actualizarPlatoFavorito = async (id: number, datos: any) => {
        setLoadingDietas(true);
        try {
            await DietaApi.actualizarPlatoFavorito(id, datos);
            await cargarDatos();
            return true;
        } catch (error) {
            console.error(error);
            showError("No se pudo actualizar el plato favorito");
            return false;
        } finally {
            setLoadingDietas(false);
        }
    };

    const eliminarPlatoFavorito = async (id: number) => {
        setLoadingDietas(true);
        try {
            await DietaApi.eliminarPlatoFavorito(id);
            await cargarDatos();
            return true;
        } catch (error) {
            console.error(error);
            showError("No se pudo eliminar el plato favorito");
            return false;
        } finally {
            setLoadingDietas(false);
        }
    };

    return {
        dietaAsignada,
        registroHoy,
        historial,
        comidasPredefinidas,
        platosFavoritos,
        loadingDietas,
        registrarComida,
        registrarAgua,
        borrarComida,
        crearPredefinida,
        actualizarPredefinida,
        eliminarPredefinida,
        crearPlatoFavorito,
        actualizarPlatoFavorito,
        eliminarPlatoFavorito
    };
};
