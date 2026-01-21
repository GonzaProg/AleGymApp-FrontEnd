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
        const userStr = localStorage.getItem("user");
        const tokenStr = localStorage.getItem("token");

        if (userStr) {
            try {
                const userObj: User = JSON.parse(userStr);
                setCurrentUser(userObj);
                
                // Determinamos roles
                const admin = userObj.rol === "Admin";
                setIsAdmin(admin);
                setIsEntrenador(userObj.rol === "Entrenador" || admin); 

            } catch (error) {
                console.error("Error sesión:", error);
                // Si falla el parseo, reseteamos permisos
                setIsAdmin(false);
                setIsEntrenador(false);
                setCurrentUser(null);
            }
        }
        
        if (tokenStr) setToken(tokenStr);

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