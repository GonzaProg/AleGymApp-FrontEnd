import { useState, useMemo } from "react";
import { useStudentDietas } from "../../Hooks/Dietas/useStudentDietas";
import { AppStyles } from "../../Styles/AppStyles";
import { Flame, Beef, Droplet, Wheat, Plus, ArrowLeft, ChevronLeft, ChevronRight, X, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../Components/UI/Button";
import { Input } from "../../Components/UI/Input";

export const StudentDietas = () => {
    const { 
        dietaAsignada, 
        registroHoy, 
        historial, 
        loadingDietas, 
        registrarComida, 
        registrarAgua, 
        borrarComida 
    } = useStudentDietas();
    
    const navigate = useNavigate();
    const [view, setView] = useState<'HOY' | 'HISTORIAL' | 'PLAN'>('HOY');
    
    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [addTipo, setAddTipo] = useState("");
    const [addNombre, setAddNombre] = useState("");
    const [addCantidad, setAddCantidad] = useState("");
    const [addCals, setAddCals] = useState<number | "">("");
    const [addProts, setAddProts] = useState<number | "">("");
    const [addCarbs, setAddCarbs] = useState<number | "">("");
    const [addGrasas, setAddGrasas] = useState<number | "">("");

    // Agrupación de Historial por semanas (Lógica simple, agrupando de a 7 días)
    const [weekOffset, setWeekOffset] = useState(0); // 0 = esta semana, 1 = semana pasada, etc.
    
    const { historyWeeks, currentWeekIndex } = useMemo(() => {
        // Ordenamos el historial de más reciente a más viejo
        const sortedHist = [...historial].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
        
        // Agrupamos en bloques de 7 (Semanas)
        const weeks = [];
        for (let i = 0; i < sortedHist.length; i += 7) {
            weeks.push(sortedHist.slice(i, i + 7));
        }
        
        return { 
            historyWeeks: weeks,
            currentWeekIndex: weekOffset
        };
    }, [historial, weekOffset]);

    const handleSaveComida = async () => {
        if (!addNombre || !addCantidad) return alert("Nombre y cantidad son obligatorios");
        
        await registrarComida({
            tipo: addTipo,
            nombre: addNombre,
            cantidad: addCantidad,
            calorias: addCals || 0,
            proteinas: addProts || 0,
            carbohidratos: addCarbs || 0,
            grasas: addGrasas || 0
        });
        
        setShowAddModal(false);
        // Reset form
        setAddNombre(""); setAddCantidad(""); setAddCals(""); setAddProts(""); setAddCarbs(""); setAddGrasas("");
    };

    if (loadingDietas && !registroHoy) {
        return <div className="p-8 text-center text-white">Cargando tu información nutricional...</div>;
    }

    const MetaMacro = ({ icon: Icon, color, title, value, max, unit }: any) => {
        const percentage = max ? Math.min((value / max) * 100, 100) : 0;
        return (
            <div className="bg-white/5 rounded-xl p-3 border border-white/5 flex items-center gap-3">
                <div className={`p-2 rounded-lg ${color.bg}`}>
                    <Icon className={`w-5 h-5 ${color.text}`} />
                </div>
                <div className="flex-1">
                    <p className="text-gray-400 text-xs font-semibold uppercase">{title}</p>
                    <div className="flex justify-between items-end">
                        <p className="text-white font-bold">{Number(value).toFixed(1)} <span className="text-xs text-gray-500">{unit}</span></p>
                        {max && <p className="text-gray-500 text-xs">/ {max} {unit}</p>}
                    </div>
                    {max > 0 && (
                        <div className="w-full h-1.5 bg-black/50 rounded-full mt-2 overflow-hidden">
                            <div className={`h-full ${color.bgSolid} transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-900 pb-24 text-white">
            {/* Header Módulo */}
            <div className="sticky top-0 z-20 bg-[#121212]/90 backdrop-blur-lg border-b border-white/10 px-4 py-4 flex items-center gap-3">
                <button onClick={() => navigate('/home')} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-bold">Mi Nutrición</h1>
            </div>

            {/* Selector de Vistas */}
            <div className="flex gap-2 p-4 overflow-x-auto scrollbar-none border-b border-white/5">
                {['HOY', 'HISTORIAL', 'PLAN'].map(v => (
                    <button
                        key={v}
                        onClick={() => setView(v as any)}
                        className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
                            view === v ? 'bg-orange-500 text-white' : 'bg-white/5 text-gray-400'
                        }`}
                    >
                        {v === 'HOY' ? 'Mi Día' : v === 'HISTORIAL' ? 'Historial' : 'Plan Asignado'}
                    </button>
                ))}
            </div>

            {/* VISTA: HOY */}
            {view === 'HOY' && (
                <div className="p-4 space-y-6 animate-fade-in">
                    
                    {/* Resumen de Macros */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                            <MetaMacro 
                                icon={Flame} color={{ bg: 'bg-orange-500/20', text: 'text-orange-400', bgSolid: 'bg-orange-500' }} 
                                title="Calorías" value={registroHoy?.totalCalorias || 0} max={dietaAsignada?.caloriasDiarias} unit="kcal" 
                            />
                        </div>
                        <MetaMacro icon={Beef} color={{ bg: 'bg-red-500/20', text: 'text-red-400', bgSolid: 'bg-red-500' }} title="Proteínas" value={registroHoy?.totalProteinas || 0} max={dietaAsignada?.proteinasDiarias} unit="g" />
                        <MetaMacro icon={Wheat} color={{ bg: 'bg-yellow-500/20', text: 'text-yellow-400', bgSolid: 'bg-yellow-500' }} title="Carbos" value={registroHoy?.totalCarbohidratos || 0} max={dietaAsignada?.carbohidratosDiarios} unit="g" />
                        <MetaMacro icon={Flame} color={{ bg: 'bg-green-500/20', text: 'text-green-400', bgSolid: 'bg-green-500' }} title="Grasas" value={registroHoy?.totalGrasas || 0} max={dietaAsignada?.grasasDiarias} unit="g" />
                        <MetaMacro icon={Droplet} color={{ bg: 'bg-blue-500/20', text: 'text-blue-400', bgSolid: 'bg-blue-500' }} title="Agua" value={registroHoy?.totalAgua || 0} max={dietaAsignada?.litrosAguaDiarios} unit="L" />
                    </div>

                    {/* Botones de acción rápida */}
                    <div className="flex gap-3">
                        <Button onClick={() => setShowAddModal(true)} className="flex-1 bg-orange-500 text-white font-bold py-3 hover:bg-orange-600">
                            <Plus className="w-5 h-5 mr-2" /> Agregar Comida
                        </Button>
                        <Button onClick={() => registrarAgua(0.25)} className="flex-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30">
                            <Droplet className="w-5 h-5 mr-2" /> + 250ml
                        </Button>
                    </div>

                    {/* Comidas del Día */}
                    <div>
                        <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-gray-200">
                            Registro de Hoy
                        </h3>
                        {(!registroHoy?.comidasConsumidas || registroHoy.comidasConsumidas.length === 0) ? (
                            <div className="bg-black/30 p-6 rounded-2xl border border-white/5 text-center">
                                <p className="text-gray-500 text-sm">Aún no registraste comidas hoy.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {registroHoy.comidasConsumidas.map((comida: any) => (
                                    <div key={comida.id} className="bg-white/5 p-4 rounded-2xl border border-white/5 flex justify-between items-center relative overflow-hidden">
                                        <div className="z-10 relative flex-1">
                                            <span className="text-orange-400 text-xs font-bold uppercase tracking-wider">{comida.tipo}</span>
                                            <h4 className="font-bold text-white mt-1">{comida.nombre}</h4>
                                            <p className="text-gray-400 text-sm">{comida.cantidad}</p>
                                            <div className="flex gap-3 mt-2">
                                                {comida.calorias > 0 && <span className="text-xs text-gray-500"><b className="text-white">{comida.calorias}</b> kcal</span>}
                                                {comida.proteinas > 0 && <span className="text-xs text-gray-500"><b className="text-white">{comida.proteinas}</b>g P</span>}
                                                {comida.carbohidratos > 0 && <span className="text-xs text-gray-500"><b className="text-white">{comida.carbohidratos}</b>g C</span>}
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => borrarComida(comida.id)}
                                            className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors z-10"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* VISTA: HISTORIAL */}
            {view === 'HISTORIAL' && (
                <div className="p-4 animate-fade-in space-y-4">
                    {historyWeeks.length === 0 ? (
                        <p className="text-gray-500 text-center py-10">No hay historial disponible aún.</p>
                    ) : (
                        <>
                            <div className="flex items-center justify-between bg-black/30 p-3 rounded-2xl border border-white/5">
                                <button 
                                    disabled={currentWeekIndex >= historyWeeks.length - 1} 
                                    onClick={() => setWeekOffset(prev => prev + 1)}
                                    className="p-2 text-gray-400 disabled:opacity-30"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <span className="font-bold text-orange-400">
                                    {currentWeekIndex === 0 ? "Esta Semana" : `Hace ${currentWeekIndex} semana${currentWeekIndex > 1 ? 's' : ''}`}
                                </span>
                                <button 
                                    disabled={currentWeekIndex === 0} 
                                    onClick={() => setWeekOffset(prev => prev - 1)}
                                    className="p-2 text-gray-400 disabled:opacity-30"
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {historyWeeks[currentWeekIndex]?.map((dia: any) => (
                                    <div key={dia.id} className="bg-white/5 rounded-2xl border border-white/5 p-4">
                                        <div className="flex justify-between items-center mb-3">
                                            <h4 className="font-bold text-white">{new Date(dia.fecha).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })}</h4>
                                        </div>
                                        <div className="grid grid-cols-4 gap-2 text-center text-xs">
                                            <div className="bg-black/40 p-2 rounded-xl">
                                                <Flame className="w-4 h-4 mx-auto text-orange-400 mb-1" />
                                                <p className="text-white font-bold">{Math.round(dia.totalCalorias)}</p>
                                            </div>
                                            <div className="bg-black/40 p-2 rounded-xl">
                                                <Beef className="w-4 h-4 mx-auto text-red-400 mb-1" />
                                                <p className="text-white font-bold">{Math.round(dia.totalProteinas)}g</p>
                                            </div>
                                            <div className="bg-black/40 p-2 rounded-xl">
                                                <Wheat className="w-4 h-4 mx-auto text-yellow-400 mb-1" />
                                                <p className="text-white font-bold">{Math.round(dia.totalCarbohidratos)}g</p>
                                            </div>
                                            <div className="bg-black/40 p-2 rounded-xl">
                                                <Droplet className="w-4 h-4 mx-auto text-blue-400 mb-1" />
                                                <p className="text-white font-bold">{dia.totalAgua.toFixed(1)}L</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* VISTA: PLAN ASIGNADO */}
            {view === 'PLAN' && (
                <div className="p-4 animate-fade-in space-y-6">
                    {!dietaAsignada ? (
                        <div className="text-center py-10 opacity-70">
                            <Info className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                            <p className="text-gray-400">Tu entrenador aún no te ha asignado un plan nutricional estructurado.</p>
                        </div>
                    ) : (
                        <>
                            <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-2xl text-orange-400">
                                <h3 className="font-bold text-lg mb-1">{dietaAsignada.nombre}</h3>
                                {dietaAsignada.observaciones && (
                                    <p className="text-sm opacity-90 mt-2 whitespace-pre-line">{dietaAsignada.observaciones}</p>
                                )}
                            </div>

                            <div>
                                <h4 className="font-bold text-gray-300 mb-3 ml-1">Comidas Sugeridas</h4>
                                <div className="space-y-3">
                                    {dietaAsignada.comidas?.map((c: any) => (
                                        <div key={c.id} className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                                            <span className="bg-white/10 text-white text-xs px-2 py-1 rounded-md font-bold uppercase">{c.tipo}</span>
                                            <p className="mt-3 text-white text-sm whitespace-pre-line">{c.alimentos}</p>
                                            
                                            {(c.calorias || c.proteinas) && (
                                                <div className="mt-4 pt-3 border-t border-white/10 flex gap-4 text-xs text-gray-400">
                                                    {c.calorias && <span><b>{c.calorias}</b> kcal</span>}
                                                    {c.proteinas && <span><b>{c.proteinas}</b>g P</span>}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}


            {/* Modal: Agregar Comida */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center animate-fade-in">
                    <div className="bg-[#1a1a1a] w-full sm:w-96 p-6 rounded-t-3xl sm:rounded-3xl animate-slide-up sm:animate-fade-in">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">Registrar Alimento</h3>
                            <button onClick={() => setShowAddModal(false)} className="p-2 bg-white/5 rounded-full"><X className="w-5 h-5" /></button>
                        </div>
                        
                        <div className="space-y-4 max-h-[70vh] overflow-y-auto scrollbar-none pb-4">
                            <div>
                                <label className={AppStyles.label}>Momento del día</label>
                                <Input value={addTipo} onChange={(e) => setAddTipo(e.target.value)} className={AppStyles.inputDark} list="tipos-comida-mobile" />
                                <datalist id="tipos-comida-mobile">
                                    <option value="Desayuno" />
                                    <option value="Almuerzo" />
                                    <option value="Merienda" />
                                    <option value="Cena" />
                                </datalist>
                            </div>
                            <div>
                                <label className={AppStyles.label}>¿Qué comiste?</label>
                                <Input placeholder="Ej: Pechuga de pollo, 2 huevos..." value={addNombre} onChange={(e) => setAddNombre(e.target.value)} className={AppStyles.inputDark} />
                            </div>
                            <div>
                                <label className={AppStyles.label}>Cantidad</label>
                                <Input placeholder="Ej: 200g, 1 porción..." value={addCantidad} onChange={(e) => setAddCantidad(e.target.value)} className={AppStyles.inputDark} />
                            </div>

                            <div className="pt-4 border-t border-white/10">
                                <label className="text-xs text-orange-400 font-bold mb-2 block uppercase">Macros (Opcional)</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <Input type="number" placeholder="Kcal" value={addCals} onChange={(e) => setAddCals(e.target.value ? Number(e.target.value) : '')} className={AppStyles.inputDark} />
                                    <Input type="number" placeholder="Proteínas (g)" value={addProts} onChange={(e) => setAddProts(e.target.value ? Number(e.target.value) : '')} className={AppStyles.inputDark} />
                                    <Input type="number" placeholder="Carbos (g)" value={addCarbs} onChange={(e) => setAddCarbs(e.target.value ? Number(e.target.value) : '')} className={AppStyles.inputDark} />
                                    <Input type="number" placeholder="Grasas (g)" value={addGrasas} onChange={(e) => setAddGrasas(e.target.value ? Number(e.target.value) : '')} className={AppStyles.inputDark} />
                                </div>
                            </div>

                            <Button onClick={handleSaveComida} className="w-full bg-orange-500 hover:bg-orange-600 font-bold py-4 mt-6">
                                Guardar Registro
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
