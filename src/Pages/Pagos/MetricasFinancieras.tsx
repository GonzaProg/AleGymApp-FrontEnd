import { useState } from "react";
import { useFinancialManager } from "../../Hooks/Pagos/useFinancialManager"; 
import { AppStyles } from "../../Styles/AppStyles";
import { Card } from "../../Components/UI/Card";
import { Input } from "../../Components/UI/Input";
import { Button } from "../../Components/UI/Button";
import { FinancialDashboard } from "../../Components/Pagos/FinancialDashboard";
import { ToggleSwitch } from "../../Components/UI/ToggleSwitch";

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

    return (
        <div className={AppStyles.principalContainer}>
            <div className="w-full max-w-7xl mx-auto space-y-8">

                {/* --- HEADER SUPERIOR --- */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className={AppStyles.title}>Gestión Financiera</h1>
                            <span className="text-2xl">💰</span>
                        </div>
                        <p className={AppStyles.subtitle}>Control de ingresos, egresos y devoluciones.</p>
                    </div>

                    <div className="flex items-center gap-4 bg-gray-800/40 p-2 pr-4 rounded-xl border border-white/5 backdrop-blur-sm">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-2">Métricas</span>
                        <ToggleSwitch checked={showMetrics} onChange={handleToggle} />
                    </div>
                </div>

                {/* --- DASHBOARD METRICAS --- */}
                {showMetrics && (
                    <div className="animate-fade-in-down">
                        <FinancialDashboard />
                    </div>
                )}

                {/* --- SECCIÓN DEVOLUCIONES / BÚSQUEDA --- */}
                <div className={`${AppStyles.glassCard} border-l-4 border-l-yellow-500 overflow-visible relative z-20`}>
                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                        <span>🔍</span> Gestión de Devoluciones
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
                                    placeholder="🔎 Buscar alumno por nombre..."
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
                                                        <span className="px-2 py-1 rounded border border-white/10 bg-white/5 text-xs text-gray-400">
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
                                                                ↩️ Revertir
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