import { useState, useMemo } from "react";
import { useStudentDietas } from "../../Hooks/Dietas/useStudentDietas";
import { AppStyles } from "../../Styles/AppStyles";
import { Flame, Beef, Droplet, Wheat, Plus, ArrowLeft, ChevronLeft, ChevronRight, X, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../Components/UI/Button";
import { Input } from "../../Components/UI/Input";
import { showError, showSuccess } from "../../Helpers/Alerts";

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
    const [view, setView] = useState<'HOY' | 'HISTORIAL' | 'DIETA'>('HOY');
    const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const [selectedDayPlan, setSelectedDayPlan] = useState('Lunes');
    const [selectedDayHist, setSelectedDayHist] = useState('Lunes');
    
    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [addTipo, setAddTipo] = useState("");
    const [addDescripcion, setAddDescripcion] = useState("");
    const [addCals, setAddCals] = useState<number | "">("");
    const [addProts, setAddProts] = useState<number | "">("");
    const [addCarbs, setAddCarbs] = useState<number | "">("");
    const [addGrasas, setAddGrasas] = useState<number | "">("");
    // Historial agrupado por semana real
    const [weekOffset, setWeekOffset] = useState(0); // 0 = esta semana, 1 = semana pasada, etc.
    
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

    const handleSaveComida = async () => {
        if (!addDescripcion.trim()) return showError("Agrega una descripción");
        if (
            (addCals !== '' && addCals < 0) ||
            (addProts !== '' && addProts < 0) ||
            (addCarbs !== '' && addCarbs < 0) ||
            (addGrasas !== '' && addGrasas < 0)
        ) {
            return showError("No se pueden ingresar valores negativos en los macros.");
        }
        
        const success = await registrarComida({
            tipo: addTipo,
            descripcion: addDescripcion,
            calorias: addCals || 0,
            proteinas: addProts || 0,
            carbohidratos: addCarbs || 0,
            grasas: addGrasas || 0
        });
        
        if (success) {
            showSuccess("Comida guardada");
            setShowAddModal(false);
            setAddDescripcion(""); setAddCals(""); setAddProts(""); setAddCarbs(""); setAddGrasas("");
        }
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
                        <p className="text-white font-bold">{Number(value).toFixed(title === 'Agua' ? 2 : 0)} <span className="text-xs text-gray-500">{unit}</span></p>
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
                {['HOY', 'HISTORIAL', 'DIETA'].map(v => (
                    <button
                        key={v}
                        onClick={() => setView(v as any)}
                        className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
                            view === v ? 'bg-orange-500 text-white' : 'bg-white/5 text-gray-400'
                        }`}
                    >
                        {v === 'HOY' ? 'Mi Día' : v === 'HISTORIAL' ? 'Historial' : 'Dieta Asignada'}
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
                                            <h4 className="font-bold text-white mt-1 whitespace-pre-line">{comida.descripcion}</h4>
                                            <div className="flex gap-3 mt-2">
                                                {comida.calorias > 0 && <span className="text-xs text-gray-500"><b className="text-white">{comida.calorias}</b> kcal</span>}
                                                {comida.proteinas > 0 && <span className="text-xs text-gray-500"><b className="text-white">{comida.proteinas}</b>g P</span>}
                                                {comida.carbohidratos > 0 && <span className="text-xs text-gray-500"><b className="text-white">{comida.carbohidratos}</b>g C</span>}
                                                {comida.grasas > 0 && <span className="text-xs text-gray-500"><b className="text-white">{comida.grasas}</b>g G</span>}
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
                    <div className="flex items-center justify-between bg-black/30 p-3 rounded-2xl border border-white/5">
                        <button 
                            disabled={weekOffset >= 3}
                            onClick={() => setWeekOffset(prev => prev + 1)}
                            className="p-2 text-gray-400 disabled:opacity-30 hover:text-white transition-colors"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <span className="font-bold text-orange-400">
                            {weekOffset === 0 ? "Esta Semana" : `Hace ${weekOffset} semana${weekOffset > 1 ? 's' : ''}`}
                        </span>
                        <button 
                            disabled={weekOffset === 0} 
                            onClick={() => setWeekOffset(prev => prev - 1)}
                            className="p-2 text-gray-400 disabled:opacity-30 hover:text-white transition-colors"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </div>

                    <div 
                        className="flex gap-2 overflow-x-auto scrollbar-none py-2 border-b border-white/5 mb-4"
                        onTouchStart={(e) => e.stopPropagation()}
                        onTouchMove={(e) => e.stopPropagation()}
                    >
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
                        <p className="text-gray-500 text-center py-10 bg-white/5 rounded-2xl">No hay registros para este día.</p>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-white/5 rounded-2xl border border-white/5 p-4 transition-colors">
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="font-bold text-white flex items-center gap-2">
                                        {new Date(`${historialDiaSeleccionado.fecha}T12:00:00Z`).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })}
                                    </h4>
                                </div>
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
                                        <Flame className="w-4 h-4 mx-auto text-green-400 mb-1" />
                                        <p className="text-white font-bold">{Math.round(historialDiaSeleccionado.totalGrasas)}g</p>
                                    </div>
                                    <div className="col-span-2 col-start-4 bg-black/40 p-2 rounded-xl">
                                        <Droplet className="w-4 h-4 mx-auto text-blue-400 mb-1" />
                                        <p className="text-white font-bold">{Number(historialDiaSeleccionado.totalAgua || 0).toFixed(2)}L</p>
                                    </div>
                                </div>

                                {historialDiaSeleccionado.comidasConsumidas && historialDiaSeleccionado.comidasConsumidas.length > 0 ? (
                                    <div className="pt-4 border-t border-white/10 space-y-3 animate-fade-in">
                                        <h5 className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Comidas registradas</h5>
                                        {historialDiaSeleccionado.comidasConsumidas.map((comida: any) => (
                                            <div key={comida.id} className="bg-black/30 p-3 rounded-xl border border-white/5">
                                                <span className="text-orange-400 text-[10px] font-bold uppercase tracking-wider">{comida.tipo}</span>
                                                <h4 className="font-bold text-gray-200 mt-1 whitespace-pre-line text-sm">{comida.descripcion}</h4>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {comida.calorias > 0 && <span className="text-[10px] text-gray-500"><b className="text-white">{comida.calorias}</b> kcal</span>}
                                                    {comida.proteinas > 0 && <span className="text-[10px] text-gray-500"><b className="text-white">{comida.proteinas}</b>g P</span>}
                                                    {comida.carbohidratos > 0 && <span className="text-[10px] text-gray-500"><b className="text-white">{comida.carbohidratos}</b>g C</span>}
                                                    {comida.grasas > 0 && <span className="text-[10px] text-gray-500"><b className="text-white">{comida.grasas}</b>g G</span>}
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
            )}

            {/* VISTA: DIETA ASIGNADA */}
            {view === 'DIETA' && (
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
                                    <p className="text-gray-500 text-center py-4 bg-white/5 rounded-2xl">No hay comidas sugeridas para este día.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {dietaAsignada.comidas?.filter((c: any) => (c.diaSemana || 'Lunes') === selectedDayPlan).map((c: any) => (
                                            <div key={c.id} className="bg-white/5 border border-white/5 p-4 rounded-2xl animate-fade-in">
                                                <span className="bg-orange-500/30 text-orange-400 text-xs px-2 py-1 rounded-md font-bold uppercase">{c.tipo}</span>
                                                <p className="mt-3 text-white text-sm whitespace-pre-line">{c.alimentos}</p>
                                                
                                                {(c.calorias || c.proteinas || c.carbohidratos || c.grasas) && (
                                                    <div className="mt-4 pt-3 border-t border-white/10 grid grid-cols-2 gap-3 text-xs text-gray-400">
                                                        {c.calorias && <span className="flex items-center gap-1 text-orange-400"><Flame className="w-3 h-3"/> <b>{c.calorias}</b> kcal</span>}
                                                        {c.proteinas && <span className="flex items-center gap-1 text-red-400"><Beef className="w-3 h-3"/> <b>{c.proteinas}</b>g P</span>}
                                                        {c.carbohidratos && <span className="flex items-center gap-1 text-yellow-400"><Wheat className="w-3 h-3"/> <b>{c.carbohidratos}</b>g C</span>}
                                                        {c.grasas && <span className="flex items-center gap-1 text-green-400"><Flame className="w-3 h-3"/> <b>{c.grasas}</b>g G</span>}
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
                                    <option value="Media mañana" />
                                    <option value="Almuerzo" />
                                    <option value="Media tarde" />
                                    <option value="Merienda" />
                                    <option value="Pre-Cena" />
                                    <option value="Cena" />
                                    <option value="Media noche" />
                                </datalist>
                            </div>
                            <div>
                                <label className={AppStyles.label}>¿Qué comiste?</label>
                                <textarea 
                                    placeholder={`Ej: Pollo 200gr\n2 huevos\nPan 50gr`}
                                    value={addDescripcion} 
                                    onChange={(e) => setAddDescripcion(e.target.value)} 
                                    className={`${AppStyles.inputDark} w-full resize-y overflow-hidden`}
                                    rows={Math.max(3, addDescripcion.split('\n').length)}
                                />
                            </div>

                            <div className="pt-4 border-t border-white/10">
                                <label className="text-xs text-orange-400 font-bold mb-2 block uppercase">Macros (Opcional)</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <Input type="number" min="0" placeholder="Kcal" value={addCals} onChange={(e) => setAddCals(e.target.value ? Number(e.target.value) : '')} className={AppStyles.inputDark} />
                                    <Input type="number" min="0" placeholder="Proteínas (g)" value={addProts} onChange={(e) => setAddProts(e.target.value ? Number(e.target.value) : '')} className={AppStyles.inputDark} />
                                    <Input type="number" min="0" placeholder="Carbos (g)" value={addCarbs} onChange={(e) => setAddCarbs(e.target.value ? Number(e.target.value) : '')} className={AppStyles.inputDark} />
                                    <Input type="number" min="0" placeholder="Grasas (g)" value={addGrasas} onChange={(e) => setAddGrasas(e.target.value ? Number(e.target.value) : '')} className={AppStyles.inputDark} />
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
