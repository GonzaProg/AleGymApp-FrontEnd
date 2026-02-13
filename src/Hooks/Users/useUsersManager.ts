import { useState, useEffect, useCallback } from "react";
import { UsuarioApi, type AlumnoDTO } from "../../API/Usuarios/UsuarioApi";

export const useUsersManager = () => {
    const [usuarios, setUsuarios] = useState<AlumnoDTO[]>([]);
    const [totalUsuarios, setTotalUsuarios] = useState(0);
    const [loading, setLoading] = useState(true);
    
    // Filtros
    const [busqueda, setBusqueda] = useState("");
    const [showAll, setShowAll] = useState(false);

    // Navegación interna
    const [selectedUser, setSelectedUser] = useState<AlumnoDTO | null>(null);

    const fetchUsuarios = useCallback(async () => {
        setLoading(true);
        try {
            const data = await UsuarioApi.getAlumnos({
                includePlan: true, 
                search: busqueda || undefined,
                showAll: showAll
            });
            setUsuarios(data.alumnos);
            setTotalUsuarios(data.total);
        } catch (error) {
            console.error("Error cargando usuarios:", error);
        } finally {
            setLoading(false);
        }
    }, [busqueda, showAll]);

    useEffect(() => {
        const timer = setTimeout(fetchUsuarios, 400);
        return () => clearTimeout(timer);
    }, [fetchUsuarios]);

    return {
        usuarios,
        totalUsuarios,
        loading,
        busqueda,
        setBusqueda,
        showAll,
        setShowAll,
        selectedUser,
        setSelectedUser,
        refresh: fetchUsuarios
    };
};