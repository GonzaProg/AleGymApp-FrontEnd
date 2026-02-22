import { AppStyles } from "../../Styles/AppStyles";
import { Card } from "../../Components/UI/Card";
import { type AlumnoDTO } from "../../API/Usuarios/UsuarioApi";

export const UserDetailView = ({ user, onBack }: { user: AlumnoDTO, onBack: () => void }) => {
    return (
        <div className="w-full max-w-5xl mx-auto mt-14 animate-fade-in-up">
            <button onClick={onBack} className={`${AppStyles.btnBack} mb-8`}>← Volver a la lista</button>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* PERFIL IZQUIERDA */}
                <Card className={AppStyles.glassCard}>
                    <div className="flex flex-col items-center">
                        <div className="w-32 h-32 rounded-full border-4 border-green-500/30 p-1 mb-4 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                            {user.fotoPerfil ? <img src={user.fotoPerfil} className="w-full h-full rounded-full object-cover" /> : <div className="w-full h-full bg-gray-800 rounded-full flex items-center justify-center text-4xl">{user.nombre[0]}</div>}
                        </div>
                        <h2 className="text-2xl font-bold text-white text-center">{user.nombre} {user.apellido}</h2>
                        <span className={`text-xs font-black tracking-tighter uppercase mb-6 mt-2 px-3 py-1 rounded-full ${
                            user.userPlans?.some(up => up.activo) 
                                ? 'text-green-400 bg-green-500/10' 
                                : 'text-red-400 bg-red-500/10'
                        }`}>
                            Alumno {user.userPlans?.some(up => up.activo) ? 'Activo' : 'Inactivo'}
                        </span>
                        
                        <div className="w-full space-y-4 border-t border-white/5 pt-6">
                            <div className="flex justify-between text-sm"><span className="text-gray-500">DNI</span><span className="text-white font-mono text-base">{user.dni}</span></div>
                            <div className="flex justify-between text-sm"><span className="text-gray-500">Teléfono</span><span className="text-white text-base">{user.telefono || '-'}</span></div>
                        </div>
                    </div>
                </Card>

                {/* PLANES DERECHA */}
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="text-xl font-black text-white flex items-center gap-2">
                        <span className="text-green-500">⚡</span> ESTADO DE SUSCRIPCIONES
                    </h3>
                    <div className="grid gap-4">
                        {user.userPlans
                            ?.sort((a, b) => new Date(a.fechaVencimiento).getTime() - new Date(b.fechaVencimiento).getTime())
                            .slice(-5)
                            .map(up => (
                            <div key={up.id} className={`p-6 rounded-2xl border flex justify-between items-center bg-gray-900/60 backdrop-blur-md relative overflow-hidden ${up.activo ? 'border-green-500/30' : 'border-red-500/20 opacity-60'}`}>
                                {up.activo && <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500"></div>}
                                <div>
                                    <h4 className="text-lg font-bold text-white">{up.plan.nombre}</h4>
                                    <p className="text-xs text-gray-500 uppercase font-bold">{up.plan.tipo}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-500 font-bold">VENCIMIENTO</p>
                                    <p className={`font-mono ${up.activo ? 'text-green-400' : 'text-red-400'}`}>
                                        {new Date(up.fechaVencimiento).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {(!user.userPlans || user.userPlans.length === 0) && (
                            <div className="p-10 border border-dashed border-white/10 rounded-2xl text-center text-gray-500 italic">No registra planes en la base de datos</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};