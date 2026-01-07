import { useState, useEffect } from 'react';

interface User {
    id?: number;
    nombre?: string;
    apellido?: string;
    nombreUsuario?: string;
    email?: string;
    fotoPerfil?: string;
    rol: string; // "Admin", "Entrenador", "Alumno"
    token?: string;
}

export const useAuthUser = () => {
    // Definimos los permisos
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
                setIsAdmin(false);
                setIsEntrenador(false);
                setCurrentUser(null);
            }
        }
        
        if (tokenStr) setToken(tokenStr);

    }, []);

    return { 
        isAdmin,
        isEntrenador, 
        currentUser,
        token 
    };
};