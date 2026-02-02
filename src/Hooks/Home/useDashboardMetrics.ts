import { useState, useEffect } from "react";
import { DashboardApi, type DashboardMetrics } from "../../API/Dashboard/DashboardApi";

export const useDashboardMetrics = () => {
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadMetrics = async () => {
            try {
                const data = await DashboardApi.getMetrics();
                setMetrics(data);
            } catch (error) {
                console.error("Error loading dashboard metrics", error);
            } finally {
                setLoading(false);
            }
        };
        loadMetrics();
    }, []);

    return { metrics, loading };
};