import { useState, useMemo, useEffect } from "react";
import { useStudentDietas } from "../../Hooks/Dietas/useStudentDietas";
import { AppStyles } from "../../Styles/AppStyles";
import { Flame, Beef, Droplet, Wheat, Plus, ArrowLeft, ChevronLeft, ChevronRight, X, Info, Edit2, Trash2, List } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../Components/UI/Button";
import { Input } from "../../Components/UI/Input";
import { showError, showSuccess, showConfirmDelete } from "../../Helpers/Alerts";


const ORDEN_COMIDAS = ["Desayuno", "Media mañana", "Almuerzo", "Media tarde", "Merienda", "Pre-Cena", "Cena", "Media noche"];
const sortComidasByTime = (a: any, b: any) => {
    let indexA = ORDEN_COMIDAS.indexOf(a.tipo);
    let indexB = ORDEN_COMIDAS.indexOf(b.tipo);
    if (indexA === -1) indexA = 99;
    if (indexB === -1) indexB = 99;
    return indexA - indexB;
};

export const StudentDietas = () => {
    const { 
        dietaAsignada, 
        registroHoy, 
        historial, 
        comidasPredefinidas,
        loadingDietas, 
        registrarComida, 
        registrarAgua, 
        borrarComida,
        crearPredefinida,
        actualizarPredefinida,
        eliminarPredefinida
    } = useStudentDietas();
    
    const navigate = useNavigate();
    const [view, setView] = useState<'HOY' | 'HISTORIAL' | 'DIETA'>('HOY');
    const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const [selectedDayPlan, setSelectedDayPlan] = useState('Lunes');
    const [selectedDayHist, setSelectedDayHist] = useState('Lunes');
    
    // Modal states para Registro de Comida
    const [showAddModal, setShowAddModal] = useState(false);
    const [addTipo, setAddTipo] = useState("");
    const [addNombre, setAddNombre] = useState("");
    const [addCantidad, setAddCantidad] = useState("");
    const [addCals, setAddCals] = useState<number | "">("");
    const [addProts, setAddProts] = useState<number | "">("");
    const [addCarbs, setAddCarbs] = useState<number | "">("");
    const [addGrasas, setAddGrasas] = useState<number | "">("");
    const [cart, setCart] = useState<any[]>([]);

    // Modal states para Comidas Predefinidas
    const [showPredefModal, setShowPredefModal] = useState(false);
    const [editingPredef, setEditingPredef] = useState<any>(null);
    const [predefNombre, setPredefNombre] = useState("");
    const [predefCantidad, setPredefCantidad] = useState("");
    const [predefCals, setPredefCals] = useState<number | "">("");
    const [predefProts, setPredefProts] = useState<number | "">("");
    const [predefCarbs, setPredefCarbs] = useState<number | "">("");
    const [predefGrasas, setPredefGrasas] = useState<number | "">("");

    const [weekOffset, setWeekOffset] = useState(0); 
    
    // Bloquear scroll de fondo cuando hay un modal abierto
    useEffect(() => {
        if (showAddModal || showPredefModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [showAddModal, showPredefModal]);
    
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

    // LÓGICA DE CARRITO
    const handleAddToCart = () => {
        if (!addNombre.trim()) return showError("Ingresa el nombre de la comida");
        if (!addCantidad.trim()) return showError("Ingresa la cantidad");
        
        const item = {
            idTemp: Date.now(),
            tipo: addTipo,
            nombre: addNombre,
            cantidad: addCantidad,
            calorias: addCals || 0,
            proteinas: addProts || 0,
            carbohidratos: addCarbs || 0,
            grasas: addGrasas || 0
        };
        setCart([...cart, item]);
        
        // Reset form inputs
        setAddNombre(""); setAddCantidad(""); setAddCals(""); setAddProts(""); setAddCarbs(""); setAddGrasas("");
    };

    const handleRemoveFromCart = (idTemp: number) => {
        setCart(cart.filter(item => item.idTemp !== idTemp));
    };

    const handleSaveRegistro = async () => {
        if (cart.length === 0) return showError("Agrega al menos un alimento a la lista");
        
        const descripcionCombinada = cart.map(c => `${c.nombre} ${c.cantidad}`).join('\n');
        
        const totalCals = cart.reduce((sum, c) => sum + (c.calorias || 0), 0);
        const totalProts = cart.reduce((sum, c) => sum + (c.proteinas || 0), 0);
        const totalCarbs = cart.reduce((sum, c) => sum + (c.carbohidratos || 0), 0);
        const totalGrasas = cart.reduce((sum, c) => sum + (c.grasas || 0), 0);

        const success = await registrarComida({
            tipo: addTipo,
            descripcion: descripcionCombinada,
            calorias: totalCals,
            proteinas: totalProts,
            carbohidratos: totalCarbs,
            grasas: totalGrasas
        });
        
        if (success) {
            showSuccess("Registro guardado");
            setShowAddModal(false);
            setCart([]);
            setAddTipo("");
        }
    };

    const totalCartMacros = useMemo(() => {
        return cart.reduce((acc, curr) => ({
            calorias: acc.calorias + (curr.calorias || 0),
            proteinas: acc.proteinas + (curr.proteinas || 0),
            carbohidratos: acc.carbohidratos + (curr.carbohidratos || 0),
            grasas: acc.grasas + (curr.grasas || 0),
        }), { calorias: 0, proteinas: 0, carbohidratos: 0, grasas: 0 });
    }, [cart]);

    const handleSelectPredefinida = (p: any) => {
        setAddNombre(p.nombre);
        setAddCantidad(p.cantidad);
        setAddCals(p.calorias || "");
        setAddProts(p.proteinas || "");
        setAddCarbs(p.carbohidratos || "");
        setAddGrasas(p.grasas || "");
    };

    // LÓGICA PREDEFINIDAS
    const handleSavePredef = async () => {
        if (!predefNombre.trim() || !predefCantidad.trim()) return showError("Nombre y cantidad son obligatorios");

        const data = {
            nombre: predefNombre,
            cantidad: predefCantidad,
            calorias: predefCals || 0,
            proteinas: predefProts || 0,
            carbohidratos: predefCarbs || 0,
            grasas: predefGrasas || 0
        };

        let success;
        if (editingPredef) {
            success = await actualizarPredefinida(editingPredef.id, data);
        } else {
            success = await crearPredefinida(data);
        }

        if (success) {
            showSuccess("Comida predefinida guardada");
            resetPredefForm();
        }
    };

    const handleDeletePredef = async (id: number) => {
        const confirmed = await showConfirmDelete("¿Eliminar esta comida de tu lista?", "Esta accion no se puede deshacer");
        if (confirmed) {
            await eliminarPredefinida(id);
        }
    };

    const resetPredefForm = () => {
        setEditingPredef(null);
        setPredefNombre(""); setPredefCantidad(""); setPredefCals(""); setPredefProts(""); setPredefCarbs(""); setPredefGrasas("");
    };

    const openEditPredef = (p: any) => {
        setEditingPredef(p);
        setPredefNombre(p.nombre);
        setPredefCantidad(p.cantidad);
        setPredefCals(p.calorias);
        setPredefProts(p.proteinas);
        setPredefCarbs(p.carbohidratos);
        setPredefGrasas(p.grasas);
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
            <div className="sticky top-0 z-20 bg-[#121212]/90 backdrop-blur-lg border-b border-white/10 px-4 py-4 flex items-center gap-3">
                <button onClick={() => navigate('/home')} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-bold">Mi Nutrición</h1>
            </div>

            <div className="flex gap-2 p-4 overflow-x-auto scrollbar-none border-b border-white/5">
                {['HOY', 'HISTORIAL', 'DIETA'].map(v => (
                    <button
                        key={v}
                        onClick={() => setView(v as any)}
                        className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
                            view === v ? 'bg-orange-500 text-white' : 'bg-white/10 text-gray-400'
                        }`}
                    >
                        {v === 'HOY' ? 'Mi Día' : v === 'HISTORIAL' ? 'Historial' : 'Dieta Asignada'}
                    </button>
                ))}
            </div>

            {/* VISTA: HOY */}
            {view === 'HOY' && (
                <div className="p-4 space-y-6 animate-fade-in">
                    
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

                    <div className="flex flex-col gap-3">
                        <div className="flex gap-3">
                            <Button onClick={() => setShowAddModal(true)} className="flex-1 bg-orange-500 text-white font-bold py-3 hover:bg-orange-600">
                                <Plus className="w-5 h-5 mr-2" /> Agregar Comida
                            </Button>
                            <Button onClick={() => registrarAgua(0.25)} className="flex-none bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 px-4">
                                <Droplet className="w-5 h-5" /> + 250ml
                            </Button>
                        </div>
                        <button onClick={() => setShowPredefModal(true)} className="text-sm font-bold text-orange-400 bg-orange-500/10 hover:bg-orange-500/20 py-2 rounded-xl flex items-center justify-center transition-colors">
                            <List className="w-4 h-4 mr-2" /> Mis Comidas
                        </button>
                    </div>

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
                                {[...registroHoy.comidasConsumidas].sort(sortComidasByTime).map((comida: any) => (
                                    <div key={comida.id} className="bg-black/30 p-4 rounded-2xl border border-white/5 flex justify-between items-center relative overflow-hidden">
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
                                        {[...historialDiaSeleccionado.comidasConsumidas].sort(sortComidasByTime).map((comida: any) => (
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

            {/* VISTA: DIETA ASIGNADA (SIN CAMBIOS) */}
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
                                    <p className="text-gray-500 text-center py-4 bg-black/30 rounded-2xl">No hay comidas sugeridas para este día.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {dietaAsignada.comidas?.filter((c: any) => (c.diaSemana || 'Lunes') === selectedDayPlan).map((c: any) => (
                                            <div key={c.id} className="bg-black/30 border border-white/10 p-4 rounded-2xl animate-fade-in">
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


            {/* Modal: Agregar Comida (Con Carrito) */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center animate-fade-in">
                    <div className="bg-[#1a1a1a] w-full sm:w-[450px] p-6 rounded-t-3xl sm:rounded-3xl flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center mb-4 flex-shrink-0">
                            <h3 className="text-xl font-bold">Registrar Comidas</h3>
                            <button onClick={() => setShowAddModal(false)} className="p-2 bg-white/5 rounded-full"><X className="w-5 h-5" /></button>
                        </div>
                        
                        <div className="overflow-y-auto scrollbar-none flex-1 pb-4">
                            {!addTipo ? (
                                <div className="space-y-3">
                                    <h4 className="text-gray-400 text-sm font-bold uppercase mb-2">Selecciona el momento</h4>
                                    {ORDEN_COMIDAS.map(tipo => (
                                        <button 
                                            key={tipo}
                                            onClick={() => setAddTipo(tipo)}
                                            className="w-full text-left p-4 rounded-2xl border border-white/10 hover:border-orange-500/50 hover:bg-orange-500/10 transition-all font-bold"
                                        >
                                            {tipo}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center bg-orange-500/20 p-3 rounded-xl border border-orange-500/30">
                                        <span className="font-bold text-orange-400">{addTipo}</span>
                                        <button onClick={() => setAddTipo("")} className="text-xs text-orange-300 underline">Cambiar</button>
                                    </div>

                                    {/* Zona de Carrito */}
                                    {cart.length > 0 && (
                                        <div className="bg-black/40 p-4 rounded-2xl border border-white/10 space-y-3">
                                            <h4 className="text-xs text-gray-400 font-bold uppercase">Comidas a registrar</h4>
                                            {cart.map(c => (
                                                <div key={c.idTemp} className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                                                    <div>
                                                        <p className="font-bold text-sm">{c.nombre} <span className="text-gray-500 font-normal">({c.cantidad})</span></p>
                                                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                                                            {c.calorias > 0 && <span className="flex items-center gap-1 text-[10px] text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded"><Flame className="w-3 h-3"/> {c.calorias}</span>}
                                                            {c.proteinas > 0 && <span className="flex items-center gap-1 text-[10px] text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded"><Beef className="w-3 h-3"/> {c.proteinas}g</span>}
                                                            {c.carbohidratos > 0 && <span className="flex items-center gap-1 text-[10px] text-yellow-400 bg-yellow-500/10 px-1.5 py-0.5 rounded"><Wheat className="w-3 h-3"/> {c.carbohidratos}g</span>}
                                                            {c.grasas > 0 && <span className="flex items-center gap-1 text-[10px] text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded"><Flame className="w-3 h-3"/> {c.grasas}g</span>}
                                                        </div>
                                                    </div>
                                                    <button onClick={() => handleRemoveFromCart(c.idTemp)} className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                            
                                            <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
                                                <span className="text-gray-400 font-bold text-xs uppercase tracking-wider">Totales de la lista</span>
                                                <div className="flex flex-wrap gap-2">
                                                    <span className="flex items-center gap-1 text-xs text-orange-400 bg-orange-500/10 px-2 py-1 rounded font-bold"><Flame className="w-3 h-3"/> {totalCartMacros.calorias}</span>
                                                    <span className="flex items-center gap-1 text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded font-bold"><Beef className="w-3 h-3"/> {totalCartMacros.proteinas}g</span>
                                                    <span className="flex items-center gap-1 text-xs text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded font-bold"><Wheat className="w-3 h-3"/> {totalCartMacros.carbohidratos}g</span>
                                                    <span className="flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded font-bold"><Flame className="w-3 h-3"/> {totalCartMacros.grasas}g</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Formulario de Agregar Item */}
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-4">
                                        <h4 className="text-sm font-bold text-gray-300">Añadir Alimento</h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="col-span-2">
                                                <Input placeholder="Nombre (Ej: Pollo)" value={addNombre} onChange={(e) => setAddNombre(e.target.value)} className={AppStyles.inputDarkBorderOrange} />
                                            </div>
                                            <div className="col-span-2">
                                                <Input placeholder="Cantidad (Ej: 200g, 1 taza)" value={addCantidad} onChange={(e) => setAddCantidad(e.target.value)} className={AppStyles.inputDarkBorderOrange} />
                                            </div>
                                            <Input type="number" min="0" placeholder="Kcal" value={addCals} onChange={(e) => setAddCals(e.target.value ? Number(e.target.value) : '')} className={AppStyles.inputDarkBorderOrange} />
                                            <Input type="number" min="0" placeholder="Prot (g)" value={addProts} onChange={(e) => setAddProts(e.target.value ? Number(e.target.value) : '')} className={AppStyles.inputDarkBorderOrange} />
                                            <Input type="number" min="0" placeholder="Carbos (g)" value={addCarbs} onChange={(e) => setAddCarbs(e.target.value ? Number(e.target.value) : '')} className={AppStyles.inputDarkBorderOrange} />
                                            <Input type="number" min="0" placeholder="Grasas (g)" value={addGrasas} onChange={(e) => setAddGrasas(e.target.value ? Number(e.target.value) : '')} className={AppStyles.inputDarkBorderOrange} />
                                            
                                            <Button onClick={handleAddToCart} className="col-span-2 bg-orange-700 text-white border border-orange-500 hover:bg-orange-500/50 py-3 mt-2">
                                                <Plus className="w-5 h-5 mr-2" /> Añadir a la lista
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Opciones Rápidas */}
                                    {comidasPredefinidas.length > 0 && (
                                        <div className="space-y-3">
                                            <h4 className="text-xs text-gray-400 font-bold uppercase">Predefinidas (Autocompletar)</h4>
                                            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto scrollbar-none pb-2">
                                                {comidasPredefinidas.map(p => (
                                                    <button 
                                                        key={p.id} 
                                                        onClick={() => handleSelectPredefinida(p)}
                                                        className="bg-black/30 border border-white/10 hover:border-orange-500/50 hover:bg-orange-500/10 text-gray-300 px-3 py-2 rounded-lg text-base font-bold transition-all text-left flex flex-col gap-1 w-[calc(50%-0.25rem)] h-auto justify-start"
                                                    >
                                                        <span className="w-full text-orange-400 whitespace-normal leading-tight">{p.nombre}</span>
                                                        <span className="text-sm text-gray-500 font-normal mt-auto">{p.cantidad} • {p.calorias} kcal</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Botón Guardar Todo */}
                        {addTipo && (
                            <div className="pt-4 mt-auto border-t border-white/10 flex-shrink-0">
                                <Button onClick={handleSaveRegistro} disabled={cart.length === 0} className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 disabled:text-gray-500 font-bold py-4">
                                    Guardar Registro Completo
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modal: Comidas Predefinidas */}
            {showPredefModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center animate-fade-in">
                    <div className="bg-[#1a1a1a] w-full sm:w-[450px] p-6 rounded-t-3xl sm:rounded-3xl flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center mb-2 flex-shrink-0">
                            <h3 className="text-xl font-bold">Crear Comida</h3>
                            <button onClick={() => setShowPredefModal(false)} className="p-2 bg-white/5 rounded-full"><X className="w-5 h-5" /></button>
                        </div>
                        <p className="text-sm text-gray-400 mb-6 flex-shrink-0">Crea alimentos con sus macros para reutilizarlos rápidamente en tu registro diario.</p>

                        <div className="overflow-y-auto scrollbar-none flex-1 space-y-6 pb-4">
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-4">
                                <h4 className="text-sm font-bold text-orange-400">{editingPredef ? 'Editar Comida' : 'Nueva Comida'}</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="col-span-2">
                                        <Input placeholder="Nombre (Ej: Pechuga de Pollo)" value={predefNombre} onChange={(e) => setPredefNombre(e.target.value)} className={AppStyles.inputDarkBorderOrange} />
                                    </div>
                                    <div className="col-span-2">
                                        <Input placeholder="Cantidad (Ej: 100g)" value={predefCantidad} onChange={(e) => setPredefCantidad(e.target.value)} className={AppStyles.inputDarkBorderOrange} />
                                    </div>
                                    <Input type="number" min="0" placeholder="Kcal" value={predefCals} onChange={(e) => setPredefCals(e.target.value ? Number(e.target.value) : '')} className={AppStyles.inputDarkBorderOrange} />
                                    <Input type="number" min="0" placeholder="Prot (g)" value={predefProts} onChange={(e) => setPredefProts(e.target.value ? Number(e.target.value) : '')} className={AppStyles.inputDarkBorderOrange} />
                                    <Input type="number" min="0" placeholder="Carbos (g)" value={predefCarbs} onChange={(e) => setPredefCarbs(e.target.value ? Number(e.target.value) : '')} className={AppStyles.inputDarkBorderOrange} />
                                    <Input type="number" min="0" placeholder="Grasas (g)" value={predefGrasas} onChange={(e) => setPredefGrasas(e.target.value ? Number(e.target.value) : '')} className={AppStyles.inputDarkBorderOrange} />
                                </div>
                                <div className="flex gap-2 pt-2">
                                    {editingPredef && (
                                        <Button onClick={resetPredefForm} className="flex-1 bg-white/10 text-white">Cancelar</Button>
                                    )}
                                    <Button onClick={handleSavePredef} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold">
                                        {editingPredef ? 'Actualizar' : 'Crear'}
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-xs text-gray-400 font-bold uppercase">Tus comidas guardadas</h4>
                                {comidasPredefinidas.length === 0 ? (
                                    <p className="text-sm text-gray-500 text-center py-4 bg-black/30 rounded-xl border border-white/5">No tienes comidas guardadas.</p>
                                ) : (
                                    comidasPredefinidas.map(p => (
                                        <div key={p.id} className="bg-black/40 p-4 rounded-xl border border-white/5 flex justify-between items-center">
                                            <div>
                                                <p className="font-bold text-white text-sm">{p.nombre} <span className="text-gray-500 font-normal">({p.cantidad})</span></p>
                                                <div className="flex flex-wrap gap-1.5 mt-3">
                                                    {p.calorias > 0 && <span className="flex items-center gap-1 text-[10px] text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded"><Flame className="w-3 h-3"/> {p.calorias}</span>}
                                                    {p.proteinas > 0 && <span className="flex items-center gap-1 text-[10px] text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded"><Beef className="w-3 h-3"/> {p.proteinas}g</span>}
                                                    {p.carbohidratos > 0 && <span className="flex items-center gap-1 text-[10px] text-yellow-400 bg-yellow-500/10 px-1.5 py-0.5 rounded"><Wheat className="w-3 h-3"/> {p.carbohidratos}g</span>}
                                                    {p.grasas > 0 && <span className="flex items-center gap-1 text-[10px] text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded"><Flame className="w-3 h-3"/> {p.grasas}g</span>}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => openEditPredef(p)} className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDeletePredef(p.id)} className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
