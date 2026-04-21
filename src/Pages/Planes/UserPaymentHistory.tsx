import { useState, useEffect } from "react";
import { PagosApi, type PagoDTO } from "../../API/Pagos/PagosApi";
import { ArrowLeft, Clock, CalendarDays, CheckCircle } from "lucide-react";

export const UserPaymentHistory = ({ alumnoSeleccionado, onBack }: any) => {
    const [pagos, setPagos] = useState<PagoDTO[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPagos = async () => {
            try {
                const data = await PagosApi.getHistorialAnualPorUsuario(alumnoSeleccionado.id);
                setPagos(data);
            } catch (e) {
                console.error("Error cargando historial anual", e);
            } finally {
                setLoading(false);
            }
        };
        fetchPagos();
    }, [alumnoSeleccionado.id]);

    // Calcular estado del último plan (Activo o Inactivo)
    const planesActivos = alumnoSeleccionado.userPlans?.filter((p: any) => p.activo);
    const ultimoPlanActivo = planesActivos?.length > 0 ? planesActivos[0] : null;
    const ultimoPlanInactivo = alumnoSeleccionado.userPlans
        ?.filter((p: any) => !p.activo)
        ?.sort((a: any, b: any) => new Date(b.fechaVencimiento).getTime() - new Date(a.fechaVencimiento).getTime())[0];

    // Priorizamos mostrar el activo si es que lo hay
    const planData = ultimoPlanActivo || ultimoPlanInactivo;
    const isVigente = ultimoPlanActivo && new Date(ultimoPlanActivo.fechaVencimiento) >= new Date();

    // Agrupar pagos por mes (0 a 11)
    const paymentsByMonth = pagos.reduce((acc: any, pago) => {
        const d = new Date(pago.fechaPago);
        const m = d.getMonth();
        if (!acc[m]) acc[m] = [];
        acc[m].push(pago);
        return acc;
    }, {});

    const currentYear = new Date().getFullYear();
    const meses = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    return (
        <div className="animate-fade-in relative text-white">
            <div className="bg-[#1e1628]/95 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl relative z-10 w-full mb-8">
                
                {/* Cabecera general y Volver */}
                <div className="flex items-center gap-4 mb-8">
                    <button 
                        onClick={onBack} 
                        className="bg-white/5 hover:bg-white/10 p-3 rounded-full transition-colors flex items-center justify-center border border-white/10"
                        title="Volver a Renovación"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-300" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Historial de Pagos <span className="text-green-400">Anual</span></h2>
                        <div className="flex items-center gap-2 mt-1">
                            <p className="text-gray-400 font-medium text-base">Año {currentYear} • {alumnoSeleccionado.nombre} {alumnoSeleccionado.apellido}</p>
                            
                        </div>
                        <div className="mt-2">
                            {alumnoSeleccionado.fechaCreacion && (
                                <span className="text-blue-400 font-medium bg-blue-500/10 px-2.5 py-1 rounded border border-blue-500/20 inline-flex items-center gap-1.5 shadow-sm">
                                    <Clock className="w-3.4 h-3.5 opacity-70" />
                                    <span className="text-base tracking-tight">Su primer día fue el: {new Date(alumnoSeleccionado.fechaCreacion).toLocaleDateString()}</span>
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Resumen del Último Plan */}
                {planData && (
                    <div className={`mb-8 flex flex-col md:flex-row items-center justify-between p-5 rounded-xl border backdrop-blur shadow-inner ${isVigente ? 'border-green-500/50 bg-green-900/10' : 'border-red-500/50 bg-red-900/10'}`}>
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl shadow-lg border ${isVigente ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-500 border-red-500/30'}`}>
                                {isVigente ? <CheckCircle className="w-7 h-7" /> : <Clock className="w-7 h-7" />}
                            </div>
                            <div>
                                <span className="text-[10px] uppercase font-black tracking-widest opacity-80 mb-1 block mix-blend-plus-lighter">
                                    {isVigente ? 'Estado Actual: Vigente' : 'Estado Actual: Vencido'}
                                </span>
                                <h3 className="text-xl font-bold text-white">{planData.plan.nombre}</h3>
                            </div>
                        </div>
                        <div className="text-right mt-4 md:mt-0 p-3 bg-black/20 rounded-lg border border-white/5">
                            <span className="block text-xs text-gray-400 uppercase font-semibold">Vencimiento:</span>
                            <span className={`block font-mono text-lg font-bold ${isVigente ? 'text-green-300' : 'text-red-300'}`}>
                                {new Date(planData.fechaVencimiento).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                )}

                {/* Tabla de Meses (Vista Excel) */}
                <div className="bg-[#120d1a] border border-white/5 rounded-xl overflow-hidden ring-1 ring-white/5">
                    {loading ? (
                        <div className="p-16 flex flex-col items-center justify-center text-center">
                            <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4 shadow-[0_0_15px_rgba(34,197,94,0.5)]"></div>
                            <span className="text-gray-400 animate-pulse font-medium">Buscando pagos del año...</span>
                        </div>
                    ) : (
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-[#0a070e] text-white">
                                    <tr>
                                        <th className="p-4 border-b border-white/10 w-[20%] text-xs font-bold tracking-wider uppercase text-gray-400">Mes</th>
                                        <th className="p-4 border-b border-white/10 w-[30%] text-xs font-bold tracking-wider uppercase text-gray-400">Fecha de Pago</th>
                                        <th className="p-4 border-b border-white/10 w-[30%] text-xs font-bold tracking-wider uppercase text-gray-400">Membresía</th>
                                        <th className="p-4 border-b border-white/10 w-[20%] text-right text-xs font-bold tracking-wider uppercase text-gray-400">Monto Unitario</th>
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
                                                        <td className="p-3">
                                                            {pagosDelMes.map((p: any) => (
                                                                <div key={p.id} className="text-gray-300 font-mono py-1">
                                                                    {new Date(p.fechaPago).toLocaleDateString()}
                                                                </div>
                                                            ))}
                                                        </td>
                                                        <td className="p-3">
                                                            {pagosDelMes.map((p: any) => (
                                                                <div key={p.id} className="py-1">
                                                                    <span className="text-green-400 font-medium bg-green-500/10 px-2.5 py-0.5 rounded border border-green-500/20">
                                                                        {p.plan?.nombre || "Membresía"}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </td>
                                                        <td className="p-3 text-right">
                                                            {pagosDelMes.map((p: any) => (
                                                                <div key={p.id} className="py-1">
                                                                    <span className="text-white font-mono font-medium px-2 py-0.5 rounded border border-white/10 bg-white/5 opacity-90 inline-block shadow-sm">
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
