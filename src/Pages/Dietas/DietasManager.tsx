import { AppStyles } from "../../Styles/AppStyles";
import { Input } from "../../Components/UI/Input";
import { Button } from "../../Components/UI/Button";
import { useDietasManager } from "../../Hooks/Dietas/useDietasManager";
import { Salad, UserPlus, Save, Trash2, PlusCircle, X, Search, Utensils, Droplet, Flame } from "lucide-react";
import { useState } from "react";

export const DietasManager = () => {
    const {
        usuarios,
        loadingUsuarios,
        loadingDietas,
        selectedUser,
        setSelectedUser,
        dietaActual,
        nombre, setNombre,
        observaciones, setObservaciones,
        caloriasDiarias, setCaloriasDiarias,
        proteinasDiarias, setProteinasDiarias,
        carbohidratosDiarios, setCarbohidratosDiarios,
        grasasDiarias, setGrasasDiarias,
        litrosAguaDiarios, setLitrosAguaDiarios,
        comidas,
        agregarComida,
        eliminarComida,
        actualizarComida,
        guardarDieta,
        borrarDieta
    } = useDietasManager();

    const [searchTerm, setSearchTerm] = useState("");
    const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const [selectedDay, setSelectedDay] = useState('Lunes');

    const usuariosFiltrados = usuarios.filter((u: any) =>
        `${u.nombre} ${u.apellido}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.dni.includes(searchTerm)
    );

    return (
        <div className="w-full max-w-7xl mx-auto space-y-8 animate-fade-in-up pb-20">
            <div className="flex items-center gap-3">
                <Salad className="w-8 h-8 text-green-400" />
                <div>
                    <h1 className={AppStyles.title}>Gestión de Dietas</h1>
                    <p className={AppStyles.subtitle}>Asigna planes nutricionales a los usuarios del gimnasio.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Panel Izquierdo: Buscador de Alumnos */}
                <div className="lg:col-span-1 space-y-4">
                    <div className={AppStyles.glassCard}>
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Search className="w-5 h-5 text-gray-400" /> Buscar Alumno
                        </h3>
                        <Input
                            placeholder="Nombre o DNI..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={AppStyles.inputDark}
                        />
                        <div className={AppStyles.customScrollbar + " mt-4 max-h-96 space-y-2 pr-2"}>
                            {loadingUsuarios ? (
                                <p className="text-gray-400 text-sm">Cargando alumnos...</p>
                            ) : usuariosFiltrados.length === 0 ? (
                                <p className="text-gray-400 text-sm">No se encontraron alumnos.</p>
                            ) : (
                                usuariosFiltrados.map((u: any) => (
                                    <button
                                        key={u.id}
                                        onClick={() => setSelectedUser(u)}
                                        className={`w-full text-left p-3 rounded-xl transition-all duration-300 flex items-center gap-3 ${
                                            selectedUser?.id === u.id
                                                ? "bg-green-500/20 border border-green-500/30"
                                                : "bg-white/5 hover:bg-white/10"
                                        }`}
                                    >
                                        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold shrink-0">
                                            {u.nombre?.[0] || <UserPlus className="w-4 h-4" />}
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-white font-medium truncate">{u.nombre} {u.apellido}</p>
                                            <p className="text-gray-400 text-xs truncate">DNI: {u.dni}</p>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Panel Derecho: Constructor de Dieta */}
                <div className="lg:col-span-3">
                    {!selectedUser ? (
                        <div className={`${AppStyles.glassCard} flex flex-col items-center justify-center py-20 text-center`}>
                            <Salad className="w-16 h-16 text-gray-600 mb-4" />
                            <h3 className="text-xl font-bold text-gray-400">Selecciona un alumno</h3>
                            <p className="text-gray-500">Busca y selecciona un alumno de la lista para gestionar su dieta.</p>
                        </div>
                    ) : (
                        <div className={`${AppStyles.glassCard} space-y-8 relative`}>
                            {loadingDietas && (
                                <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center z-10">
                                    <p className="text-white">Cargando dieta...</p>
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                        Plan de {selectedUser.nombre} {selectedUser.apellido}
                                    </h2>
                                    <p className={dietaActual ? "text-green-400" : "text-orange-400"}>
                                        {dietaActual ? "Modificando dieta existente" : "Creando nueva dieta"}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    {dietaActual && (
                                        <Button 
                                            type="button" 
                                            onClick={borrarDieta}
                                            className="bg-red-500/10 text-red-400 hover:bg-red-500/20"
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" /> Eliminar
                                        </Button>
                                    )}
                                    <Button 
                                        type="button" 
                                        onClick={guardarDieta}
                                        className="bg-green-500/20 text-green-400 hover:bg-green-500/30"
                                    >
                                        <Save className="w-4 h-4 mr-2" /> Guardar Dieta
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className={AppStyles.label}>Nombre de la Dieta</label>
                                        <Input
                                            placeholder="Ej: Dieta de Definición"
                                            value={nombre}
                                            onChange={(e) => setNombre(e.target.value)}
                                            className={AppStyles.inputDark}
                                        />
                                    </div>
                                    <div>
                                        <label className={AppStyles.label}>Observaciones Generales</label>
                                        <textarea
                                            placeholder="Ej: Tomar batido post-entreno, comer cada 3 horas..."
                                            value={observaciones}
                                            onChange={(e) => setObservaciones(e.target.value)}
                                            className={`${AppStyles.inputDark} resize-y min-h-[100px] w-full`}
                                        />
                                    </div>
                                </div>

                                <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-4">
                                    <h3 className="text-white font-bold flex items-center gap-2 mb-2">
                                        <Flame className="w-5 h-5 text-orange-400" /> Metas Diarias (Opcional)
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs text-orange-400 mb-1">Calorías (kcal)</label>
                                            <Input type="number" placeholder="0" min="0" value={caloriasDiarias} onChange={(e) => setCaloriasDiarias(e.target.value ? Number(e.target.value) : '')} className={AppStyles.inputDark.replace("border-white/10","border-orange-500/50")} />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-red-400 mb-1">Proteínas (g)</label>
                                            <Input type="number" placeholder="0" min="0" value={proteinasDiarias} onChange={(e) => setProteinasDiarias(e.target.value ? Number(e.target.value) : '')} className={AppStyles.inputDark.replace("border-white/10","border-red-500/50")} />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-yellow-400 mb-1">Carbohidratos (g)</label>
                                            <Input type="number" placeholder="0" min="0" value={carbohidratosDiarios} onChange={(e) => setCarbohidratosDiarios(e.target.value ? Number(e.target.value) : '')} className={AppStyles.inputDark.replace("border-white/10","border-yellow-500/50")} />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-green-400 mb-1">Grasas (g)</label>
                                            <Input type="number" placeholder="0" min="0" value={grasasDiarias} onChange={(e) => setGrasasDiarias(e.target.value ? Number(e.target.value) : '')} className={AppStyles.inputDark.replace("border-white/10","border-green-500/50")} />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="text-xs text-blue-400 mb-1 flex items-center gap-1"><Droplet className="w-3 h-3" /> Litros de Agua</label>
                                            <Input type="number" step="0.1" min="0" placeholder="Ej: 3.5" value={litrosAguaDiarios} onChange={(e) => setLitrosAguaDiarios(e.target.value ? Number(e.target.value) : '')} className={AppStyles.inputDark.replace("border-white/10","border-blue-500/50")} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-white/10" />

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                        <Utensils className="w-5 h-5 text-gray-400" /> Comidas Sugeridas
                                    </h3>
                                    <Button type="button" onClick={() => agregarComida(selectedDay)} className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 text-sm py-1.5">
                                        <PlusCircle className="w-4 h-4 mr-2" /> Añadir Comida
                                    </Button>
                                </div>

                                {/* Pestañas de días */}
                                <div className="flex gap-2 overflow-x-auto scrollbar-none py-2 border-b border-white/5">
                                    {diasSemana.map(dia => (
                                        <button
                                            key={dia}
                                            onClick={(e) => { e.preventDefault(); setSelectedDay(dia); }}
                                            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-all ${
                                                selectedDay === dia ? 'bg-orange-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                            }`}
                                        >
                                            {dia}
                                        </button>
                                    ))}
                                </div>

                                {comidas.filter(c => (c.diaSemana || 'Lunes') === selectedDay).length === 0 ? (
                                    <p className="text-gray-500 text-center py-4">No has añadido comidas para el {selectedDay}.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {comidas.map((comida, index) => {
                                            if ((comida.diaSemana || 'Lunes') !== selectedDay) return null;
                                            return (
                                            <div key={index} className="bg-black/30 p-4 rounded-xl border border-white/5 relative animate-fade-in">
                                                <button 
                                                    onClick={() => eliminarComida(index)}
                                                    className="absolute top-4 right-4 text-gray-500 hover:text-red-400 transition-colors"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                    <div className="md:col-span-1">
                                                        <label className={AppStyles.label}>Momento del día</label>
                                                        <Input
                                                            placeholder="Ej: Desayuno"
                                                            value={comida.tipo}
                                                            onChange={(e) => actualizarComida(index, 'tipo', e.target.value)}
                                                            className={AppStyles.inputDark}
                                                            list="tipos-comida"
                                                        />
                                                        <datalist id="tipos-comida">
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
                                                    <div className="md:col-span-2">
                                                        <label className={AppStyles.label}>Alimentos (Detalle)</label>
                                                        <textarea
                                                            placeholder="Ej: 4 claras de huevo&#10;100g avena..."
                                                            value={comida.alimentos}
                                                            onChange={(e) => actualizarComida(index, 'alimentos', e.target.value)}
                                                            className={`${AppStyles.inputDark} w-full resize-y py-2 overflow-hidden`}
                                                            rows={Math.max(2, (comida.alimentos || '').split('\n').length)}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap gap-3">
                                                    <div className="flex-1 min-w-[100px]">
                                                        <label className="block text-xs text-orange-400 mb-1">Kcal</label>
                                                        <Input type="number" min="0" placeholder="0" value={comida.calorias || ''} onChange={(e) => actualizarComida(index, 'calorias', e.target.value ? Number(e.target.value) : null)} className={`${AppStyles.inputDark.replace("border-white/10","border-orange-500/50")} text-xs border-b-2`} />
                                                    </div>
                                                    <div className="flex-1 min-w-[100px]">
                                                        <label className="block text-xs text-red-400 mb-1">Prot (g)</label>
                                                        <Input type="number" min="0" placeholder="0" value={comida.proteinas || ''} onChange={(e) => actualizarComida(index, 'proteinas', e.target.value ? Number(e.target.value) : null)} className={`${AppStyles.inputDark.replace("border-white/10","border-red-500/50")} text-xs border-b-2`} />
                                                    </div>
                                                    <div className="flex-1 min-w-[100px]">
                                                        <label className="block text-xs text-yellow-400 mb-1">Carb (g)</label>
                                                        <Input type="number" min="0" placeholder="0" value={comida.carbohidratos || ''} onChange={(e) => actualizarComida(index, 'carbohidratos', e.target.value ? Number(e.target.value) : null)} className={`${AppStyles.inputDark.replace("border-white/10","border-yellow-500/50")} text-xs border-b-2`} />
                                                    </div>
                                                    <div className="flex-1 min-w-[100px]">
                                                        <label className="block text-xs text-green-400 mb-1">Grasa (g)</label>
                                                        <Input type="number" min="0" placeholder="0" value={comida.grasas || ''} onChange={(e) => actualizarComida(index, 'grasas', e.target.value ? Number(e.target.value) : null)} className={`${AppStyles.inputDark.replace("border-white/10","border-green-500/50")} text-xs border-b-2`} />
                                                    </div>
                                                </div>
                                            </div>
                                        )})}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
