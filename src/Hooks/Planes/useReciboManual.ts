import { useState, useEffect } from "react";
import { PlansApi } from "../../API/Planes/PlansApi";
import { PagosApi } from "../../API/Pagos/PagosApi";
import { showError, showSuccess } from "../../Helpers/Alerts";
import { useAlumnoSearch } from "../useAlumnoSearch";

export const useManualReceipt = () => {
    // UI
    const [sending, setSending] = useState(false);
    const [ultimoComprobanteUrl, setUltimoComprobanteUrl] = useState<string | null>(null);
    const [loadingComprobante, setLoadingComprobante] = useState(false);

    // Usamos el hook centralizado para la búsqueda de alumnos
    const {
        busqueda,
        sugerencias,
        alumnoSeleccionado,
        handleSearchChange,
        handleSelectAlumno,
        clearSelection
    } = useAlumnoSearch({ includePlan: true, initialLoad: true });

    useEffect(() => {
        if (alumnoSeleccionado) {
            const fetchPagos = async () => {
                setLoadingComprobante(true);
                try {
                    const pagos = await PagosApi.getHistorialPorUsuario(alumnoSeleccionado.id);
                    // Asegurar que estén ordenados por fechaPago de forma descendente
                    const sorted = [...pagos].sort((a, b) => new Date(b.fechaPago).getTime() - new Date(a.fechaPago).getTime());
                    const lastReceipt = sorted.find(p => p.comprobanteUrl);
                    setUltimoComprobanteUrl(lastReceipt?.comprobanteUrl || null);
                } catch (e) {
                    console.error("Error al obtener pagos para comprobante", e);
                } finally {
                    setLoadingComprobante(false);
                }
            };
            fetchPagos();
        } else {
            setUltimoComprobanteUrl(null);
        }
    }, [alumnoSeleccionado]);

    // 4. Acción Enviar
    const enviarRecibo = async () => {
        if (!alumnoSeleccionado) return;
        
        // Verificar si tiene un plan activo usando userPlans
        const planActivo = alumnoSeleccionado.userPlans?.find(up => up.activo);
        if (!planActivo) {
            return showError("Este usuario no tiene un plan activo.");
        }

        setSending(true);
        try {
            const response: any = await PlansApi.enviarReciboManual(alumnoSeleccionado.id, ultimoComprobanteUrl || undefined);

            switch (response.estadoEnvio) {
                case 'ENVIADO': 
                    showSuccess(`📤 Recibo enviado a ${alumnoSeleccionado.nombre} por WhatsApp 📱`); 
                    break;
                case 'SIN_TELEFONO': 
                    showError(`El usuario no tiene teléfono registrado.`); 
                    break;
                case 'ERROR': 
                    showError(`Falló el envío. Verifica la conexión a WhatsApp.`); 
                    break;
            }
        } catch (error: any) {
            showError(error.response?.data?.message || "Error al enviar recibo");
        } finally {
            setSending(false);
        }
    };

    return {
        alumnoSeleccionado,
        sugerencias,
        busqueda,
        handleSearchChange,
        handleSelectAlumno,
        clearSelection,
        enviarRecibo,
        sending,
        ultimoComprobanteUrl,
        loadingComprobante
    };
};