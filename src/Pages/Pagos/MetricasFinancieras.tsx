import { useState } from "react";
import { useFinancialManager } from "../../Hooks/Pagos/useFinancialManager"; 
import { AppStyles } from "../../Styles/AppStyles";
import { Card } from "../../Components/UI/Card";
import { Input } from "../../Components/UI/Input";
import { Button } from "../../Components/UI/Button";
import { FinancialDashboard } from "../../Components/Pagos/FinancialDashboard";
import { ToggleSwitch } from "../../Components/UI/ToggleSwitch";
import { DollarSign, Search, Undo2, FileText } from "lucide-react";
import { GymApi } from "../../API/Gym/GymApi";
import { showError } from "../../Helpers/Alerts";
import { UnlockSection } from "../../Components/Security/UnlockSection";

export const MetricasFinancieras = () => {
    
    const {
        pagos, loadingPagos,
        busqueda, sugerencias, mostrarSugerencias, alumnoSeleccionado,
        handleSearchChange, handleSelectAlumno, setMostrarSugerencias, handleClearSearch,
        handleDevolucion
    } = useFinancialManager();

    // Estado local para Dashboard
    const [showMetrics, setShowMetrics] = useState(() => {
        const saved = localStorage.getItem("showFinancialMetrics");
        return saved !== null ? JSON.parse(saved) : false;
    });

    const handleToggle = (val: boolean) => {
        setShowMetrics(val);
        localStorage.setItem("showFinancialMetrics", JSON.stringify(val));
        window.dispatchEvent(new Event("storage")); 
    };

    // Estados para la Contraseña Financiera
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [passwordInput, setPasswordInput] = useState("");
    const [verifying, setVerifying] = useState(false);

    const handleDesbloquear = async () => {
        if (!passwordInput.trim()) return;
        setVerifying(true);
        try {
            const res = await GymApi.verifyFinancePassword(passwordInput);
            if (res.success) {
                setIsUnlocked(true);
                setPasswordInput("");
            }
        } catch (error) {
            showError("Contraseña incorrecta");
        } finally {
            setVerifying(false);
        }
    };

    // Formateadores
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency', currency: 'ARS', minimumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('es-AR', {
            day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
        });
    };

    const handleExportPDF = async () => {
        const input = document.getElementById("export-charts");
        if (!input) return;
        
        try {
            const html2canvas = (await import("html2canvas")).default;
            const { jsPDF } = await import("jspdf");

            // Extraer textos
            const metricMonthly = document.getElementById("metric-monthly")?.innerText || "$0";
            const metricAnnual = document.getElementById("metric-annual")?.innerText || "$0";
            const metricPreferred = document.getElementById("metric-preferred")?.innerText || "N/A";

            // Fechas
            const date = new Date();
            const month = date.toLocaleString('es-AR', { month: 'long' });
            const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
            const year = date.getFullYear();

            // Fondo oscuro para el canvas de graficos
            const originalBg = input.style.backgroundColor;
            input.style.backgroundColor = "#111827"; 

            const canvas = await html2canvas(input, {
                scale: 2,
                useCORS: true,
                backgroundColor: "#111827"
            });
            
            input.style.backgroundColor = originalBg;

            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            
            // --- DIBUJAR TEXTOS NATIVOS ---
            pdf.setFillColor(17, 24, 39); // #111827 Fondo
            pdf.rect(0, 0, pdfWidth, pdf.internal.pageSize.getHeight(), 'F');
            
            pdf.setTextColor(255, 255, 255);
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(22);
            pdf.text("Reporte Financiero", 15, 20);
            
            let y = 40;
            const drawMetric = (label: string, value: string) => {
                pdf.setFontSize(10);
                pdf.setFont("helvetica", "normal");
                pdf.setTextColor(156, 163, 175);
                pdf.text(label, 15, y);
                pdf.setFontSize(16);
                pdf.setTextColor(255, 255, 255);
                pdf.setFont("helvetica", "bold");
                pdf.text(value, 15, y + 7);
                y += 20;
            };

            drawMetric(`Ingresos Mensuales (${capitalizedMonth})`, metricMonthly);
            drawMetric(`Ingresos Anuales (${year})`, metricAnnual);
            drawMetric(`Método de Pago Preferido`, metricPreferred);

            // --- DIBUJAR GRÁFICOS ---
            const imgData = canvas.toDataURL("image/png");
            const imgWidth = pdfWidth - 30; // 15mm padding
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            pdf.setFontSize(14);
            pdf.setTextColor(255, 255, 255);
            pdf.setFont("helvetica", "bold");
            y += 5;
            pdf.text("Gráficos de Rendimiento", 15, y);
            
            y += 10;
            pdf.addImage(imgData, 'PNG', 15, y, imgWidth, imgHeight);
            
            pdf.save("metricas_financieras.pdf");
        } catch (error) {
            showError("Error al generar el PDF");
        }
    };

    return (
        <div className={AppStyles.principalContainer}>
            <div className="w-full max-w-7xl mx-auto space-y-8">

                <div className="space-y-8 pb-4">
                    
                    {/* --- HEADER SUPERIOR --- */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-3">
                            <DollarSign className="w-8 h-8 text-green-400" />
                            <div>
                                <h1 className={AppStyles.title}>Gestión Financiera</h1>
                                <p className={AppStyles.subtitle}>Control de ingresos, egresos y devoluciones.</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {isUnlocked && showMetrics && (
                                <button 
                                    onClick={handleExportPDF}
                                    title="Exportar a PDF"
                                    className={`${AppStyles.btnExportRed} h-[42px] px-4`}
                                >
                                    <FileText className="w-4 h-4" />
                                    <p className="pl-2 text-sm font-bold">PDF</p>
                                </button>
                            )}
                            <div className="flex items-center gap-4 bg-gray-800/40 p-2 pr-4 rounded-xl border border-white/5 backdrop-blur-sm h-[42px]">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-2">Métricas</span>
                                <ToggleSwitch checked={showMetrics} onChange={handleToggle} />
                            </div>
                        </div>
                    </div>

                {/* --- DASHBOARD METRICAS --- */}
                {showMetrics && (
                    <div className="animate-fade-in-down">
                        {!isUnlocked ? (
                            <UnlockSection 
                                passwordInput={passwordInput}
                                setPasswordInput={setPasswordInput}
                                handleDesbloquear={handleDesbloquear}
                                verifying={verifying}
                            />
                        ) : (
                            <FinancialDashboard />
                        )}
                    </div>
                )}
                </div>

                {/* --- SECCIÓN DEVOLUCIONES / BÚSQUEDA --- */}
                <div className={`${AppStyles.glassCard} border-l-4 border-l-yellow-500 overflow-visible relative z-20`}>
                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                        <Search className="w-5 h-5 text-white" /> Gestión de Devoluciones
                    </h3>
                    <p className="text-gray-400 text-sm mb-4">
                        Busca un alumno para filtrar su historial y realizar devoluciones o correcciones de pagos.
                    </p>
                    
                    <div className="relative max-w-xl">
                        <div className="flex gap-2 relative">
                            <div className="relative flex-grow">
                                <Input 
                                    value={busqueda}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    onFocus={() => busqueda && setMostrarSugerencias(true)}
                                    placeholder="Buscar alumno por nombre..."
                                    className={AppStyles.inputDark}
                                />
                                
                                {/* Sugerencias Dropdown CORREGIDO */}
                                {mostrarSugerencias && sugerencias.length > 0 && (
                                    <ul className={`${AppStyles.suggestionsList} absolute w-full left-0 top-full mt-1 z-50 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl max-h-60 ${AppStyles.customScrollbar}`}>
                                        {sugerencias.map((alumno: any) => (
                                            <li key={alumno.id} onClick={() => handleSelectAlumno(alumno)} className={AppStyles.suggestionItem}>
                                                <div className={AppStyles.avatarSmall}>{alumno.nombre.charAt(0)}</div>
                                                <span className="text-gray-200">{alumno.nombre} {alumno.apellido}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            
                            {alumnoSeleccionado && (
                                <Button onClick={handleClearSearch} className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 whitespace-nowrap">
                                    ✕ Limpiar
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- LISTADO DE MOVIMIENTOS --- */}
                {/* z-10 para que quede POR DEBAJO del buscador desplegado */}
                <div className="relative z-10"> 
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`h-8 w-1 rounded-full ${alumnoSeleccionado ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                        <h3 className="text-xl font-bold text-white">
                            {alumnoSeleccionado 
                                ? `Movimientos de ${alumnoSeleccionado.nombre} ${alumnoSeleccionado.apellido}`
                                : `Últimos 10 Movimientos Generales`
                            }
                        </h3>
                    </div>

                    {loadingPagos ? (
                        <div className="text-center py-20 animate-pulse text-gray-400">Cargando transacciones...</div>
                    ) : pagos.length === 0 ? (
                        <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/5">
                            <p className="text-gray-500">No se encontraron movimientos.</p>
                        </div>
                    ) : (
                        <Card className={`${AppStyles.glassCard} p-0 overflow-hidden`}>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-black/20 text-gray-400 text-xs font-bold uppercase tracking-wider border-b border-white/5">
                                            <th className="px-6 py-4">Fecha</th>
                                            <th className="px-6 py-4">Alumno</th>
                                            <th className="px-6 py-4">Concepto</th>
                                            <th className="px-6 py-4 text-center">Método</th>
                                            <th className="px-6 py-4 text-right">Monto</th>
                                            <th className="px-6 py-4 text-center">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 text-sm">
                                        {pagos.map((pago) => {
                                            const esNegativo = pago.monto < 0;
                                            return (
                                                <tr key={pago.id} className="hover:bg-white/5 transition-colors group">
                                                    <td className="px-6 py-4 font-mono text-gray-400">{formatDate(pago.fechaPago)}</td>
                                                    <td className="px-6 py-4 font-bold text-gray-200">
                                                        {pago.usuario.nombre} {pago.usuario.apellido}
                                                        <span className="block text-xs font-normal text-gray-500">{pago.usuario.dni}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-300">
                                                        {pago.concepto}
                                                        {pago.plan && <span className="ml-2 text-xs bg-gray-700 px-1.5 py-0.5 rounded text-gray-400">{pago.plan.nombre}</span>}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="px-2 py-1 rounded border bg-blue-500/10 text-blue-400 border-blue-500/30 text-xs font-bold">
                                                            {pago.metodoPago}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-mono text-base">
                                                        <span className={esNegativo ? "text-red-400" : "text-green-400"}>
                                                            {formatCurrency(pago.monto)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        {!esNegativo && (
                                                            <button 
                                                                onClick={() => handleDevolucion(pago)}
                                                                className="text-gray-500 hover:text-red-400 transition-colors p-2 rounded hover:bg-red-500/10"
                                                                title="Realizar Devolución"
                                                            >
                                                                <Undo2 className="inline w-4 h-4 mr-1" /> Revertir
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}
                </div>

            </div>
        </div>
    );
};