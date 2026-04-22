import { useState, useEffect } from "react";
import { PagosApi, type MatrizAnualDTO } from "../../API/Pagos/PagosApi";
import { ArrowLeft, Table, Calendar } from "lucide-react";

interface YearlyPaymentMatrixProps {
    onBack: () => void;
    onSelectUserForHistory: (user: any) => void;
}

export const YearlyPaymentMatrix = ({ onBack, onSelectUserForHistory }: YearlyPaymentMatrixProps) => {
    const currentYear = new Date().getFullYear();
    const [year, setYear] = useState(Math.max(2026, currentYear));
    const [matrix, setMatrix] = useState<MatrizAnualDTO[]>([]);
    const [loading, setLoading] = useState(true);

    // Generar años disponibles desde 2026 hasta el año actual
    const availableYears = Array.from(
        { length: Math.max(0, currentYear - 2026 + 1) },
        (_, i) => 2026 + i
    ).reverse(); // El más reciente primero

    if (availableYears.length === 0) availableYears.push(2026);

    const meses = [
        "Ene", "Feb", "Mar", "Abr", "May", "Jun",
        "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
    ];

    useEffect(() => {
        const fetchMatrix = async () => {
            setLoading(true);
            try {
                const data = await PagosApi.getMatrizAnualMembresias(year);
                setMatrix(data);
            } catch (error) {
                console.error("Error fetching matrix", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMatrix();
    }, [year]);

    return (
        <div className="w-full max-w-[95%] mx-auto space-y-6 animate-fade-in">
            {/* Header */}
            <div className="bg-gray-800/40 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
                
                <div className="flex items-center gap-4">
                    <button 
                        onClick={onBack}
                        className="p-2 hover:bg-white/10 rounded-xl transition-colors text-gray-400 hover:text-white border border-white/5"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Table className="text-blue-400" size={24} />
                            Matriz de Pagos Anual
                        </h2>
                        <p className="text-gray-400 text-sm">Registro de membresías por mes</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-black/30 p-2 rounded-2xl border border-white/5">
                    <Calendar className="text-gray-500 ml-2" size={18} />
                    <select 
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        className="bg-transparent text-white border-none focus:ring-0 font-bold pr-8"
                    >
                        {availableYears.map(y => (
                            <option key={y} value={y} className="bg-gray-900">{y}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Matrix Table */}
            <div className="bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                {loading ? (
                    <div className="p-20 flex flex-col items-center justify-center space-y-4">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-gray-400 font-medium">Generando matriz de pagos...</p>
                    </div>
                ) : matrix.length === 0 ? (
                    <div className="p-20 text-center text-gray-500">
                        No se encontraron pagos de membresía para el año {year}.
                    </div>
                ) : (
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-black/40 border-b border-white/10">
                                    <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider sticky left-0 bg-[#1a1225] z-10 min-w-[200px]">
                                        Nombre y Apellido
                                    </th>
                                    {meses.map(mes => (
                                        <th key={mes} className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center border-l border-white/5">
                                            {mes}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {matrix.map(({ user, pagos }) => (
                                    <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td 
                                            className="p-4 sticky left-0 bg-[#1a1225]/80 backdrop-blur-md group-hover:bg-[#24192f] transition-colors cursor-pointer z-10"
                                            onClick={() => onSelectUserForHistory(user)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs">
                                                    {user.nombre[0]}
                                                </div>
                                                <div>
                                                    <p className="text-white font-bold text-sm group-hover:text-blue-400 transition-colors">
                                                        {user.apellido} {user.nombre}
                                                    </p>
                                                    <p className="text-gray-500 text-[10px] font-mono">DNI: {user.dni}</p>
                                                </div>
                                            </div>
                                        </td>
                                        {meses.map((_, index) => {
                                            // Filtrar pagos que caen en este mes
                                            const pagoMes = pagos.find(p => new Date(p.fechaPago).getMonth() === index);
                                            return (
                                                <td key={index} className="p-2 text-center border-l border-white/5">
                                                    {pagoMes ? (
                                                        <div className="inline-block bg-green-500/20 text-green-400 text-[10px] font-bold px-2 py-1 rounded-md border border-green-500/30">
                                                            {new Date(pagoMes.fechaPago).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' })}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-800 text-xs">--</span>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
