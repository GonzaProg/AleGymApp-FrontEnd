import { AppStyles } from "../../Styles/AppStyles";
import { Button } from "../../Components/UI/Button";
import { ClipboardList, Plus, ChevronDown, ChevronUp, Trash2, Pen, CheckCircle2, Circle, BadgeDollarSign } from "lucide-react";
import { useNotasManager } from "../../Hooks/Notas/useNotasManager";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export const NotasManager = ({ onNavigate }: { onNavigate?: (tab: string) => void }) => {
    const {
        notas,
        loading,
        verTodas,
        handleToggleVerTodas,
        concepto,
        setConcepto,
        handleCrearNota,
        submitting,
        handleToggleResuelta,
        handleEditarNota,
        handleEliminarNota,
        handleConvertToGasto
    } = useNotasManager(onNavigate);

    const navigate = useNavigate();
    const location = useLocation();

    // Determinar si debemos mostrar el botón de volver
    const showBackButton = location.key !== "default";
    const handleBack = () => navigate(-1);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="p-4 w-full space-y-8 animate-fade-in relative transition-all duration-300">
            {/* ENCABEZADO */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    {showBackButton && (
                        <button 
                            onClick={handleBack}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white lg:hidden"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                    )}
                    <div className="p-3 bg-blue-500/20 rounded-xl">
                        <ClipboardList className="w-8 h-8 text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-white tracking-tight">Notas y Recordatorios</h2>
                        <p className="text-gray-400 mt-1">Gestiona tareas pendientes, reparaciones o notas del gimnasio.</p>
                    </div>
                </div>
            </div>

            {/* CONTENIDO */}
            <div className="flex flex-col gap-8 mt-8">
                {/* FORMULARIO DE CREACIÓN */}
                <div className="w-full max-w-xl mx-auto">
                    <div className={`${AppStyles.glassCard} p-6 sticky top-8`}>
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
                            <Plus className="w-5 h-5 text-blue-400" />
                            Nueva Nota
                        </h3>
                        
                        <form onSubmit={handleCrearNota} className="space-y-6">
                            <div>
                                <label className={AppStyles.label}>Concepto / Tarea</label>
                                <textarea
                                    value={concepto}
                                    onChange={(e) => {
                                        setConcepto(e.target.value);
                                        e.target.style.height = 'auto';
                                        e.target.style.height = `${e.target.scrollHeight}px`;
                                    }}
                                    placeholder="Ej: Mantenimiento cinta 2"
                                    className={`${AppStyles.inputDark} resize-none overflow-hidden min-h-[42px]`}
                                    rows={1}
                                />
                            </div>
                            
                            <Button 
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 mt-4 shadow-lg shadow-blue-500/20"
                            >
                                {submitting ? "Guardando..." : "Registrar Nota"}
                            </Button>
                        </form>
                    </div>
                </div>

                {/* LISTADO */}
                <div className="w-full">
                    <div className={`${AppStyles.glassCard} p-0 overflow-hidden`}>
                        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/20">
                            <h3 className="text-lg font-bold text-white">
                                Historial de Notas
                            </h3>
                            <Button 
                                onClick={handleToggleVerTodas}
                                className="text-xs bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 flex items-center gap-2"
                            >
                                {verTodas ? <><ChevronUp className="w-4 h-4"/> Ver Últimas 10</> : <><ChevronDown className="w-4 h-4"/> Ver Todas</>}
                            </Button>
                        </div>

                        {loading ? (
                            <div className="text-center py-20 animate-pulse text-gray-400">Cargando notas...</div>
                        ) : notas.length === 0 ? (
                            <div className="text-center py-16">
                                <p className="text-gray-500">No hay notas registradas.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-black/10 text-gray-400 text-xs font-bold uppercase tracking-wider border-b border-white/5">
                                            <th className="px-6 py-4 w-12 text-center">Estado</th>
                                            <th className="px-6 py-4">Fecha</th>
                                            <th className="px-6 py-4">Concepto</th>
                                            <th className="px-6 py-4 text-center">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 text-sm">
                                        {notas.map((nota) => (
                                            <tr key={nota.id} className={`hover:bg-white/5 transition-colors group ${nota.resuelta ? 'opacity-60' : ''}`}>
                                                <td className="px-6 py-4 text-center">
                                                    <button 
                                                        onClick={() => handleToggleResuelta(nota)}
                                                        className={`transition-colors p-1 rounded-full ${nota.resuelta ? 'text-green-500 hover:text-green-400' : 'text-gray-500 hover:text-gray-400'}`}
                                                        title={nota.resuelta ? "Marcar como pendiente" : "Marcar como resuelta"}
                                                    >
                                                        {nota.resuelta ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                                                    </button>
                                                </td>
                                                <td className={`px-6 py-4 font-mono text-gray-400 ${nota.resuelta ? 'line-through' : ''}`}>{formatDate(nota.fechaNota)}</td>
                                                <td className={`px-6 py-4 text-gray-300 whitespace-pre-wrap break-words max-w-lg ${nota.resuelta ? 'line-through' : ''}`}>{nota.concepto}</td>
                                                <td className="px-6 py-4 text-center space-x-2">
                                                    <button 
                                                        onClick={() => handleConvertToGasto(nota)}
                                                        className={AppStyles.btnIconBase + " bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-black border-green-500/20"}
                                                        title="Pagar gasto correspondiente a la nota"
                                                    >
                                                        <BadgeDollarSign className="inline w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleEditarNota(nota)}
                                                        className={AppStyles.btnEdit}
                                                        title="Editar Nota"
                                                    >
                                                        <Pen className="inline w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleEliminarNota(nota.id)}
                                                        className={AppStyles.btnDelete}
                                                        title="Eliminar Nota"
                                                    >
                                                        <Trash2 className="inline w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
