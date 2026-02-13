import { AppStyles } from "../../Styles/AppStyles";

interface Props {
    dataAnual: number[];
    dataMensual: number[];
}

export const FinancialCharts = ({ dataAnual, dataMensual }: Props) => {
    
    const labelsAnuales = ["E", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

    // Validaciones de seguridad para evitar errores con arrays vacíos
    const safeDataAnual = dataAnual?.length === 12 ? dataAnual : Array(12).fill(0);
    const safeDataMensual = dataMensual?.length > 0 ? dataMensual : Array(28).fill(0);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 animate-fade-in">
            {/* GRÁFICO 1: LINEAL ANUAL */}
            <div className={`${AppStyles.glassCard} p-6 border border-white/5`}>
                <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-2">
                    <h4 className="text-gray-300 font-bold text-sm uppercase tracking-wider">
                        📈 Evolución Anual
                    </h4>
                    <span className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded">Ene - Dic</span>
                </div>
                <div className="h-48 w-full">
                    <LineChart data={safeDataAnual} labels={labelsAnuales} />
                </div>
            </div>

            {/* GRÁFICO 2: BARRAS MENSUAL */}
            <div className={`${AppStyles.glassCard} p-6 border border-white/5`}>
                <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-2">
                    <h4 className="text-gray-300 font-bold text-sm uppercase tracking-wider">
                        📊 Ingresos Diarios (Mes Actual)
                    </h4>
                    <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded">Día a Día</span>
                </div>
                <div className="h-48 w-full">
                    <BarChart data={safeDataMensual} />
                </div>
            </div>
        </div>
    );
};

// --- LINE CHART (Igual que antes) ---
const LineChart = ({ data, labels }: { data: number[], labels: string[] }) => {
    const max = Math.max(...data) || 1;
    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 100 - ((val / max) * 80); 
        return `${x},${y}`;
    }).join(" ");
    const fillPath = `${points} 100,100 0,100`;

    return (
        <div className="relative w-full h-full flex flex-col justify-end">
            <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                <defs>
                    <linearGradient id="gradientLine" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#4ade80" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#4ade80" stopOpacity="0" />
                    </linearGradient>
                </defs>
                <line x1="0" y1="25" x2="100" y2="25" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                <line x1="0" y1="75" x2="100" y2="75" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                <polygon points={fillPath} fill="url(#gradientLine)" />
                <polyline fill="none" stroke="#4ade80" strokeWidth="2" points={points} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                {data.map((val, i) => {
                    const x = (i / (data.length - 1)) * 100;
                    const y = 100 - ((val / max) * 80);
                    return <circle key={i} cx={x} cy={y} r="1.5" fill="#fff" className="hover:r-3 transition-all" />;
                })}
            </svg>
            <div className="flex justify-between text-[10px] text-gray-500 mt-2 font-mono">
                {labels.map((l, i) => <span key={i}>{l}</span>)}
            </div>
        </div>
    );
};

// --- BAR CHART (MODIFICADO: FUENTES MÁS GRANDES) ---
const BarChart = ({ data }: { data: number[] }) => {
    const max = Math.max(...data) || 1;

    return (
        <div className="relative w-full h-full flex flex-col justify-end">
            {/* Aumentamos el viewBox en Y a 120 para dar más espacio abajo */}
            <svg 
                viewBox={`0 0 ${data.length * 10} 120`} 
                className="w-full h-full overflow-visible" 
                preserveAspectRatio="none"
            >
                {data.map((val, i) => {
                    const barHeight = (val / max) * 90;
                    const finalHeight = barHeight === 0 ? 0.5 : barHeight;
                    const dia = i + 1;

                    return (
                        <g key={i} className="group">
                            {/* Barra (Base en 100) */}
                            <rect 
                                x={i * 10 + 2} 
                                y={100 - finalHeight}
                                width="6" 
                                height={finalHeight} 
                                className="fill-blue-500/50 hover:fill-blue-400 transition-all duration-300" 
                                rx="1"
                            />
                            
                            {/* Etiqueta Eje X (Días Pares) - FUENTE AGRANDADA */}
                            {dia % 2 === 0 && (
                                <text
                                    x={i * 10 + 5}
                                    y={117} // Bajamos un poco la posición
                                    textAnchor="middle"
                                    // Cambiamos fontSize de 4 a 7 y la clase Tailwind a text-[7px]
                                    className="fill-gray-500 text-[7px] font-mono"
                                    fontSize="7"
                                >
                                    {dia}
                                </text>
                            )}

                            {/* Tooltip con valor (También agrandado ligeramente) */}
                            {val > 0 && (
                                <text 
                                    x={i * 10 + 5} 
                                    y={100 - finalHeight - 3} 
                                    textAnchor="middle" 
                                    fill="white" 
                                    fontSize="5" // Agrandado de 4 a 5 para mejor lectura
                                    className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none font-bold"
                                >
                                    ${(val >= 1000 ? (val/1000).toFixed(1) + 'k' : val)}
                                </text>
                            )}
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};