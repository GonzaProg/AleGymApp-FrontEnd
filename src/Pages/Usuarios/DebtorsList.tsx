import { useState, useEffect } from "react";
import { PagosApi } from "../../API/Pagos/PagosApi";
import { ArrowLeft, UsersRound, Calendar, FileText, FileSpreadsheet } from "lucide-react";
import { CustomSelect } from "../../Components/UI/CustomSelect";
import { AppStyles } from "../../Styles/AppStyles";

interface DebtorsListProps {
    onBack: () => void;
}

export const DebtorsList = ({ onBack }: DebtorsListProps) => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // 1-12

    const [year, setYear] = useState(currentYear);
    const [month, setMonth] = useState(currentMonth);
    const [debtors, setDebtors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const availableYears = Array.from(
        { length: Math.max(0, currentYear - 2026 + 1) },
        (_, i) => 2026 + i
    ).reverse();

    if (availableYears.length === 0) availableYears.push(2026);

    const mesesOptions = [
        { value: '1', label: 'Enero' },
        { value: '2', label: 'Febrero' },
        { value: '3', label: 'Marzo' },
        { value: '4', label: 'Abril' },
        { value: '5', label: 'Mayo' },
        { value: '6', label: 'Junio' },
        { value: '7', label: 'Julio' },
        { value: '8', label: 'Agosto' },
        { value: '9', label: 'Septiembre' },
        { value: '10', label: 'Octubre' },
        { value: '11', label: 'Noviembre' },
        { value: '12', label: 'Diciembre' }
    ];

    useEffect(() => {
        const fetchDebtors = async () => {
            setLoading(true);
            try {
                const data = await PagosApi.getDeudores(year, month);
                setDebtors(data);
            } catch (error) {
                console.error("Error fetching debtors", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDebtors();
    }, [year, month]);

    const handleExportExcel = async () => {
        try {
            const blob = await PagosApi.exportDeudoresExcel(year, month);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Deudores_${mesesOptions[month - 1].label}_${year}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error("Error al exportar a Excel", error);
        }
    };

    const handleExportPDF = async () => {
        try {
            const blob = await PagosApi.exportDeudoresPDF(year, month);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Deudores_${mesesOptions[month - 1].label}_${year}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error("Error al exportar a PDF", error);
        }
    };

    return (
        <div className="w-full max-w-[95%] mx-auto space-y-6 animate-fade-in relative">
            {/* Header */}
            <div className="bg-gray-800/40 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 relative">
                
                {/* Decoración absolute */}
                <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500"></div>
                </div>
                
                <div className="flex items-center gap-4">
                    <button 
                        onClick={onBack}
                        className="p-2 hover:bg-white/10 rounded-xl transition-colors text-gray-400 hover:text-white border border-white/5"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <UsersRound className="text-red-400" size={24} />
                            Lista de Deudores
                        </h2>
                        <p className="text-gray-400 text-sm">Alumnos sin pagos registrados</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 z-20 items-center justify-center">
                    <button 
                        onClick={handleExportPDF}
                        title="Exportar a PDF"
                        className={AppStyles.btnExportRed}
                    >
                        <FileText className="w-5 h-5" />
                        <p className="pl-2">PDF</p>
                    </button>
                    <button 
                        onClick={handleExportExcel}
                        title="Exportar a Excel"
                        className={AppStyles.btnExportGreen}
                    >
                        <FileSpreadsheet className="w-5 h-5" />
                        <p className="pl-2">Excel</p>
                    </button>
                    <div className="w-36">
                        <CustomSelect 
                            options={mesesOptions}
                            value={month.toString()}
                            onChange={(val) => setMonth(Number(val))}
                            icon={<Calendar className="w-4 h-4" />}
                            className="w-full"
                        />
                    </div>
                    <div className="w-28">
                        <CustomSelect 
                            options={availableYears.map(y => ({ value: y.toString(), label: y.toString() }))}
                            value={year.toString()}
                            onChange={(val) => setYear(Number(val))}
                            icon={<Calendar className="w-4 h-4" />}
                            className="w-full"
                        />
                    </div>
                </div>
            </div>

            {/* Debtors Table */}
            <div className="bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                {loading ? (
                    <div className="p-20 flex flex-col items-center justify-center space-y-4">
                        <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-gray-400 font-medium">Buscando deudores...</p>
                    </div>
                ) : debtors.length === 0 ? (
                    <div className="p-20 text-center text-gray-500">
                        No se encontraron deudores para {mesesOptions[month - 1].label} {year}.
                    </div>
                ) : (
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-black/40 border-b border-white/10">
                                    <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider sticky left-0 bg-[#1a1225] z-10 min-w-[250px]">
                                        Alumno
                                    </th>
                                    <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center border-l border-white/5">
                                        DNI
                                    </th>
                                    <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center border-l border-white/5">
                                        Teléfono
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {debtors.map((user) => (
                                    <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="p-4 sticky left-0 bg-[#1a1225]/80 backdrop-blur-md group-hover:bg-[#24192f] transition-colors z-10">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-800 border border-white/10 shrink-0">
                                                    {user.fotoPerfil ? (
                                                        <img src={user.fotoPerfil} className="w-full h-full object-cover" alt="Perfil" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-red-400 font-bold text-sm bg-red-500/10">
                                                            {user.nombre[0]}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-white font-bold text-sm group-hover:text-red-400 transition-colors">
                                                        {user.apellido} {user.nombre}
                                                    </p>
                                                    <p className="text-gray-500 text-[10px] font-mono">DNI: {user.dni}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center border-l border-white/5 align-middle text-gray-300 font-mono text-sm">
                                            {user.dni}
                                        </td>
                                        <td className="p-4 text-center border-l border-white/5 align-middle text-gray-300 font-mono text-sm">
                                            {user.telefono || '--'}
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
