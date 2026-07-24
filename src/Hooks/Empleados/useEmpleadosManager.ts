import { useState, useEffect } from "react";
import { EmpleadoApi, type EmpleadoDTO } from "../../API/Empleados/EmpleadoApi";
import { GymApi } from "../../API/Gym/GymApi";
import { showError } from "../../Helpers/Alerts";

export type EmpleadosView = 'list' | 'detail' | 'create' | 'edit' | 'pay';

export const useEmpleadosManager = () => {
    // Obtener gymId de la sesión actual
    const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
    const currentUser = userStr ? JSON.parse(userStr) : null;
    const gymId = currentUser?.gym?.id;

    const [view, setView] = useState<EmpleadosView>('list');
    const [empleados, setEmpleados] = useState<EmpleadoDTO[]>([]);
    const [ultimosPagos, setUltimosPagos] = useState<any[]>([]);
    const [selectedEmpleado, setSelectedEmpleado] = useState<EmpleadoDTO | null>(null);
    const [loading, setLoading] = useState(true);

    // Estados para la Contraseña Financiera
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [passwordInput, setPasswordInput] = useState("");
    const [verifying, setVerifying] = useState(false);

    const handleDesbloquear = async () => {
        if (!passwordInput.trim()) return;
        setVerifying(true);
        try {
            const res = await GymApi.verifyFinancePassword(passwordInput);
            if (res.success) {
                setIsUnlocked(true);
                setPasswordInput("");
            }
        } catch (error) {
            showError("Contraseña incorrecta");
        } finally {
            setVerifying(false);
        }
    };

    const loadData = async () => {
        if (!gymId) return;
        setLoading(true);
        try {
            const [empleadosData, pagosData] = await Promise.all([
                EmpleadoApi.getEmpleados(gymId),
                EmpleadoApi.obtenerUltimosPagos(gymId)
            ]);
            setEmpleados(empleadosData);
            setUltimosPagos(pagosData);
        } catch (error) {
            console.error("Error al cargar datos:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [gymId]);

    const handleCreate = () => {
        setSelectedEmpleado(null);
        setView('create');
    };

    const handleEdit = (empleado: EmpleadoDTO) => {
        setSelectedEmpleado(empleado);
        setView('edit');
    };

    const handleSelect = (empleado: EmpleadoDTO) => {
        setSelectedEmpleado(empleado);
        setView('detail');
    };

    const handlePay = (empleado: EmpleadoDTO) => {
        setSelectedEmpleado(empleado);
        setView('pay');
    };

    const handleBackToList = () => {
        setView('list');
        setSelectedEmpleado(null);
        loadData(); // Refrescar por si hubo cambios
    };

    const handleBackToDetail = () => {
        setView('detail');
        loadData(); // Refrescar por si hubo cambios
    };

    return {
        gymId,
        view,
        empleados,
        ultimosPagos,
        selectedEmpleado,
        loading,
        isUnlocked,
        passwordInput,
        setPasswordInput,
        verifying,
        handleDesbloquear,
        loadData,
        handleCreate,
        handleEdit,
        handleSelect,
        handlePay,
        handleBackToList,
        handleBackToDetail
    };
};
