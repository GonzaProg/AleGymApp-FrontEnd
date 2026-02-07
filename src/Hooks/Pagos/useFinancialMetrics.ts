import { useState, useEffect } from "react";
import { PagosApi, type FinancialMetricsDTO } from "../../API/Pagos/PagosApi";

export const useFinancialMetrics = () => {
    const [metrics, setMetrics] = useState<FinancialMetricsDTO | null>(null);
    const [loadingMetrics, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await PagosApi.getMetrics();
                setMetrics(data);
            } catch (error) {
                console.error("Error loading financial metrics", error);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    return { metrics, loadingMetrics };
};