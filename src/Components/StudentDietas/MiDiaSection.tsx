import { useState, useMemo, useEffect } from "react";
import { Flame, Beef, Droplet, Wheat, GlassWater, Plus, X, Edit2, Trash2, List } from "lucide-react";
import { AppStyles } from "../../Styles/AppStyles";
import { Button } from "../UI/Button";
import { Input } from "../UI/Input";
import { showError, showSuccess, showConfirmDelete } from "../../Helpers/Alerts";
import { ORDEN_COMIDAS, sortComidasByTime } from "../../Helpers/DietasHelper";

interface MiDiaSectionProps {
    dietaAsignada: any;
    registroHoy: any;
    comidasPredefinidas: any[];
    platosFavoritos: any[];
    registrarComida: (data: any) => Promise<boolean>;
    registrarAgua: (cantidad: number) => Promise<boolean>;
    borrarComida: (id: number) => Promise<boolean>;
    crearPredefinida: (data: any) => Promise<boolean>;
    actualizarPredefinida: (id: number, data: any) => Promise<boolean>;
    eliminarPredefinida: (id: number) => Promise<boolean>;
    crearPlatoFavorito: (data: any) => Promise<boolean>;
    actualizarPlatoFavorito: (id: number, data: any) => Promise<boolean>;
    eliminarPlatoFavorito: (id: number) => Promise<boolean>;
}

