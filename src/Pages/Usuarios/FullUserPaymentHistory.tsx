import { useState, useEffect } from "react";
import { PagosApi, type PagoDTO } from "../../API/Pagos/PagosApi";
import { ArrowLeft, CalendarDays, Clock, ShoppingBag } from "lucide-react";
import { type AlumnoDTO } from "../../API/Usuarios/UsuarioApi";

export const FullUserPaymentHistory = ({ user, onBack }: { user: AlumnoDTO, onBack: () => void }) => {
    const currentYear = new Date().getFullYear();
    const [pagos, setPagos] = useState<PagoDTO[]>([]);
    const [availableYears, setAvailableYears] = useState<number[]>([]);
    const [selectedYear, setSelectedYear] = useState<number>(currentYear);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchYears = async () => {
            try {
                const years = await PagosApi.getAñosConPagosPorUsuario(user.id);
                setAvailableYears(years.length > 0 ? years : [currentYear]);
                if (years.length > 0 && !years.includes(currentYear)) {
                    setSelectedYear(years[0]); // Select the most recent year if current year has no payments
                }
            } catch (e) {
                console.error("Error cargando años", e);
                setAvailableYears([currentYear]);
            }
        };
        fetchYears();
    }, [user.id]);

    useEffect(() => {
        const fetchPagos = async () => {
            setLoading(true);
            try {
                const data = await PagosApi.getHistorialCompletoPorUsuario(user.id, selectedYear);
                setPagos(data);
            } catch (e) {
                console.error("Error cargando historial", e);
            } finally {
                setLoading(false);
            }
        };
        fetchPagos();
    }, [user.id, selectedYear]);

    // Agrupar pagos por mes (0 a 11)
    const paymentsByMonth = pagos.reduce((acc: any, pago) => {
        const d = new Date(pago.fechaPago);
        const m = d.getMonth();
        if (!acc[m]) acc[m] = [];
        acc[m].push(pago);
        return acc;
    }, {});

    const meses = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    return (
        <div className="w-full max-w-5xl mx-auto mt-14 animate-fade-in text-white relative">
            <div className="bg-[#1e1628]/95 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl relative z-10 w-full mb-8">
                
                {/* Cabecera general y Volver */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-white/10 pb-6">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={onBack} 
                            className="bg-white/5 hover:bg-white/10 p-3 rounded-full transition-colors flex items-center justify-center border border-white/10"
                            title="Volver"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-300" />
                        </button>
                        <div>
                            <h2 className="text-2xl font-bold text-white tracking-tight">Historial Completo</h2>
                            <div className="flex items-center gap-2 mt-2">
                                <p className="text-green-400 font-medium text-2xl">• {user.nombre} {user.apellido}</p>
                            </div>
                            <div className="mt-2">
                                {user.fechaCreacion && (
                                    <span className="text-blue-400 font-medium bg-blue-500/10 px-2.5 py-1 rounded border border-blue-500/20 inline-flex items-center gap-1.5 shadow-sm">
                                        <Clock className="w-3.5 h-3.5 opacity-70" />
                                        <span className="text-base tracking-tight">Ingreso al Gym: {new Date(user.fechaCreacion).toLocaleDateString()}</span>
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    {/* Selector de Año */}
                    <div className="flex flex-col items-start md:items-end mt-4 md:mt-0">
                        <label className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Filtrar por Año</label>
                        <select 
                            value={selectedYear} 
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            className="bg-black/40 border border-white/10 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none font-medium"
                        >
                            {availableYears.map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Tabla de Meses (Vista Excel) */}
                <div className="bg-[#120d1a] border border-white/5 rounded-xl overflow-hidden ring-1 ring-white/5">
                    {loading ? (
                        <div className="p-16 flex flex-col items-center justify-center text-center">
                            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4 shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
                            <span className="text-gray-400 animate-pulse font-medium">Cargando pagos...</span>
                        </div>
                    ) : (
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-[#0a070e] text-white">
                                    <tr>
                                        <th className="p-4 border-b border-white/10 w-[20%] text-xs font-bold tracking-wider uppercase text-gray-400">Mes</th>
                                        <th className="p-4 border-b border-white/10 w-[20%] text-xs font-bold tracking-wider uppercase text-gray-400">Fecha de Pago</th>
                                        <th className="p-4 border-b border-white/10 w-[40%] text-xs font-bold tracking-wider uppercase text-gray-400">Concepto</th>
                                        <th className="p-4 border-b border-white/10 w-[20%] text-right text-xs font-bold tracking-wider uppercase text-gray-400">Monto</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {meses.map((mes, idx) => {
                                        const pagosDelMes = paymentsByMonth[idx] || [];
                                        const tienePagos = pagosDelMes.length > 0;
                                        
                                        return (
                                            <tr key={mes} className={`transition-colors ${tienePagos ? 'hover:bg-white/[0.02]' : ''}`}>
                                                <td className="p-4 font-medium flex items-center gap-3">
                                                    <div className={`p-1.5 rounded-lg border ${tienePagos ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-white/5 border-white/5 text-gray-600'}`}>
                                                        <CalendarDays className="w-4 h-4" />
                                                    </div>
                                                    <span className={tienePagos ? "text-white font-semibold" : "text-gray-600"}>{mes}</span>
                                                </td>
                                                
                                                {tienePagos ? (
                                                    <>
                                                        <td className="p-3 align-middle">
                                                            {pagosDelMes.map((p: any) => (
                                                                <div key={p.id} className="text-gray-300 font-mono h-10 flex items-center">
                                                                    {new Date(p.fechaPago).toLocaleDateString()}
                                                                </div>
                                                            ))}
                                                        </td>
                                                        <td className="p-3 align-middle">
                                                            {pagosDelMes.map((p: any) => {
                                                                const isProduct = !!p.producto;
                                                                return (
                                                                    <div key={p.id} className="h-10 flex items-center">
                                                                        {isProduct ? (
                                                                            <span className="text-orange-400 font-medium bg-orange-500/10 px-2.5 py-1 rounded border border-orange-500/20 inline-flex items-center gap-1.5">
                                                                                <ShoppingBag className="w-3 h-3" />
                                                                                {p.producto?.nombre || "Producto"}
                                                                            </span>
                                                                        ) : (
                                                                            <span className="text-green-400 font-medium bg-green-500/10 px-2.5 py-1 rounded border border-green-500/20">
                                                                                {p.plan?.nombre || "Membresía"}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </td>
                                                        <td className="p-3 text-right align-middle">
                                                            {pagosDelMes.map((p: any) => (
                                                                <div key={p.id} className="h-10 flex items-center justify-end">
                                                                    <span className="text-white font-mono font-medium px-2 py-1 rounded border border-white/10 bg-white/5 opacity-90 inline-block shadow-sm">
                                                                        ${Number(p.monto).toLocaleString()}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </td>
                                                    </>
                                                ) : (
                                                    <>
                                                        <td className="p-4 text-gray-600 italic opacity-50">—</td>
                                                        <td className="p-4 text-gray-600 italic opacity-50">—</td>
                                                        <td className="p-4 text-gray-600 italic opacity-50 text-right">—</td>
                                                    </>
                                                )}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
