import { useState, useEffect } from 'react';

export interface User {
    id?: number;
    dni: string;
    nombre?: string;
    apellido?: string;
    nombreUsuario?: string;
    telefono?: string;
    fechaNacimiento?: string;
    email?: string;
    fotoPerfil?: string;
    rol: string; 
    token?: string;
}

export const useAuthUser = () => {
    // 1. AGREGAMOS EL ESTADO DE CARGA (Inicia en true)
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [isEntrenador, setIsEntrenador] = useState<boolean>(false);
    
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        // Buscar en ambos almacenamientos
        const userLocal = localStorage.getItem("user");
        const tokenLocal = localStorage.getItem("token");
        
        const userSession = sessionStorage.getItem("user");
        const tokenSession = sessionStorage.getItem("token");

        // Priorizamos Local (Persistente), sino usamos Session (Temporal)
        const userStr = userLocal || userSession;
        const tokenStr = tokenLocal || tokenSession;

        if (userStr && tokenStr) {
            try {
                const userObj: User = JSON.parse(userStr);
                setCurrentUser(userObj);
                setToken(tokenStr);

                // Determinamos roles
                const admin = userObj.rol === "Admin";
                setIsAdmin(admin);
                setIsEntrenador(userObj.rol === "Entrenador" || admin); 

            } catch (error) {
                console.error("Error sesión:", error);
                // Limpieza de emergencia
                localStorage.clear();
                sessionStorage.clear();
                setIsAdmin(false);
                setIsEntrenador(false);
                setCurrentUser(null);
            }
        }
        
        // 2. FINALIZAMOS LA CARGA
        // Esto asegura que ya leímos el localStorage (haya datos o no)
        setIsLoading(false);

    }, []);

    return { 
        isAdmin,
        isEntrenador, 
        currentUser,
        token,
        isLoading // 3. RETORNAMOS LA PROPIEDAD
    };
};