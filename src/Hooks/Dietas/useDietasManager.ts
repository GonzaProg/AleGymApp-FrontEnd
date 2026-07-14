import { useState, useEffect } from 'react';
import { DietaApi } from '../../API/Dietas/DietaApi';
import { UsuarioApi, type AlumnoDTO } from '../../API/Usuarios/UsuarioApi';
import { showSuccess, showError, showConfirmDelete } from "../../Helpers/Alerts";

export const useDietasManager = () => {
    const [loadingDietas, setLoadingDietas] = useState(false);
    const [loadingUsuarios, setLoadingUsuarios] = useState(true);
    const [usuarios, setUsuarios] = useState<AlumnoDTO[]>([]);

    const [selectedUser, setSelectedUser] = useState<AlumnoDTO | null>(null);
    const [dietaActual, setDietaActual] = useState<any>(null);
    
    // Form state para nueva dieta
    const [nombre, setNombre] = useState('');
    const [observaciones, setObservaciones] = useState('');
    const [caloriasDiarias, setCaloriasDiarias] = useState<number | ''>('');
    const [proteinasDiarias, setProteinasDiarias] = useState<number | ''>('');
    const [carbohidratosDiarios, setCarbohidratosDiarios] = useState<number | ''>('');
    const [grasasDiarias, setGrasasDiarias] = useState<number | ''>('');
    const [litrosAguaDiarios, setLitrosAguaDiarios] = useState<number | ''>('');
    
    const [comidas, setComidas] = useState<any[]>([]);

    useEffect(() => {
        fetchUsuarios();
    }, []);

    useEffect(() => {
        if (selectedUser) {
            cargarDieta(selectedUser.id);
        } else {
            limpiarFormulario();
        }
    }, [selectedUser]);

    const fetchUsuarios = async () => {
        setLoadingUsuarios(true);
        try {
            const res = await UsuarioApi.getAlumnos();
            setUsuarios(res.alumnos || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingUsuarios(false);
        }
    };

    const cargarDieta = async (usuarioId: number) => {
        setLoadingDietas(true);
        try {
            const dieta = await DietaApi.obtenerDietaDeAlumno(usuarioId);
            if (dieta) {
                setDietaActual(dieta);
                setNombre(dieta.nombre || '');
                setObservaciones(dieta.observaciones || '');
                setCaloriasDiarias(dieta.caloriasDiarias || '');
                setProteinasDiarias(dieta.proteinasDiarias || '');
                setCarbohidratosDiarios(dieta.carbohidratosDiarios || '');
                setGrasasDiarias(dieta.grasasDiarias || '');
                setLitrosAguaDiarios(dieta.litrosAguaDiarios || '');
                setComidas(dieta.comidas || []);
            } else {
                limpiarFormulario();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingDietas(false);
        }
    };

    const limpiarFormulario = () => {
        setDietaActual(null);
        setNombre('');
        setObservaciones('');
        setCaloriasDiarias('');
        setProteinasDiarias('');
        setCarbohidratosDiarios('');
        setGrasasDiarias('');
        setLitrosAguaDiarios('');
        setComidas([]);
    };

    const agregarComida = () => {
        setComidas([...comidas, { tipo: '', alimentos: '', calorias: null, proteinas: null, carbohidratos: null, grasas: null }]);
    };

    const eliminarComida = (index: number) => {
        const nuevasComidas = [...comidas];
        nuevasComidas.splice(index, 1);
        setComidas(nuevasComidas);
    };

    const actualizarComida = (index: number, campo: string, valor: any) => {
        const nuevasComidas = [...comidas];
        nuevasComidas[index] = { ...nuevasComidas[index], [campo]: valor };
        setComidas(nuevasComidas);
    };

    const guardarDieta = async () => {
        if (!selectedUser) return showError('Debes seleccionar un alumno primero.');
        if (!nombre) return showError('El nombre de la dieta es obligatorio.');

        // Validación de negativos en metas globales
        if (
            (caloriasDiarias !== '' && caloriasDiarias < 0) ||
            (proteinasDiarias !== '' && proteinasDiarias < 0) ||
            (carbohidratosDiarios !== '' && carbohidratosDiarios < 0) ||
            (grasasDiarias !== '' && grasasDiarias < 0) ||
            (litrosAguaDiarios !== '' && litrosAguaDiarios < 0)
        ) {
            return showError('No se pueden ingresar valores negativos en las metas diarias.');
        }

        // Validación de negativos en comidas
        for (const comida of comidas) {
            if (
                (comida.calorias !== null && comida.calorias < 0) ||
                (comida.proteinas !== null && comida.proteinas < 0) ||
                (comida.carbohidratos !== null && comida.carbohidratos < 0) ||
                (comida.grasas !== null && comida.grasas < 0)
            ) {
                return showError('No se pueden ingresar valores negativos en los macros de las comidas.');
            }
        }

        const datosDieta = {
            nombre,
            observaciones,
            caloriasDiarias: caloriasDiarias === '' ? null : caloriasDiarias,
            proteinasDiarias: proteinasDiarias === '' ? null : proteinasDiarias,
            carbohidratosDiarios: carbohidratosDiarios === '' ? null : carbohidratosDiarios,
            grasasDiarias: grasasDiarias === '' ? null : grasasDiarias,
            litrosAguaDiarios: litrosAguaDiarios === '' ? null : litrosAguaDiarios
        };

        setLoadingDietas(true);
        try {
            if (dietaActual) {
                await DietaApi.actualizarDieta(dietaActual.id, datosDieta, comidas);
                showSuccess('Dieta actualizada con éxito!');
            } else {
                await DietaApi.crearDieta(selectedUser.id, datosDieta, comidas);
                showSuccess('Dieta asignada con éxito!');
            }
            cargarDieta(selectedUser.id);
        } catch (error) {
            console.error(error);
            showError('Error al guardar la dieta');
        } finally {
            setLoadingDietas(false);
        }
    };

    const borrarDieta = async () => {
        if (!dietaActual) return;
        const result = await showConfirmDelete("Eliminar Dieta", "¿Seguro que deseas eliminar esta dieta?");
        if (result.isConfirmed) {
            setLoadingDietas(true);
            try {
                await DietaApi.eliminarDieta(dietaActual.id);
                showSuccess('Dieta eliminada');
                limpiarFormulario();
            } catch (error) {
                console.error(error);
                showError('Error al eliminar');
            } finally {
                setLoadingDietas(false);
            }
        }
    };

    return {
        usuarios,
        loadingUsuarios,
        loadingDietas,
        selectedUser,
        setSelectedUser,
        dietaActual,
        nombre, setNombre,
        observaciones, setObservaciones,
        caloriasDiarias, setCaloriasDiarias,
        proteinasDiarias, setProteinasDiarias,
        carbohidratosDiarios, setCarbohidratosDiarios,
        grasasDiarias, setGrasasDiarias,
        litrosAguaDiarios, setLitrosAguaDiarios,
        comidas,
        agregarComida,
        eliminarComida,
        actualizarComida,
        guardarDieta,
        borrarDieta
    };
};
