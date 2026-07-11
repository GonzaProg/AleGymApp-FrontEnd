import type { EmpleadoDTO } from "../../API/Empleados/EmpleadoApi";
import { CloudinaryApi } from "../../Helpers/Cloudinary/Cloudinary";
import { AppStyles } from "../../Styles/AppStyles";
import { Edit } from "lucide-react";
import { useEmpleadoDetail } from "../../Hooks/Empleados/useEmpleadoDetail";

interface Props {
    empleado: EmpleadoDTO;
    onBack: () => void;
    onEdit: () => void;
    onPay: () => void;
    onRefresh: () => void;
    gymId: number;
}

export const EmpleadoDetail = ({ empleado, onBack, onEdit, onPay, onRefresh, gymId }: Props) => {
    const {
        pagos,
        loading,
        handleToggleStatus
    } = useEmpleadoDetail(gymId, empleado, onRefresh, onBack);

    return (
        <div className="w-full max-w-4xl animate-fade-in-right">
            {/* Cabecera / Controles */}
            <div className="flex justify-between items-center mb-6">
                <button onClick={onBack} className={AppStyles.btnBack}>
                    &larr; Volver a la lista
                </button>
                <div className="flex gap-2">
                    <button onClick={onEdit} className={`${AppStyles.btnEdit} flex items-center gap-2`}>
                        <Edit size={16}/> Editar
                    </button>
                    <button onClick={handleToggleStatus} className={AppStyles.btnDelete}>
                        {empleado.activo ? 'Dar de Baja' : 'Reactivar'}
                    </button>
                </div>
            </div>

            {/* Perfil del Empleado */}
            <div className={`${AppStyles.glassCard} mb-6 flex flex-col md:flex-row items-center md:items-start gap-6`}>
                <div className="shrink-0">
                    {empleado.fotoPerfil ? (
                        <img 
                            src={CloudinaryApi.getUrl(empleado.fotoPerfil) || ''} 
                            alt={empleado.nombre} 
                            className="w-32 h-32 rounded-full object-cover border-4 border-gray-800 shadow-xl"
                        />
                    ) : (
                        <div className="w-32 h-32 rounded-full bg-gray-800 border-4 border-gray-700 flex items-center justify-center text-gray-400 font-bold text-4xl shadow-xl">
                            {empleado.nombre.charAt(0)}{empleado.apellido.charAt(0)}
                        </div>
                    )}
                </div>
                <div className="flex-1 text-center md:text-left space-y-2">
                    <h2 className="text-3xl font-bold text-white">{empleado.nombre} {empleado.apellido}</h2>
                    <p className="text-gray-400 text-lg flex items-center justify-center md:justify-start gap-2">
                        <span>Tel: {empleado.telefono || 'No especificado'}</span>
                    </p>
                    <p className="text-sm text-gray-500">
                        Registrado el: {new Date(empleado.fechaCreacion).toLocaleDateString()}
                    </p>
                    <div className="mt-2">
                        <span className={`px-3 py-1 text-sm font-bold rounded-lg border inline-block ${
                            empleado.activo 
                                ? 'bg-green-500/10 text-green-400 border-green-500/30' 
                                : 'bg-red-500/10 text-red-400 border-red-500/30'
                        }`}>
                            {empleado.activo ? 'EMPLEADO ACTIVO' : 'EMPLEADO INACTIVO'}
                        </span>
                    </div>
                </div>
                <div className="shrink-0 w-full md:w-auto mt-4 md:mt-0">
                    <button 
                        onClick={onPay}
                        disabled={!empleado.activo}
                        className={`${AppStyles.btnPrimary} w-full md:w-auto ${!empleado.activo ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        Asignar Pago
                    </button>
                </div>
            </div>

            {/* Historial de Pagos */}
            <div className={AppStyles.glassCard}>
                <h3 className={AppStyles.sectionTitle}>Historial de Pagos / Sueldos</h3>
                {loading ? (
                    <div className="text-center text-gray-400 py-6">Cargando pagos...</div>
                ) : pagos.length === 0 ? (
                    <div className="text-center text-gray-400 py-6">
                        No hay pagos registrados para este empleado.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className={AppStyles.tableHeader}>
                                    <th className="p-4 rounded-tl-lg">Fecha</th>
                                    <th className="p-4">Concepto</th>
                                    <th className="p-4">Método</th>
                                    <th className="p-4 rounded-tr-lg text-right">Monto</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pagos.map((pago) => (
                                    <tr key={pago.id} className={AppStyles.tableRow}>
                                        <td className="p-4 text-gray-300">
                                            {new Date(pago.fechaPago).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-gray-300">
                                            {pago.concepto || '-'}
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 text-xs font-bold rounded-lg border bg-blue-500/10 text-blue-400 border-blue-500/30">
                                                {pago.metodoPago}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right font-bold text-red-400">
                                            ${Number(pago.monto).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
