import { type EmpleadoDTO } from "../../API/Empleados/EmpleadoApi";
import { CloudinaryApi } from "../../Helpers/Cloudinary/Cloudinary";
import { AppStyles } from "../../Styles/AppStyles";
import { Plus, Users } from "lucide-react";
import { ToggleSwitch } from "../../Components/UI/ToggleSwitch";
import { useEmpleadosList } from "../../Hooks/Empleados/useEmpleadosList";

interface Props {
    empleados: EmpleadoDTO[];
    onCreate: () => void;
    onSelect: (empleado: EmpleadoDTO) => void;
}

export const EmpleadosList = ({ empleados, onCreate, onSelect }: Props) => {
    const {
        showInactive,
        setShowInactive,
        empleadosFiltrados
    } = useEmpleadosList(empleados);

    return (
        <div className="w-full max-w-4xl animate-fade-in-up">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h2 className={AppStyles.title}>Personal del Gimnasio</h2>
                <div className="flex items-center gap-4">
                    <ToggleSwitch 
                        checked={showInactive} 
                        onChange={setShowInactive} 
                        label="Mostrar Inactivos" 
                    />
                    <button 
                        onClick={onCreate}
                        className={`${AppStyles.btnPrimary} flex items-center gap-2 px-6`}
                    >
                        <Plus size={20} /> Nuevo Empleado
                    </button>
                </div>
            </div>

            <div className={AppStyles.glassCard}>
                {empleadosFiltrados.length === 0 ? (
                    <div className="text-center text-gray-400 py-10">
                        <div className="flex justify-center text-gray-600 mb-4 scale-150">
                            <Users size={32} />
                        </div>
                        <p>No hay empleados registrados aún.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className={AppStyles.tableHeader}>
                                    <th className="p-4 rounded-tl-lg">Empleado</th>
                                    <th className="p-4">Teléfono</th>
                                    <th className="p-4">Estado</th>
                                    <th className="p-4">Pago</th>
                                    <th className="p-4 rounded-tr-lg text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {empleadosFiltrados.map((emp) => (
                                    <tr 
                                        key={emp.id} 
                                        className={`${AppStyles.tableRow} cursor-pointer group`}
                                        onClick={() => onSelect(emp)}
                                    >
                                        <td className="p-4 flex items-center gap-3">
                                            {emp.fotoPerfil ? (
                                                <img 
                                                    src={CloudinaryApi.getUrl(emp.fotoPerfil) || ''} 
                                                    alt={emp.nombre} 
                                                    className="w-10 h-10 rounded-full object-cover border border-white/10 group-hover:border-green-500/50 transition-colors"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-gray-800 border border-white/10 flex items-center justify-center text-gray-400 font-bold">
                                                    {emp.nombre.charAt(0)}{emp.apellido.charAt(0)}
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-bold text-white group-hover:text-green-400 transition-colors">
                                                    {emp.nombre} {emp.apellido}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-300">
                                            {emp.telefono || '-'}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 text-xs font-bold rounded-lg border ${
                                                emp.activo 
                                                    ? 'bg-green-500/10 text-green-400 border-green-500/30' 
                                                    : 'bg-red-500/10 text-red-400 border-red-500/30'
                                            }`}>
                                                {emp.activo ? 'ACTIVO' : 'INACTIVO'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {emp.pagoMesActual ? (
                                                <span className="px-2 py-1 text-xs font-bold rounded-lg border bg-green-500/10 text-green-400 border-green-500/30">
                                                    Realizado
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 text-xs font-bold rounded-lg border bg-yellow-500/10 text-yellow-400 border-yellow-500/30">
                                                    Pendiente
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            <span className="text-gray-300 group-hover:text-white transition-colors">
                                                Ver Detalle &rarr;
                                            </span>
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
