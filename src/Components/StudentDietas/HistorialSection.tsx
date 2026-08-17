import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Flame, Beef, Wheat, Droplet, GlassWater } from "lucide-react";
import { sortComidasByTime } from "../../Helpers/DietasHelper";

export const HistorialSection = ({ historial }: { historial: any[] }) => {
    const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const [selectedDayHist, setSelectedDayHist] = useState('Lunes');
    const [weekOffset, setWeekOffset] = useState(0);

    const getLocalDate = (d: Date) => {
        const formatter = new Intl.DateTimeFormat('en-CA', { 
            timeZone: 'America/Argentina/Buenos_Aires', 
            year: 'numeric', month: '2-digit', day: '2-digit' 
        });
        return formatter.format(d);
    };

    const historialDiaSeleccionado = useMemo(() => {
        const now = new Date();
        const localNowStr = getLocalDate(now);
        const localNow = new Date(`${localNowStr}T12:00:00Z`);
        
        const dayOfWeek = localNow.getUTCDay();
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const thisMonday = new Date(localNow);
        thisMonday.setUTCDate(localNow.getUTCDate() - daysToMonday);
        
        const startOfWeek = new Date(thisMonday);
        startOfWeek.setUTCDate(startOfWeek.getUTCDate() - (weekOffset * 7));
        
        const selectedDayIndex = diasSemana.indexOf(selectedDayHist);
        const targetDate = new Date(startOfWeek);
        targetDate.setUTCDate(startOfWeek.getUTCDate() + selectedDayIndex);
        
        const targetDateStr = targetDate.toISOString().split('T')[0];
        
        return historial.find((h: any) => h.fecha === targetDateStr) || { fecha: targetDateStr, isEmpty: true };
    }, [historial, weekOffset, selectedDayHist, diasSemana]);

    return (
        <div className="p-3 animate-fade-in space-y-4">
            <div className="flex items-center justify-between bg-black/30 p-3 rounded-2xl border border-white/5">
                <button disabled={weekOffset >= 3} onClick={() => setWeekOffset(prev => prev + 1)} className="p-2 text-gray-400 disabled:opacity-30 hover:text-white transition-colors">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <span className="font-bold text-orange-400">
                    {weekOffset === 0 ? "Esta Semana" : `Hace ${weekOffset} semana${weekOffset > 1 ? 's' : ''}`}
                </span>
                <button disabled={weekOffset === 0} onClick={() => setWeekOffset(prev => prev - 1)} className="p-2 text-gray-400 disabled:opacity-30 hover:text-white transition-colors">
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>

            <div className="flex gap-2 overflow-x-auto scrollbar-none py-2 border-b border-white/5 mb-4">
                {diasSemana.map(dia => (
                    <button
                        key={dia}
                        onClick={() => setSelectedDayHist(dia)}
                        className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-all ${
                            selectedDayHist === dia ? 'bg-orange-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                    >
                        {dia}
                    </button>
                ))}
            </div>

            {historialDiaSeleccionado.isEmpty ? (
                <p className="text-gray-500 text-center py-10 bg-black/30 rounded-2xl">No hay registros para este día.</p>
            ) : (
                <div className="space-y-4">
                    <div className="bg-white/5 rounded-2xl border border-white/5 p-3 transition-colors">
                        <h4 className="font-bold text-white flex items-center gap-2 mb-3">
                            {new Date(`${historialDiaSeleccionado.fecha}T12:00:00Z`).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' }) + " " + historialDiaSeleccionado.fecha.split('-')[0]}
                        </h4>
                        <div className="grid grid-cols-8 gap-2 text-center text-xs mb-4">
                            <div className="col-span-2 bg-black/40 p-2 rounded-xl">
                                <Flame className="w-4 h-4 mx-auto text-orange-400 mb-1" />
                                <p className="text-white font-bold">{Math.round(historialDiaSeleccionado.totalCalorias)}</p>
                            </div>
                            <div className="col-span-2 bg-black/40 p-2 rounded-xl">
                                <Beef className="w-4 h-4 mx-auto text-red-400 mb-1" />
                                <p className="text-white font-bold">{Math.round(historialDiaSeleccionado.totalProteinas)}g</p>
                            </div>
                            <div className="col-span-2 bg-black/40 p-2 rounded-xl">
                                <Wheat className="w-4 h-4 mx-auto text-yellow-400 mb-1" />
                                <p className="text-white font-bold">{Math.round(historialDiaSeleccionado.totalCarbohidratos)}g</p>
                            </div>
                            <div className="col-span-2 bg-black/40 p-2 rounded-xl">
                                <Droplet className="w-4 h-4 mx-auto text-green-400 mb-1" />
                                <p className="text-white font-bold">{Math.round(historialDiaSeleccionado.totalGrasas)}g</p>
                            </div>
                            <div className="col-span-2 col-start-4 bg-black/40 p-2 rounded-xl">
                                <GlassWater className="w-4 h-4 mx-auto text-blue-400 mb-1" />
                                <p className="text-white font-bold">{Number(historialDiaSeleccionado.totalAgua || 0).toFixed(2)}L</p>
                            </div>
                        </div>

                        {historialDiaSeleccionado.comidasConsumidas && historialDiaSeleccionado.comidasConsumidas.length > 0 ? (
                            <div className="pt-4 border-t border-white/10 space-y-3 animate-fade-in">
                                <h5 className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Comidas registradas</h5>
                                {[...historialDiaSeleccionado.comidasConsumidas].sort(sortComidasByTime).map((comida: any) => (
                                    <div key={comida.id} className="bg-black/30 p-3 rounded-xl border border-white/5">
                                        <span className="text-orange-400 text-[13px] font-bold uppercase tracking-wider">{comida.tipo}</span>
                                        <h4 className="font-bold text-gray-200 mt-1 whitespace-pre-line text-sm">{comida.descripcion}</h4>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {comida.calorias > 0 && <span className="text-[12px] text-gray-500"><b className="text-white">{comida.calorias}</b> kcal</span>}
                                            {comida.proteinas > 0 && <span className="text-[12px] text-gray-500"><b className="text-white">{comida.proteinas}</b>g P</span>}
                                            {comida.carbohidratos > 0 && <span className="text-[12px] text-gray-500"><b className="text-white">{comida.carbohidratos}</b>g C</span>}
                                            {comida.grasas > 0 && <span className="text-[12px] text-gray-500"><b className="text-white">{comida.grasas}</b>g G</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="pt-4 border-t border-white/10 text-center animate-fade-in">
                                <p className="text-xs text-gray-500">No hay comidas detalladas este día.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
