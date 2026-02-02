import { useState, useEffect } from "react";
import { PagosApi, type PagoDTO } from "../../API/Pagos/PagosApi";

export const useHistorialPagos = () => {
    const [pagos, setPagos] = useState<PagoDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const data = await PagosApi.getHistorial();
            setPagos(data);

        } catch (err: any) {
            console.error("Error cargando pagos:", err);
            setError("No se pudo cargar el historial de pagos.");
        } finally {
            setLoading(false);
        }
    };

    return {
        pagos,
        loading,
        error,
        recargar: cargarDatos
    };
};