export const MetaMacro = ({ icon: Icon, color, title, value, max, unit }: any) => {
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

export const MiDiaSection = ({
    dietaAsignada,
    registroHoy,
    comidasPredefinidas,
    platosFavoritos,
    registrarComida,
    registrarAgua,
    borrarComida,
    crearPredefinida,
    actualizarPredefinida,
    eliminarPredefinida,
    crearPlatoFavorito,
    actualizarPlatoFavorito,
    eliminarPlatoFavorito
}: MiDiaSectionProps) => {
    
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

    // Modal states para Platos Favoritos
    const [showPlatosModal, setShowPlatosModal] = useState(false);
    const [platoNombre, setPlatoNombre] = useState("");
    const [cartPlato, setCartPlato] = useState<any[]>([]);
    const [editingPlato, setEditingPlato] = useState<any>(null);

    // Modal states para Agregar Plato
    const [showAddPlatoModal, setShowAddPlatoModal] = useState(false);
    const [addPlatoTipo, setAddPlatoTipo] = useState("");

    // Bloquear scroll de fondo cuando hay un modal abierto
    useEffect(() => {
        if (showAddModal || showPredefModal || showPlatosModal || showAddPlatoModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [showAddModal, showPredefModal, showPlatosModal, showAddPlatoModal]);

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
        
        setAddNombre(""); setAddCantidad(""); setAddCals(""); setAddProts(""); setAddCarbs(""); setAddGrasas("");
    };

    const handleRemoveFromCart = (idTemp: number) => {
        setCart(cart.filter(item => item.idTemp !== idTemp));
    };

    const handleAddToCartPlato = () => {
        if (!addNombre.trim()) return showError("Ingresa el nombre de la comida");
        if (!addCantidad.trim()) return showError("Ingresa la cantidad");
        
        const item = {
            idTemp: Date.now(),
            nombre: addNombre,
            cantidad: addCantidad,
            calorias: addCals || 0,
            proteinas: addProts || 0,
            carbohidratos: addCarbs || 0,
            grasas: addGrasas || 0
        };
        setCartPlato([...cartPlato, item]);
        
        setAddNombre(""); setAddCantidad(""); setAddCals(""); setAddProts(""); setAddCarbs(""); setAddGrasas("");
    };

    const handleRemoveFromCartPlato = (idTemp: number) => {
        setCartPlato(cartPlato.filter(item => item.idTemp !== idTemp));
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

    const totalCartPlatoMacros = useMemo(() => {
        return cartPlato.reduce((acc, curr) => ({
            calorias: acc.calorias + (curr.calorias || 0),
            proteinas: acc.proteinas + (curr.proteinas || 0),
            carbohidratos: acc.carbohidratos + (curr.carbohidratos || 0),
            grasas: acc.grasas + (curr.grasas || 0),
        }), { calorias: 0, proteinas: 0, carbohidratos: 0, grasas: 0 });
    }, [cartPlato]);

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

    // LÓGICA PLATOS FAVORITOS
    const handleSavePlato = async () => {
        if (!platoNombre.trim()) return showError("Ingresa el nombre del plato");
        if (cartPlato.length === 0) return showError("Agrega al menos un alimento al plato");

        const descripcionCombinada = cartPlato.map(c => `${c.nombre} ${c.cantidad}`).join('\n');
        const data = {
            nombre: platoNombre,
            descripcion: descripcionCombinada,
            calorias: totalCartPlatoMacros.calorias,
            proteinas: totalCartPlatoMacros.proteinas,
            carbohidratos: totalCartPlatoMacros.carbohidratos,
            grasas: totalCartPlatoMacros.grasas
        };

        const success = editingPlato 
            ? await actualizarPlatoFavorito(editingPlato.id, data)
            : await crearPlatoFavorito(data);

        if (success) {
            showSuccess("Plato guardado con éxito");
            setPlatoNombre("");
            setCartPlato([]);
            setEditingPlato(null);
        }
    };

    const handleDeletePlato = async (id: number) => {
        const confirmed = await showConfirmDelete("¿Eliminar este plato?", "Esta accion no se puede deshacer");
        if (confirmed) {
            await eliminarPlatoFavorito(id);
        }
    };

    const openEditPlato = (plato: any) => {
        setEditingPlato(plato);
        setPlatoNombre(plato.nombre);
        // Reconstruir carrito desde la descripcion
        const lines = plato.descripcion.split('\n');
        const newCart = lines.map((l: string, i: number) => {
            const lastSpaceIndex = l.lastIndexOf(' ');
            return {
                idTemp: Date.now() + i,
                nombre: l.substring(0, lastSpaceIndex),
                cantidad: l.substring(lastSpaceIndex + 1),
                calorias: i === 0 ? plato.calorias : 0,
                proteinas: i === 0 ? plato.proteinas : 0,
                carbohidratos: i === 0 ? plato.carbohidratos : 0,
                grasas: i === 0 ? plato.grasas : 0,
            };
        });
        setCartPlato(newCart);
    };

    const handleRegistrarPlato = async (plato: any) => {
        if (!addPlatoTipo) return showError("Selecciona el momento del día");

        const success = await registrarComida({
            tipo: addPlatoTipo,
            descripcion: plato.descripcion,
            calorias: plato.calorias,
            proteinas: plato.proteinas,
            carbohidratos: plato.carbohidratos,
            grasas: plato.grasas
        });

        if (success) {
            showSuccess("Plato registrado");
            setShowAddPlatoModal(false);
            setAddPlatoTipo("");
        }
    };



    return (
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
                <MetaMacro icon={Droplet} color={{ bg: 'bg-green-500/20', text: 'text-green-400', bgSolid: 'bg-green-500' }} title="Grasas" value={registroHoy?.totalGrasas || 0} max={dietaAsignada?.grasasDiarias} unit="g" />
                <MetaMacro icon={GlassWater} color={{ bg: 'bg-blue-500/20', text: 'text-blue-400', bgSolid: 'bg-blue-500' }} title="Agua" value={registroHoy?.totalAgua || 0} max={dietaAsignada?.litrosAguaDiarios} unit="L" />
            </div>

            <div className="flex flex-col gap-3">
                <div className="flex gap-3">
                    <Button variant="orange" onClick={() => setShowAddModal(true)} className="flex-1 font-bold py-3">
                        <Plus className="w-5 h-5 mr-2" /> Agregar Comida
                    </Button>
                    <Button variant="purple" onClick={() => setShowAddPlatoModal(true)} className="flex-1 font-bold py-3">
                        <Plus className="w-5 h-5 mr-2" /> Agregar Plato
                    </Button>
                </div>
                <Button variant="blue" onClick={() => registrarAgua(0.25)} className="w-full py-3">
                    <GlassWater className="w-5 h-5" /> + 250ml de Agua
                </Button>
                <div className="flex gap-3">
                    <button onClick={() => setShowPredefModal(true)} className="flex-1 text-sm font-bold text-orange-400 bg-orange-500/10 hover:bg-orange-500/20 py-2 rounded-xl flex items-center justify-center transition-colors">
                        <List className="w-4 h-4 mr-2" /> Mis Comidas
                    </button>
                    <button onClick={() => setShowPlatosModal(true)} className="flex-1 text-sm font-bold text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 py-2 rounded-xl flex items-center justify-center transition-colors">
                        <List className="w-4 h-4 mr-2" /> Mis Platos
                    </button>
                </div>
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

            {/* Modal: Agregar Comida */}
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
                                                            {c.grasas > 0 && <span className="flex items-center gap-1 text-[10px] text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded"><Droplet className="w-3 h-3"/> {c.grasas}g</span>}
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
                                                    <span className="flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded font-bold"><Droplet className="w-3 h-3"/> {totalCartMacros.grasas}g</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-4">
                                        <h4 className="text-sm font-bold text-gray-300">Añadir Alimento</h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="col-span-2">
                                                <Input placeholder="Nombre (Ej: Pollo)" value={addNombre} onChange={(e) => setAddNombre(e.target.value)} className={AppStyles.inputDarkBorderOrange} />
                                            </div>
                                            <div className="col-span-2">
                                                <Input placeholder="Cantidad (Ej: 200g, 1 taza)" value={addCantidad} onChange={(e) => setAddCantidad(e.target.value)} className={AppStyles.inputDarkBorderOrange} />
                                            </div>
                                            <Input type="number" min="0" placeholder="Kcal" value={addCals} onChange={(e) => setAddCals(e.target.value ? Math.max(0, Number(e.target.value)) : '')} className={AppStyles.inputDarkBorderOrange} />
                                            <Input type="number" min="0" placeholder="Prot (g)" value={addProts} onChange={(e) => setAddProts(e.target.value ? Math.max(0, Number(e.target.value)) : '')} className={AppStyles.inputDarkBorderOrange} />
                                            <Input type="number" min="0" placeholder="Carbos (g)" value={addCarbs} onChange={(e) => setAddCarbs(e.target.value ? Math.max(0, Number(e.target.value)) : '')} className={AppStyles.inputDarkBorderOrange} />
                                            <Input type="number" min="0" placeholder="Grasas (g)" value={addGrasas} onChange={(e) => setAddGrasas(e.target.value ? Math.max(0, Number(e.target.value)) : '')} className={AppStyles.inputDarkBorderOrange} />
                                            
                                            <Button variant="orange" onClick={handleAddToCart} className="col-span-2 py-3 mt-2">
                                                <Plus className="w-5 h-5 mr-2" /> Añadir a la lista
                                            </Button>
                                        </div>
                                    </div>

                                    {comidasPredefinidas.length > 0 && (
                                        <div className="space-y-3">
                                            <h4 className="text-xs text-gray-400 font-bold uppercase">Predefinidas (Autocompletar)</h4>
                                            <div className="flex flex-wrap gap-2 max-h-72 overflow-y-auto scrollbar-none pb-2">
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

                        {addTipo && (
                            <div className="pt-4 mt-auto border-t border-white/10 flex-shrink-0">
                                <Button onClick={handleSaveRegistro} disabled={cart.length === 0} className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 disabled:text-gray-500 font-bold py-4">
                                    Registrar Comida
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modal: Mis Comidas */}
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
                                    <Input type="number" min="0" placeholder="Kcal" value={predefCals} onChange={(e) => setPredefCals(e.target.value ? Math.max(0, Number(e.target.value)) : '')} className={AppStyles.inputDarkBorderOrange} />
                                    <Input type="number" min="0" placeholder="Prot (g)" value={predefProts} onChange={(e) => setPredefProts(e.target.value ? Math.max(0, Number(e.target.value)) : '')} className={AppStyles.inputDarkBorderOrange} />
                                    <Input type="number" min="0" placeholder="Carbos (g)" value={predefCarbs} onChange={(e) => setPredefCarbs(e.target.value ? Math.max(0, Number(e.target.value)) : '')} className={AppStyles.inputDarkBorderOrange} />
                                    <Input type="number" min="0" placeholder="Grasas (g)" value={predefGrasas} onChange={(e) => setPredefGrasas(e.target.value ? Math.max(0, Number(e.target.value)) : '')} className={AppStyles.inputDarkBorderOrange} />
                                </div>
                                <div className="flex gap-2 pt-2">
                                    {editingPredef && (
                                        <Button onClick={resetPredefForm} className="flex-1 bg-white/10 text-white">Cancelar</Button>
                                    )}
                                    <Button variant="orange" onClick={handleSavePredef} className="flex-1">
                                        {editingPredef ? 'Actualizar' : 'Guardar Comida'}
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-base text-gray-400 font-bold">Comidas Guardadas</h4>
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
                                                    {p.grasas > 0 && <span className="flex items-center gap-1 text-[10px] text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded"><Droplet className="w-3 h-3"/> {p.grasas}g</span>}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => openEditPredef(p)} className={AppStyles.iconButtonEditBlue}>
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDeletePredef(p.id)} className={AppStyles.iconButtonDelete}>
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

            {/* Modal: Mis Platos */}
            {showPlatosModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center animate-fade-in">
                    <div className="bg-[#1a1a1a] w-full sm:w-[450px] p-6 rounded-t-3xl sm:rounded-3xl flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center mb-2 flex-shrink-0">
                            <h3 className="text-xl font-bold text-purple-400">Mis Platos Favoritos</h3>
                            <button onClick={() => setShowPlatosModal(false)} className="p-2 bg-white/5 rounded-full"><X className="w-5 h-5" /></button>
                        </div>
                        <p className="text-sm text-gray-400 mb-6 flex-shrink-0">Arma un plato con múltiples alimentos para registrarlo todo junto de forma rápida.</p>

                        <div className="overflow-y-auto scrollbar-none flex-1 space-y-6 pb-4">
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-4">
                                <h4 className="text-sm font-bold text-purple-400">{editingPlato ? 'Editar Plato' : 'Nuevo Plato'}</h4>
                                <Input placeholder="Nombre del Plato (Ej: Arroz con Pollo)" value={platoNombre} onChange={(e) => setPlatoNombre(e.target.value)} className={AppStyles.inputDarkBorderPurple} />
                                
                                {cartPlato.length > 0 && (
                                    <div className="bg-black/40 p-4 rounded-xl border border-white/10 space-y-3">
                                        {cartPlato.map(c => (
                                            <div key={c.idTemp} className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                                                <div>
                                                    <p className="font-bold text-sm">{c.nombre} <span className="text-gray-500 font-normal">({c.cantidad})</span></p>
                                                </div>
                                                <button onClick={() => handleRemoveFromCartPlato(c.idTemp)} className={AppStyles.iconButtonDelete}>
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                        <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
                                            <span className="text-gray-400 font-bold text-xs uppercase tracking-wider">Totales de la lista</span>
                                            <div className="flex flex-wrap gap-2">
                                                <span className="flex items-center gap-1 text-xs text-orange-400 bg-orange-500/10 px-2 py-1 rounded font-bold"><Flame className="w-3 h-3"/> {totalCartPlatoMacros.calorias}</span>
                                                <span className="flex items-center gap-1 text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded font-bold"><Beef className="w-3 h-3"/> {totalCartPlatoMacros.proteinas}g</span>
                                                <span className="flex items-center gap-1 text-xs text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded font-bold"><Wheat className="w-3 h-3"/> {totalCartPlatoMacros.carbohidratos}g</span>
                                                <span className="flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded font-bold"><Droplet className="w-3 h-3"/> {totalCartPlatoMacros.grasas}g</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-3 border-t border-white/10 pt-4">
                                    <h5 className="text-xs font-bold text-gray-400 uppercase">Añadir alimento</h5>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="col-span-2">
                                            <Input placeholder="Nombre" value={addNombre} onChange={(e) => setAddNombre(e.target.value)} className={AppStyles.inputDarkBorderPurple} />
                                        </div>
                                        <div className="col-span-2">
                                            <Input placeholder="Cantidad" value={addCantidad} onChange={(e) => setAddCantidad(e.target.value)} className={AppStyles.inputDarkBorderPurple} />
                                        </div>
                                        <Input type="number" min="0" placeholder="Kcal" value={addCals} onChange={(e) => setAddCals(e.target.value ? Math.max(0, Number(e.target.value)) : '')} className={AppStyles.inputDarkBorderPurple} />
                                        <Input type="number" min="0" placeholder="Prot (g)" value={addProts} onChange={(e) => setAddProts(e.target.value ? Math.max(0, Number(e.target.value)) : '')} className={AppStyles.inputDarkBorderPurple} />
                                        <Input type="number" min="0" placeholder="Carbos (g)" value={addCarbs} onChange={(e) => setAddCarbs(e.target.value ? Math.max(0, Number(e.target.value)) : '')} className={AppStyles.inputDarkBorderPurple} />
                                        <Input type="number" min="0" placeholder="Grasas (g)" value={addGrasas} onChange={(e) => setAddGrasas(e.target.value ? Math.max(0, Number(e.target.value)) : '')} className={AppStyles.inputDarkBorderPurple} />
                                        <Button variant="purple" onClick={handleAddToCartPlato} className="col-span-2 border py-3 mt-2">
                                            <Plus className="w-5 h-5 mr-2" /> Añadir al Plato
                                        </Button>
                                    </div>
                                </div>

                                {comidasPredefinidas.length > 0 && (
                                    <div className="space-y-3 pt-4 border-t border-white/10">
                                        <h4 className="text-xs text-gray-400 font-bold uppercase">Mis Comidas</h4>
                                        <div className="flex flex-wrap gap-2 max-h-72 overflow-y-auto scrollbar-none pb-2">
                                            {comidasPredefinidas.map(p => (
                                                <button 
                                                    key={p.id} 
                                                    onClick={() => handleSelectPredefinida(p)}
                                                    className="bg-black/30 border border-white/10 hover:border-purple-500/50 hover:bg-purple-500/10 text-gray-300 px-3 py-2 rounded-lg text-base font-bold transition-all text-left flex flex-col gap-1 w-[calc(50%-0.25rem)] h-auto justify-start"
                                                >
                                                    <span className="w-full text-purple-400 whitespace-normal leading-tight">{p.nombre}</span>
                                                    <span className="text-sm text-gray-500 font-normal mt-auto">{p.cantidad} • {p.calorias} kcal</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                            </div>

                            <div className="space-y-3">
                                <h4 className="text-base text-gray-400 font-bold">Platos Guardados</h4>
                                {platosFavoritos.length === 0 ? (
                                    <p className="text-sm text-gray-500 text-center py-4 bg-black/30 rounded-xl border border-white/5">No tienes platos guardados.</p>
                                ) : (
                                    platosFavoritos.map(p => (
                                        <div key={p.id} className="bg-black/40 p-4 rounded-xl border border-white/5 flex justify-between items-center">
                                            <div>
                                                <p className="font-bold text-purple-400 text-xl">{p.nombre}</p>
                                                <div className="flex flex-wrap gap-1.5 mt-3">
                                                    {p.calorias > 0 && <span className="flex items-center gap-1 text-[15px] text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded"><Flame className="w-3 h-3"/> {p.calorias}</span>}
                                                    {p.proteinas > 0 && <span className="flex items-center gap-1 text-[15px] text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded"><Beef className="w-3 h-3"/> {p.proteinas}g</span>}
                                                    {p.carbohidratos > 0 && <span className="flex items-center gap-1 text-[15px] text-yellow-400 bg-yellow-500/10 px-1.5 py-0.5 rounded"><Wheat className="w-3 h-3"/> {p.carbohidratos}g</span>}
                                                    {p.grasas > 0 && <span className="flex items-center gap-1 text-[15px] text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded"><Droplet className="w-3 h-3"/> {p.grasas}g</span>}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => openEditPlato(p)} className={AppStyles.iconButtonEditPurple}>
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDeletePlato(p.id)} className={AppStyles.iconButtonDelete}>
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="pt-4 mt-auto border-t border-white/10 flex-shrink-0 flex gap-2">
                            {editingPlato && (
                                <Button onClick={() => { setEditingPlato(null); setPlatoNombre(""); setCartPlato([]); }} className="flex-1 bg-white/10 text-white font-bold py-4">Cancelar</Button>
                            )}
                            <Button onClick={handleSavePlato} disabled={cartPlato.length === 0} className="flex-1 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold py-4">
                                {editingPlato ? 'Actualizar Plato' : 'Guardar Plato'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Agregar Plato */}
            {showAddPlatoModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center animate-fade-in">
                    <div className="bg-[#1a1a1a] w-full sm:w-[450px] p-6 rounded-t-3xl sm:rounded-3xl flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center mb-4 flex-shrink-0">
                            <h3 className="text-xl font-bold text-purple-400">Registrar Plato</h3>
                            <button onClick={() => setShowAddPlatoModal(false)} className="p-2 bg-white/5 rounded-full"><X className="w-5 h-5" /></button>
                        </div>
                        
                        <div className="overflow-y-auto scrollbar-none flex-1 pb-4">
                            {!addPlatoTipo ? (
                                <div className="space-y-3">
                                    <h4 className="text-gray-400 text-sm font-bold uppercase mb-2">Selecciona el momento</h4>
                                    {ORDEN_COMIDAS.map(tipo => (
                                        <button 
                                            key={tipo}
                                            onClick={() => setAddPlatoTipo(tipo)}
                                            className="w-full text-left p-4 rounded-2xl border border-white/10 hover:border-purple-500/50 hover:bg-purple-500/10 transition-all font-bold"
                                        >
                                            {tipo}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center bg-purple-500/20 p-3 rounded-xl border border-purple-500/30">
                                        <span className="font-bold text-purple-400">{addPlatoTipo}</span>
                                        <button onClick={() => setAddPlatoTipo("")} className="text-xs text-purple-300 underline">Cambiar</button>
                                    </div>

                                    <div className="space-y-3">
                                        <h4 className="text-xs text-gray-400 font-bold uppercase">Selecciona tu plato</h4>
                                        {platosFavoritos.length === 0 ? (
                                            <p className="text-sm text-gray-500 text-center py-4 bg-black/30 rounded-xl border border-white/5">No tienes platos guardados.</p>
                                        ) : (
                                            platosFavoritos.map(p => (
                                                <button 
                                                    key={p.id} 
                                                    onClick={() => handleRegistrarPlato(p)}
                                                    className="w-full bg-black/30 border border-white/10 hover:border-purple-500/50 hover:bg-purple-500/10 text-gray-300 p-4 rounded-xl transition-all text-left flex flex-col gap-2"
                                                >
                                                    <span className="text-xl font-bold text-purple-400">{p.nombre}</span>
                                                    <span className="text-base text-gray-500 whitespace-pre-line leading-tight">{p.descripcion}</span>
                                                    <div className="flex flex-wrap gap-1.5 mt-1">
                                                        {p.calorias > 0 && <span className="flex items-center gap-1 text-[15px] text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded"><Flame className="w-3 h-3"/> {p.calorias}</span>}
                                                        {p.proteinas > 0 && <span className="flex items-center gap-1 text-[15px] text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded"><Beef className="w-3 h-3"/> {p.proteinas}g</span>}
                                                        {p.carbohidratos > 0 && <span className="flex items-center gap-1 text-[15px] text-yellow-400 bg-yellow-500/10 px-1.5 py-0.5 rounded"><Wheat className="w-3 h-3"/> {p.carbohidratos}g</span>}
                                                        {p.grasas > 0 && <span className="flex items-center gap-1 text-[15px] text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded"><Droplet className="w-3 h-3"/> {p.grasas}g</span>}
                                                    </div>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
