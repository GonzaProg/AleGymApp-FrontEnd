import { useEffect, useState } from "react";
import { PagosApi, type MetricsByTypeDTO, type BreakdownItem } from "../../API/Pagos/PagosApi";
import { AppStyles } from "../../Styles/AppStyles";

export const MetricsByType = () => {
    const [data, setData] = useState<MetricsByTypeDTO | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const result = await PagosApi.getMetricsByType();
                setData(result);
            } catch (error) {
                console.error("Error loading detailed metrics");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) return <div className="text-center py-8 text-gray-500 animate-pulse text-xs">Cargando desglose...</div>;
    if (!data) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 animate-fade-in">
            {/* MES ACTUAL */}
            <CategoryChart title="📅 Ingresos este Mes" items={data.desgloseMensual} />
            
            {/* ANUAL */}
            <CategoryChart title="📈 Acumulado Anual" items={data.desgloseAnual} />
        </div>
    );
};

// --- SUBCOMPONENTE DE TARJETA CON GRÁFICO ---
const CategoryChart = ({ title, items }: { title: string, items: BreakdownItem[] }) => {
    // Calcular Total
    const totalGeneral = items.reduce((acc, item) => acc + item.total, 0);

    return (
        <div className={`${AppStyles.glassCard} p-6 border border-white/5 flex flex-col h-full`}>
            <h4 className="text-gray-300 font-bold mb-6 text-sm uppercase tracking-wider border-b border-white/10 pb-2">
                {title}
            </h4>
            
            {items.length === 0 ? (
                <div className="flex-1 flex items-center justify-center min-h-[200px]">
                    <p className="text-gray-600 text-xs italic">Sin datos registrados.</p>
                </div>
            ) : (
                <div className="flex flex-col sm:flex-row items-center gap-8">
                    
                    {/* 1. GRÁFICO DE TORTA (SVG Puro) */}
                    <div className="relative w-40 h-40 flex-shrink-0">
                        <PieChart items={items} total={totalGeneral} />
                        {/* Texto central (opcional, para convertirlo en Donut si quisieras) */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="text-xs font-bold text-white/20">Total</span>
                        </div>
                    </div>

                    {/* 2. LISTA DE BARRAS (Leyenda) */}
                    <div className="flex-1 w-full space-y-4">
                        {items.map((item) => {
                            const porcentaje = totalGeneral > 0 ? (item.total / totalGeneral) * 100 : 0;
                            const colors = getColorByType(item.categoria);

                            return (
                                <div key={item.categoria}>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="font-bold text-white flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${colors.bg}`}></span>
                                            {item.categoria}
                                        </span>
                                        <span className="text-gray-400 font-mono">
                                            ${item.total.toLocaleString()} ({porcentaje.toFixed(1)}%)
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-700/50 rounded-full h-1.5 overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full ${colors.bg} transition-all duration-1000 ease-out`}
                                            style={{ width: `${porcentaje}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

// --- COMPONENTE PIE CHART SVG OPTIMIZADO ---
// --- COMPONENTE PIE CHART SVG OPTIMIZADO ---
const PieChart = ({ items, total }: { items: BreakdownItem[], total: number }) => {
    let accumulatedPercent = 0;

    // MATEMÁTICA CORREGIDA:
    // Radio (r) = 15.9155 (para que la circunferencia sea 100 exacto)
    // Stroke (Grosor) = 10
    // Radio Externo = r + (stroke / 2) = 15.9 + 5 = 20.9
    // Diámetro Total = 20.9 * 2 = 41.8
    // -> Usamos viewBox="0 0 42 42" para que quepa perfecto y no se vea cuadrado.

    return (
        <svg viewBox="0 0 42 42" className="w-full h-full" style={{ transform: 'rotate(-90deg)' }}>
            {items.map((item, index) => {
                const percent = total > 0 ? (item.total / total) * 100 : 0;
                const colors = getColorByType(item.categoria);
                
                const circle = (
                    <circle
                        key={index}
                        r="15.9155"
                        cx="21"  // Centro ajustado al nuevo viewBox (42/2)
                        cy="21"  // Centro ajustado al nuevo viewBox (42/2)
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth="8" // Ajusté a 8 para que se vea más elegante (Donut)
                        strokeDasharray={`${percent} 100`}
                        strokeDashoffset={-accumulatedPercent}
                        className={`${colors.text} transition-all duration-1000 hover:opacity-80`}
                    />
                );

                accumulatedPercent += percent;
                return circle;
            })}
        </svg>
    );
};
// --- HELPER DE COLORES (Bg para barras, Text para SVG) ---
const getColorByType = (type: string) => {
    switch (type) {
        case 'Gym': return {bg: 'bg-green-500', text: "text-green-500"};
        case 'Natacion': return {bg: 'bg-blue-500', text: "text-blue-500"};
        default: return {bg: 'bg-green-500', text: "text-green-500"};
    }
};