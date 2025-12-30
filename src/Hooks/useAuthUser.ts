import { useState, useEffect } from 'react';

// Defino la interfaz de tu usuario para tener autocompletado
interface User {
    id?: number;
    nombre?: string;
    rol: string;
    token?: string;
}

export const useAuthUser = () => {
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        // Obtenemos el string del localStorage
        const userStr = localStorage.getItem("user");
        const tokenStr = localStorage.getItem("token");

        if (userStr) {
            try {
                const userObj: User = JSON.parse(userStr);
                
                setCurrentUser(userObj);
                
                setIsAdmin(userObj.rol === "Admin"); 
                
            } catch (error) {
                console.error("Error al procesar la sesión del usuario:", error);
                // Si falla el parseo (JSON corrupto), limpiamos por seguridad
                setIsAdmin(false);
                setCurrentUser(null);
            }
        }
        
        if (tokenStr) {
            setToken(tokenStr);
        }

    }, []);

    // Retornamos información útil
    return { 
        isAdmin,      
        currentUser,  
        token         
    };
};