import { EmpleadosList } from "./EmpleadosList";
import { EmpleadoDetail } from "./EmpleadoDetail";
import { EmpleadoForm } from "./EmpleadoForm";
import { PagoEmpleadoForm } from "./PagoEmpleadoForm";
import { Loader2 } from "lucide-react";
import { AppStyles } from "../../Styles/AppStyles";
import { UnlockSection } from "../../Components/Security/UnlockSection";
import { useEmpleadosManager } from "../../Hooks/Empleados/useEmpleadosManager";

export const EmpleadosManager = () => {
    const {
        gymId,
        view,
        empleados,
        ultimosPagos,
        selectedEmpleado,
        loading,
        isUnlocked,
        passwordInput,
        setPasswordInput,
        verifying,
        handleDesbloquear,
        loadData,
        handleCreate,
        handleEdit,
        handleSelect,
        handlePay,
        handleBackToList,
        handleBackToDetail
    } = useEmpleadosManager();

    if (loading) {
        return (
            <div className={`${AppStyles.principalContainer} flex justify-center items-center h-full`}>
                <Loader2 className="animate-spin text-green-500 w-12 h-12" />
            </div>
        );
    }

    return (
        <div className={AppStyles.principalContainer}>
            {!isUnlocked ? (
                <UnlockSection 
                    passwordInput={passwordInput}
                    setPasswordInput={setPasswordInput}
                    handleDesbloquear={handleDesbloquear}
                    verifying={verifying}
                    className="pt-20"
                />
            ) : (
                <>
                    {view === 'list' && (
                <>
                    <EmpleadosList 
                        empleados={empleados} 
                        onCreate={handleCreate} 
                        onSelect={handleSelect} 
                    />
                    
                    {/* Lista de últimos pagos */}
                    <div className="mt-8 w-full max-w-4xl animate-fade-in-up">
                        <h2 className={AppStyles.title}>Últimos 10 Pagos a Empleados</h2>
                        <div className={`${AppStyles.glassCard} overflow-x-auto mt-4`}>
                            {ultimosPagos.length === 0 ? (
                                <p className="text-gray-400">No hay pagos registrados.</p>
                            ) : (
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className={AppStyles.tableHeader}>
                                            <th className="p-4 rounded-tl-lg">Fecha</th>
                                            <th className="p-4">Empleado</th>
                                            <th className="p-4">Concepto</th>
                                            <th className="p-4">Método</th>
                                            <th className="p-4 rounded-tr-lg text-right">Monto</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ultimosPagos.map((pago: any) => (
                                            <tr key={pago.id} className={`${AppStyles.tableRow}`}>
                                                <td className="p-4 text-gray-300">
                                                    {new Date(pago.fechaPago).toLocaleDateString()}
                                                </td>
                                                <td className="p-4 text-white font-bold">
                                                    {pago.empleado?.nombre} {pago.empleado?.apellido}
                                                </td>
                                                <td className="p-4 text-gray-300">
                                                    {pago.concepto || '-'}
                                                </td>
                                                <td className="p-4">
                                                    <span className="px-2 py-1 text-xs font-bold rounded-lg border bg-blue-500/10 text-blue-400 border-blue-500/30">
                                                        {pago.metodoPago}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right text-red-400 font-bold">
                                                    ${Number(pago.monto).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </>
            )}
            
            {view === 'detail' && selectedEmpleado && (
                <EmpleadoDetail 
                    empleado={selectedEmpleado} 
                    onBack={handleBackToList} 
                    onEdit={() => handleEdit(selectedEmpleado)} 
                    onPay={() => handlePay(selectedEmpleado)}
                    onRefresh={loadData}
                    gymId={gymId}
                />
            )}

            {(view === 'create' || view === 'edit') && (
                <EmpleadoForm 
                    empleadoToEdit={selectedEmpleado} 
                    onBack={view === 'edit' ? handleBackToDetail : handleBackToList} 
                    onSuccess={view === 'edit' ? handleBackToDetail : handleBackToList}
                    gymId={gymId}
                />
            )}

            {view === 'pay' && selectedEmpleado && (
                <PagoEmpleadoForm 
                    empleado={selectedEmpleado} 
                    onBack={handleBackToDetail} 
                    onSuccess={handleBackToDetail}
                    gymId={gymId}
                />
            )}
                </>
            )}
        </div>
    );
};
