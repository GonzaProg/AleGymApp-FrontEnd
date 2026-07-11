import { useState, useMemo } from "react";
import { type EmpleadoDTO } from "../../API/Empleados/EmpleadoApi";

export const useEmpleadosList = (empleados: EmpleadoDTO[]) => {
    const [showInactive, setShowInactive] = useState(false);

    const empleadosFiltrados = useMemo(() => {
        return showInactive ? empleados : empleados.filter(e => e.activo);
    }, [empleados, showInactive]);

    return {
        showInactive,
        setShowInactive,
        empleadosFiltrados
    };
};
