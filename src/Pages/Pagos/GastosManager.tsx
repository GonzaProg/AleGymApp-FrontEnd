import { useState } from "react";
import { useGastosManager } from "../../Hooks/Finanzas/useGastosManager";
import { AppStyles } from "../../Styles/AppStyles";
import { Input } from "../../Components/UI/Input";
import { Button } from "../../Components/UI/Button";
import { Lock, Wallet, Receipt, Undo2, ChevronDown, ChevronUp } from "lucide-react";
import { GymApi } from "../../API/Gym/GymApi";
import { showError, showSuccess } from "../../Helpers/Alerts";

export const GastosManager = () => {
    const {
        gastos,
        loading,
        verTodos,
        handleToggleVerTodos,
        monto,
        setMonto,
        concepto,
        setConcepto,
        fechaGasto,
        setFechaGasto,
        handleCrearGasto,
        submitting,
        handleRevertirGasto
    } = useGastosManager();

    // Estados para la Contraseña Financiera
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [passwordInput, setPasswordInput] = useState("");
    const [verifying, setVerifying] = useState(false);

    const handleDesbloquear = async () => {
        if (!passwordInput.trim()) return;
        setVerifying(true);
        try {
            const res = await GymApi.verifyFinancePassword(passwordInput);
            if (res.success) {
                setIsUnlocked(true);
                setPasswordInput("");
                showSuccess("Acceso a Gastos desbloqueado");
            }
        } catch (error) {
            showError("Contraseña incorrecta");
        } finally {
            setVerifying(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency', currency: 'ARS', minimumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString: string | Date) => {
        return new Date(dateString).toLocaleString('es-AR', {
            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className={AppStyles.principalContainer}>
            {!isUnlocked ? (
                <div className="flex justify-center items-center pt-20">
                    <div className={`${AppStyles.glassCard} flex flex-col items-center justify-center p-8 border-red-500/30 text-center w-full max-w-md`}>
                        <Lock className="w-12 h-12 text-red-400 mb-6" />
                        <h2 className="text-xl font-bold text-white mb-4">Acceso Restringido</h2>
                        <div className="flex flex-col sm:flex-row gap-3 w-full">
                            <Input 
                                type="password" 
                                placeholder="Contraseña" 
                                value={passwordInput} 
                                onChange={(e) => setPasswordInput(e.target.value)} 
                                className={`${AppStyles.inputDark} text-center tracking-[0.3em] font-mono`}
                                onKeyDown={(e) => e.key === 'Enter' && handleDesbloquear()}
                            />
                            <Button 
                                onClick={handleDesbloquear} 
                                disabled={verifying}
                                className="bg-red-600/50 hover:bg-red-500 text-white font-bold px-6 border-0"
                            >
                                {verifying ? "Verificando..." : "Desbloquear"}
                            </Button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="w-full max-w-5xl mx-auto space-y-8 animate-fade-in-up">
                    <div className="flex items-center gap-3">
                        <Wallet className="w-8 h-8 text-orange-400" />
                        <div>
                            <h1 className={AppStyles.title}>Control de Gastos</h1>
                            <p className={AppStyles.subtitle}>Registra y administra los gastos del gimnasio. Estos se descontarán automáticamente de los ingresos.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* FORMULARIO */}
                        <div className="lg:col-span-1">
                            <form onSubmit={handleCrearGasto} className={`${AppStyles.glassCard} sticky top-24`}>
                                <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
                                    <Receipt className="w-5 h-5 text-green-400" /> Registrar Gasto
                                </h3>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className={AppStyles.label}>Monto del gasto ($)</label>
                                        <Input
                                            type="number"
                                            value={monto}
                                            onChange={(e) => setMonto(e.target.value)}
                                            placeholder="Ej: 15000"
                                            className={AppStyles.inputDark}
                                            min="0"
                                        />
                                    </div>
                                    <div>
                                        <label className={AppStyles.label}>Concepto / Motivo</label>
                                        <Input
                                            value={concepto}
                                            onChange={(e) => setConcepto(e.target.value)}
                                            placeholder="Ej: Mantenimiento poleas"
                                            className={AppStyles.inputDark}
                                        />
                                    </div>
                                    <div>
                                        <label className={AppStyles.label}>Fecha</label>
                                        <Input
                                            type="date"
                                            value={fechaGasto}
                                            onChange={(e) => setFechaGasto(e.target.value)}
                                            className={AppStyles.inputDark}
                                        />
                                    </div>
                                    
                                    <Button 
                                        type="submit" 
                                        disabled={submitting}
                                        className="w-full mt-4 bg-green-500 hover:bg-green-600 text-black font-bold"
                                    >
                                        {submitting ? "Registrando..." : "Guardar Gasto"}
                                    </Button>
                                </div>
                            </form>
                        </div>

                        {/* LISTADO */}
                        <div className="lg:col-span-2">
                            <div className={`${AppStyles.glassCard} p-0 overflow-hidden`}>
                                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/20">
                                    <h3 className="text-lg font-bold text-white">
                                        Historial de Gastos
                                    </h3>
                                    <Button 
                                        onClick={handleToggleVerTodos}
                                        className="text-xs bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 flex items-center gap-2"
                                    >
                                        {verTodos ? <><ChevronUp className="w-4 h-4"/> Ver Últimos 10</> : <><ChevronDown className="w-4 h-4"/> Ver Todos</>}
                                    </Button>
                                </div>

                                {loading ? (
                                    <div className="text-center py-20 animate-pulse text-gray-400">Cargando gastos...</div>
                                ) : gastos.length === 0 ? (
                                    <div className="text-center py-16">
                                        <p className="text-gray-500">No hay gastos registrados.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-black/10 text-gray-400 text-xs font-bold uppercase tracking-wider border-b border-white/5">
                                                    <th className="px-6 py-4">Fecha</th>
                                                    <th className="px-6 py-4">Concepto</th>
                                                    <th className="px-6 py-4 text-right">Monto</th>
                                                    <th className="px-6 py-4 text-center">Acción</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5 text-sm">
                                                {gastos.map((gasto) => (
                                                    <tr key={gasto.id} className="hover:bg-white/5 transition-colors group">
                                                        <td className="px-6 py-4 font-mono text-gray-400">{formatDate(gasto.fechaGasto)}</td>
                                                        <td className="px-6 py-4 text-gray-300">{gasto.concepto}</td>
                                                        <td className="px-6 py-4 text-right font-mono text-base text-red-400 font-bold">
                                                            -{formatCurrency(gasto.monto)}
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <button 
                                                                onClick={() => handleRevertirGasto(gasto.id)}
                                                                className="text-gray-500 hover:text-red-400 transition-colors p-2 rounded hover:bg-red-500/10"
                                                                title="Revertir Gasto"
                                                            >
                                                                <Undo2 className="inline w-4 h-4 mr-1" /> Revertir
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
            )}
        </div>
    );
};
