import { useState, useEffect, useRef } from "react";
import { DashboardApi, type DashboardMetrics } from "../../API/Dashboard/DashboardApi";

export const useDashboardMetrics = (userRole: string) => {
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const isLoadingRef = useRef(false);

    useEffect(() => {
        // Solo ejecutar si tenemos un rol válido y no estamos cargando
        if (!userRole || userRole === '' || isLoadingRef.current) {
            if (!userRole || userRole === '') {
                setLoading(false);
            }
            return;
        }

        const loadMetrics = async () => {
            isLoadingRef.current = true;
            try {
                setLoading(true);
                const data = await DashboardApi.getMetrics(userRole);
                setMetrics(data);
            } catch (error) {
                console.error("Error loading dashboard metrics", error);
            } finally {
                setLoading(false);
                isLoadingRef.current = false;
            }
        };
        loadMetrics();
    }, [userRole]);

    return { metrics, loading };
};