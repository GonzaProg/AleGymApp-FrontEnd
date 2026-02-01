import { useState, useEffect } from "react";
import { useHistorialPagos } from "../../Hooks/Pagos/useHistorialPagos";
import { AppStyles } from "../../Styles/AppStyles";
import { Card } from "../../Components/UI/Card";
import { FinancialDashboard } from "../../Components/Pagos/FinancialDashboard";
import { ToggleSwitch } from "../../Components/UI/ToggleSwitch";

export const HistorialPagos = () => {
    const { pagos, loading, error } = useHistorialPagos();

    // Estado para la visibilidad del dashboard (persistente)
    const [showMetrics, setShowMetrics] = useState(() => {
        const saved = localStorage.getItem("showFinancialMetrics");
        return saved !== null ? JSON.parse(saved) : false;
    });

    useEffect(() => {
        localStorage.setItem("showFinancialMetrics", JSON.stringify(showMetrics));
    }, [showMetrics]);

    // Formateador de moneda
    const formatCurrency = (amount: number | string) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 0
        }).format(Number(amount));
    };

    // Formateador de fecha
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="w-full h-full flex flex-col pt-6 animate-fade-in px-4 pb-10">
            <div className="w-full max-w-7xl mx-auto">

                {/* --- HEADER --- */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div className="text-left">
                        <div className="flex items-center gap-2">
                            <h1 className={AppStyles.title}>Finanzas</h1>
                            <span className="text-2xl">💰</span>
                        </div>
                        <p className={AppStyles.subtitle}>Resumen financiero y movimientos.</p>
                    </div>

                    {/* CONTROL DE VISIBILIDAD */}
                    <div className="flex items-center gap-4 bg-gray-800/40 p-3 rounded-xl border border-white/5 backdrop-blur-sm shadow-lg">
                        <div className="flex flex-col items-end mr-2">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Métricas</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded border font-bold transition-colors duration-300 ${
                                showMetrics 
                                ? 'bg-green-500/10 text-green-400 border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.2)]' 
                                : 'bg-gray-700/50 text-gray-500 border-blue-700'
                            }`}>
                                {showMetrics ? '● ACTIVO' : '○ OCULTO'}
                            </span>
                        </div>
                        
                        <ToggleSwitch 
                            checked={showMetrics} 
                            onChange={setShowMetrics} 
                        />
                    </div>
                </div>

                {/* --- DASHBOARD FINANCIERO (ANIMADO) --- */}
                {/* Usamos renderizado condicional diferido:
                   Si está activo, se monta y se anima la entrada.
                   Si está inactivo, se desmonta para ahorrar recursos.
                */}
                {showMetrics && (
                    <div className="animate-fade-in-down mb-2">
                        <FinancialDashboard />
                    </div>
                )}

                {/* --- SEPARADOR --- */}
                <div className="flex items-center gap-3 mb-6 mt-2">
                    <div className="h-8 w-1 bg-green-500 rounded-full"></div>
                    <h3 className="text-xl font-bold text-white">Últimos Movimientos</h3>
                    <div className="h-px bg-white/10 flex-grow ml-4"></div>
                </div>

                {/* --- TABLA DE PAGOS --- */}
                {loading ? (
                    <div className="text-center py-20 animate-pulse text-green-500 font-bold">
                        Cargando historial financiero...
                    </div>
                ) : error ? (
                    <div className={AppStyles.errorBox}>
                        <span>🚫</span> {error}
                    </div>
                ) : pagos.length === 0 ? (
                    <div className={`${AppStyles.glassCard} text-center py-16`}>
                        <span className="text-5xl opacity-30 grayscale mb-4 block">🧾</span>
                        <p className="text-gray-400 text-lg">Aún no hay pagos registrados.</p>
                    </div>
                ) : (
                    <Card className={`${AppStyles.glassCard} p-0 overflow-hidden shadow-2xl border-t border-white/10`}> 
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-black/40 text-gray-300 uppercase text-xs font-bold tracking-wider h-12 border-b border-white/10">
                                        <th className="px-6 py-3">Fecha</th>
                                        <th className="px-6 py-3">Alumno</th>
                                        <th className="px-6 py-3">Concepto</th>
                                        <th className="px-6 py-3">Plan</th>
                                        <th className="px-6 py-3">Método</th>
                                        <th className="px-6 py-3 text-right">Monto</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {pagos.map((pago) => (
                                        <tr key={pago.id} className="hover:bg-white/5 transition-colors group">
                                            
                                            {/* Fecha */}
                                            <td className="px-6 py-4 text-gray-400 text-sm font-mono whitespace-nowrap">
                                                {formatDate(pago.fechaPago)}
                                            </td>

                                            {/* Alumno */}
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-white font-bold group-hover:text-green-400 transition-colors">
                                                        {pago.usuario.nombre} {pago.usuario.apellido}
                                                    </span>
                                                    <span className="text-xs text-gray-500">{pago.usuario.dni}</span>
                                                </div>
                                            </td>

                                            {/* Concepto */}
                                            <td className="px-6 py-4 text-gray-300 text-sm">
                                                {pago.concepto}
                                            </td>

                                            {/* Plan */}
                                            <td className="px-6 py-4">
                                                {pago.plan ? (
                                                    <span className="bg-gray-800 text-gray-300 px-2 py-1 rounded text-xs border border-white/10 font-medium">
                                                        {pago.plan.nombre}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-600 text-xs italic">-</span>
                                                )}
                                            </td>

                                            {/* Método de Pago */}
                                            <td className="px-6 py-4">
                                                <span className={`text-xs font-bold px-2 py-1 rounded border ${
                                                    pago.metodoPago === 'Efectivo' 
                                                        ? 'bg-green-500/10 text-green-400 border-green-500/30' 
                                                        : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                                                }`}>
                                                    {pago.metodoPago}
                                                </span>
                                            </td>

                                            {/* Monto */}
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-lg font-bold text-green-400 drop-shadow-sm font-mono tracking-tight">
                                                    + {formatCurrency(pago.monto)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
};