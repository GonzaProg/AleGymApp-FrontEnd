import { AppStyles } from "../../Styles/AppStyles";
import { TrendingUp, BarChart3 } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

interface Props {
    dataAnual: number[];
    dataMensual: number[];
}

export const FinancialCharts = ({ dataAnual, dataMensual }: Props) => {
    
    // Cambiamos las inicial ("E", "F", "M", "A"...) por nombres de 3 letras 
    // para evitar que Recharts agrupe o confunda meses con la misma inicial (ej. Abril y Agosto)
    const labelsAnuales = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

    // Validaciones de seguridad para evitar errores con arrays vacíos
    const safeDataAnual = dataAnual?.length === 12 ? dataAnual : Array(12).fill(0);
    const safeDataMensual = dataMensual?.length > 0 ? dataMensual : Array(28).fill(0);

    const formattedDataAnual = safeDataAnual.map((val, i) => ({
        name: labelsAnuales[i],
        value: Math.max(0, val),
        realValue: val // Guardamos el valor real por si se necesita
    }));

    const maxValMensual = Math.max(...safeDataMensual);
    // 5% of max value to guarantee visibility, or 100 if max is 0
    const minVisibleMensual = maxValMensual > 0 ? maxValMensual * 0.05 : 100;

    const formattedDataMensual = safeDataMensual.map((val, i) => ({
        name: i + 1,
        value: val < 0 ? minVisibleMensual : val,
        realValue: val // Guardamos el valor real por si se necesita
    }));

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 animate-fade-in">
            {/* GRÁFICO 1: LINEAL ANUAL */}
            <div className={`${AppStyles.glassCard} p-6 border border-white/5`}>
                <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-2">
                    <h4 className="text-gray-300 font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" /> Evolución Anual
                    </h4>
                    <span className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded">Ene - Dic</span>
                </div>
                <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={formattedDataAnual}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                itemStyle={{ color: '#4ade80' }}
                                labelStyle={{ color: '#fff' }}
                                formatter={(value: any, _name: any, props: any) => {
                                    const realValue = props.payload?.realValue ?? value;
                                    return [`$${Number(realValue).toLocaleString()}`, 'Ingresos'];
                                }}
                            />
                            <Line type="monotone" dataKey="value" stroke="#4ade80" strokeWidth={2} dot={{ r: 3, fill: "#fff" }} activeDot={{ r: 5 }} />
                            <XAxis dataKey="name" stroke="#6b7280" fontSize={10} axisLine={false} tickLine={false} dy={10} interval={0} padding={{ left: 10, right: 10 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* GRÁFICO 2: BARRAS MENSUAL */}
            <div className={`${AppStyles.glassCard} p-6 border border-white/5`}>
                <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-2">
                    <h4 className="text-gray-300 font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" /> Ingresos Diarios (Mes Actual)
                    </h4>
                    <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded">Día a Día</span>
                </div>
                <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={formattedDataMensual}>
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                itemStyle={{ color: '#3b82f6' }}
                                labelStyle={{ color: '#fff' }}
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                formatter={(value: any, _name: any, props: any) => {
                                    const realValue = props.payload?.realValue ?? value;
                                    return [`$${Number(realValue).toLocaleString()}`, 'Ingresos'];
                                }}
                            />
                            <Bar dataKey="value" radius={[2, 2, 0, 0]} opacity={0.8} activeBar={{ opacity: 1 }}>
                                {formattedDataMensual.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.realValue < 0 ? '#ef4444' : '#3b82f6'} />
                                ))}
                            </Bar>
                            <XAxis 
                                dataKey="name" 
                                stroke="#6b7280" 
                                fontSize={10} 
                                axisLine={false} 
                                tickLine={false} 
                                tickFormatter={(value) => value % 2 === 0 ? value : ''} 
                                dy={10} 
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};