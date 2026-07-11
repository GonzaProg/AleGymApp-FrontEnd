import { type BreakdownItem } from "../../API/Pagos/PagosApi";
import { AppStyles } from "../../Styles/AppStyles";
import { Calendar, TrendingUp } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface Props {
    desgloseMensual: BreakdownItem[];
    desgloseAnual: BreakdownItem[];
}

export const MetricsByType = ({ desgloseMensual, desgloseAnual }: Props) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 animate-fade-in">
            {/* MES ACTUAL */}
            <CategoryChart title={<span className="flex items-center justify-center gap-2"><Calendar className="w-4 h-4"/> Ingresos este Mes</span>} items={desgloseMensual} />
            
            {/* ANUAL */}
            <CategoryChart title={<span className="flex items-center justify-center gap-2"><TrendingUp className="w-4 h-4"/> Acumulado Anual</span>} items={desgloseAnual} />
        </div>
    );
};

// --- SUBCOMPONENTE DE TARJETA CON GRÁFICO ---
const CategoryChart = ({ title, items }: { title: React.ReactNode, items: BreakdownItem[] }) => {
    // Calcular Total Bruto (Solo ingresos positivos) para el porcentaje
    const totalBruto = items.reduce((acc, item) => item.total > 0 ? acc + item.total : acc, 0);

    const chartData = items
        .filter(item => item.total > 0)
        .map(item => ({
            name: item.categoria,
            value: item.total,
            color: getColorByType(item.categoria).hex
        }));

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
                    
                    {/* 1. GRÁFICO DE TORTA (RECHARTS) */}
                    <div className="relative w-40 h-40 flex-shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={75}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                    formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Total']}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Texto central */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="text-xs font-bold text-white">Total</span>
                        </div>
                    </div>

                    {/* 2. LISTA DE BARRAS (Leyenda) */}
                    <div className="flex-1 w-full space-y-4">
                        {items.map((item) => {
                            // Porcentaje en base a ingresos brutos
                            const porcentajeAbsoluto = totalBruto > 0 ? (Math.abs(item.total) / totalBruto) * 100 : 0;
                            const signo = item.total < 0 ? '-' : '';
                            const colors = getColorByType(item.categoria);

                            return (
                                <div key={item.categoria}>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="font-bold text-white flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${colors.bg}`}></span>
                                            {item.categoria}
                                        </span>
                                        <span className="text-gray-400 font-mono">
                                            ${item.total.toLocaleString()} ({signo}{porcentajeAbsoluto.toFixed(1)}%)
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-700/50 rounded-full h-1.5 overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full ${colors.bg} transition-all duration-1000 ease-out`}
                                            style={{ width: `${porcentajeAbsoluto}%` }}
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

// --- HELPER DE COLORES (Bg para barras, Text para SVG, Hex para Recharts) ---
const getColorByType = (type: string) => {
    switch (type) {
        case 'Gym': return { bg: 'bg-green-500', text: "text-green-500", hex: "#22c55e" };
        case 'Natacion': return { bg: 'bg-blue-500', text: "text-blue-500", hex: "#3b82f6" };
        case 'Productos': return { bg: 'bg-yellow-500', text: "text-yellow-500", hex: "#eab308" };
        case 'Gastos y Sueldos': return { bg: 'bg-red-500', text: "text-red-500", hex: "#ef4444" };
        case 'Gastos': return { bg: 'bg-red-500', text: "text-red-500", hex: "#ef4444" };
        case 'Pago a Empleados': return { bg: 'bg-red-500', text: "text-red-500", hex: "#ef4444" };
        default: return { bg: 'bg-purple-500', text: "text-purple-500", hex: "#a855f7" };    
    }
};