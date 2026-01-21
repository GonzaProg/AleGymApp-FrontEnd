import { useState, useEffect } from "react";
import { PlansApi } from "../../API/Planes/PlansApi";

export const useUserPlan = () => {
    const [myPlan, setMyPlan] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchMyPlan();
    }, []);

    const fetchMyPlan = async () => {
        setLoading(true);
        try {
            const miPlanInfo = await PlansApi.getMyPlan();
            if (miPlanInfo && miPlanInfo.tienePlan) {
                setMyPlan(miPlanInfo);
            } else {
                setMyPlan(null);
            }
        } catch (err) {
            console.error("Error al cargar mi plan:", err);
            setError("No se pudo cargar la información del plan.");
        } finally {
            setLoading(false);
        }
    };

    return {
        myPlan,
        loading,
        error
    };
};