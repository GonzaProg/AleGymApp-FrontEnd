import { useState, useEffect } from "react";
import { PlansApi, type UserPlanDTO } from "../../API/Planes/PlansApi";

export const useUserPlan = () => {
    // Ahora 'activePlans' es un array
    const [activePlans, setActivePlans] = useState<UserPlanDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchMyPlans();
    }, []);

    const fetchMyPlans = async () => {
        setLoading(true);
        try {
            const result = await PlansApi.getMyPlan();
            
            if (result && result.tienePlan && Array.isArray(result.planes)) {
                setActivePlans(result.planes);
            } else {
                setActivePlans([]);
            }
        } catch (err) {
            console.error("Error al cargar mis planes:", err);
            setError("No se pudo cargar la información de tus planes.");
        } finally {
            setLoading(false);
        }
    };

    return {
        activePlans, // Array de planes
        loading,
        error
    };
};