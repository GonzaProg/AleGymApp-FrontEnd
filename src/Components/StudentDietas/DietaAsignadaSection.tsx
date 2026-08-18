import { useState } from "react";
import { Info, Flame, Beef, Wheat, Droplet } from "lucide-react";

export const DietaAsignadaSection = ({ dietaAsignada }: { dietaAsignada: any }) => {
    const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const [selectedDayPlan, setSelectedDayPlan] = useState('Lunes');

    return (
        <div className="p-4 animate-fade-in space-y-6">
            {!dietaAsignada ? (
                <div className="text-center py-10 opacity-70">
                    <Info className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                    <p className="text-gray-400">Tu entrenador aún no te ha asignado un plan nutricional.</p>
                </div>
            ) : (
                <>
                    <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-2xl text-orange-400">
                        <h3 className="font-bold text-lg mb-1">{dietaAsignada.nombre}</h3>
                        {dietaAsignada.observaciones && (
                            <p className="text-sm opacity-90 mt-2 whitespace-pre-line">{dietaAsignada.observaciones}</p>
                        )}
                    </div>

                    <div className="flex gap-2 overflow-x-auto scrollbar-none py-2 border-b border-white/5 mb-4 mt-2">
                        {diasSemana.map(dia => (
                            <button
                                key={dia}
                                onClick={() => setSelectedDayPlan(dia)}
                                className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-all ${
                                    selectedDayPlan === dia ? 'bg-orange-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                }`}
                            >
                                {dia}
                            </button>
                        ))}
                    </div>

                    <div>
                        <h4 className="font-bold text-gray-300 mb-3 ml-1">Comidas Sugeridas para el {selectedDayPlan}</h4>
                        {dietaAsignada.comidas?.filter((c: any) => (c.diaSemana || 'Lunes') === selectedDayPlan).length === 0 ? (
                            <p className="text-gray-500 text-center py-4 bg-black/30 rounded-2xl">No hay comidas sugeridas para este día.</p>
                        ) : (
                            <div className="space-y-3">
                                {dietaAsignada.comidas?.filter((c: any) => (c.diaSemana || 'Lunes') === selectedDayPlan).map((c: any) => (
                                    <div key={c.id} className="bg-black/30 border border-white/10 p-4 rounded-2xl animate-fade-in">
                                        <span className="bg-orange-500/30 text-orange-400 text-xs px-2 py-1 rounded-md font-bold uppercase">{c.tipo}</span>
                                        <p className="mt-3 text-white text-base whitespace-pre-line">{c.alimentos}</p>
                                        
                                        {(c.calorias || c.proteinas || c.carbohidratos || c.grasas) && (
                                            <div className="mt-4 pt-3 border-t border-white/10 grid grid-cols-2 gap-3 text-sm text-gray-400">
                                                {c.calorias && <span className="flex items-center gap-1 text-orange-400"><Flame className="w-3 h-3"/> <b>{c.calorias}</b> kcal</span>}
                                                {c.proteinas && <span className="flex items-center gap-1 text-red-400"><Beef className="w-3 h-3"/> <b>{c.proteinas}</b>g P</span>}
                                                {c.carbohidratos && <span className="flex items-center gap-1 text-yellow-400"><Wheat className="w-3 h-3"/> <b>{c.carbohidratos}</b>g C</span>}
                                                {c.grasas && <span className="flex items-center gap-1 text-green-400"><Droplet className="w-3 h-3"/> <b>{c.grasas}</b>g G</span>}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};
