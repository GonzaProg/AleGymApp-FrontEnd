import { useState } from "react";
import { useFinancialMetrics } from "../../Hooks/Pagos/useFinancialMetrics";
import { FinancialDashboardStyles } from "../../Styles/FinancialDashboardStyles";
import { ToggleSwitch } from "../UI/ToggleSwitch"; 
import { MetricsByType } from "./MetricsByType"; 
import { FinancialCharts } from "./FinancialCharts"; 

export const FinancialDashboard = () => {
    const { metrics, loadingMetrics } = useFinancialMetrics();
    
    // --- LÓGICA DE PERSISTENCIA (LOCAL STORAGE) ---
    const [showDetails, setShowDetails] = useState(() => {
        // 1. Intentamos leer la configuración guardada al iniciar
        const saved = localStorage.getItem("showFinancialDetails");
        return saved !== null ? JSON.parse(saved) : false;
    });

    // 2. Handler que actualiza el estado Y guarda en localStorage
    const handleToggleDetails = (checked: boolean) => {
        setShowDetails(checked);
        localStorage.setItem("showFinancialDetails", JSON.stringify(checked));
    };

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            maximumFractionDigits: 0
        }).format(amount);
    };

    if (loadingMetrics) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 animate-pulse">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-800/50 rounded-2xl border border-white/5"></div>)}
            </div>
        );
    }

    if (!metrics) return null;

    const isPositive = metrics.porcentajeCrecimiento >= 0;

    return (
        <div className="mb-10 mr-28"> 
            
            {/* 1. TARJETAS PRINCIPALES (KPIs) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            
                {/* Ingresos Mes Actual */}
                <div className={FinancialDashboardStyles.cardBaseClass}>
                    <div className={FinancialDashboardStyles.iconBaseClass}>
                        📈
                    </div>
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-green-500 to-green-600"></div>

                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Facturación Mensual</p>
                    <h3 className="text-4xl font-black text-white drop-shadow-md mb-2">
                        {formatMoney(metrics.ingresosMesActual)}
                    </h3>
                    <div className="flex items-center gap-2 text-sm">
                        <span className={`font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                            isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                            {isPositive ? '▲' : '▼'} {Math.abs(metrics.porcentajeCrecimiento)}%
                        </span>
                        <span className="text-gray-500 text-xs">vs mes pasado</span>
                    </div>
                </div>

                {/* Ingresos Anuales */}
                <div className={FinancialDashboardStyles.cardBaseClass}>
                    <div className={FinancialDashboardStyles.iconBaseClass}>
                        🏆
                    </div>
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-pink-600"></div>
                    
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Acumulado Anual</p>
                    <h3 className="text-4xl font-black text-white drop-shadow-md mb-2">
                        {formatMoney(metrics.ingresosAnuales)}
                    </h3>
                    <p className="text-gray-500 text-xs">Total facturado este año</p>
                </div>

                {/* Método Preferido (Anual) */}
                <div className={`${FinancialDashboardStyles.cardBaseClass} md:col-span-2 md:w-[calc(50%-1.25rem)] md:mx-auto`}>
                    <div className={FinancialDashboardStyles.iconBaseClass}>
                        💳
                    </div>
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-600"></div>

                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Medio de Pago (Anual)</p>
                    <h3 className="text-3xl font-black text-white drop-shadow-md mb-1">
                        {metrics.metodoPreferido}
                    </h3>
                    
                    <div className="w-full bg-gray-700/50 rounded-full h-2 mt-3 overflow-hidden">
                        <div 
                            className="bg-gradient-to-r from-blue-800 to-cyan-400 h-full rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]" 
                            style={{ width: `${metrics.metodoPorcentaje}%` }}
                        ></div>
                    </div>
                    <p className="text-purple-300 text-xs mt-1 font-mono text-right">
                        {metrics.metodoPorcentaje}% del volumen
                    </p>
                </div>
            </div>

            {/* 2. GRÁFICOS DE TIEMPO (Lineal y Barras) */}
            {/* Estos siempre se muestran si hay métricas */}
            <FinancialCharts 
                dataAnual={metrics.chartAnual} 
                dataMensual={metrics.chartMensual} 
            />

            {/* 3. BARRA DE CONTROL PARA DETALLES */}
            <div className="mt-8 pt-4 border-t border-white/5 flex flex-col md:flex-row justify-end items-center gap-4">
                <span className="text-xs text-gray-500 uppercase font-bold tracking-widest">
                    Ver desglose por tipos
                </span>
                <ToggleSwitch 
                    checked={showDetails} 
                    onChange={handleToggleDetails} // Usamos el nuevo handler
                />
            </div>

            {/* 4. DESGLOSE POR TIPO (Carga diferida) */}
            {/* Solo se muestra si el switch está activo */}
            {showDetails && (
                <MetricsByType />
            )}

        </div>
    );
};