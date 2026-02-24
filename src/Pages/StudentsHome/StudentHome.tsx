import { useState } from "react";
import { AppStyles } from "../../Styles/AppStyles";
import { useStudentHome } from "../../Hooks/StudentsHome/useStudentHome";

export const StudentHome = ({ currentUser }: { currentUser: any }) => {
    const [isInfoOpen, setIsInfoOpen] = useState(false);
    
    // Conectamos con nuestro nuevo Hook
    const { concurrencia, loadingConcurrencia, isCheckingIn, handleCheckIn } = useStudentHome(currentUser);

    // Lógica simple para cambiar el texto y color según la cantidad de gente
    const getMensajeConcurrencia = (cantidad: number) => {
        if (cantidad <= 6) return { texto: "Está súper tranquilo. ¡Es el momento perfecto para entrenar!", color: "text-green-400" };
        if (cantidad > 6 && cantidad <= 12) return { texto: "Hay movimiento, pero no es excusa para no entrenar. ¡Vamos!", color: "text-yellow-400" };
        return { texto: "Está bastante lleno, ¿Entrenamos más tarde?", color: "text-orange-400" };
    };

    return (
        <div className="mt-24 p-4 animate-fade-in pb-24 space-y-6 max-w-lg mx-auto relative">
            
            {/* SALUDO INICIAL */}
            <div className="mb-8 px-2">
                <h1 className="text-3xl font-black text-white mb-2 tracking-tight">
                    Hola, <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">{currentUser?.nombre}</span> 👋
                </h1>
                <p className="text-gray-400 text-lg font-medium">¿Qué vamos a entrenar hoy?</p>
            </div>

            {/* BOTÓN GIGANTE DE CHECK-IN */}
            <button 
                onClick={handleCheckIn}
                disabled={isCheckingIn}
                className={`w-full ${AppStyles.btnPrimary} flex flex-col items-center justify-center gap-2 py-6 relative overflow-hidden group`}
            >
                {/* Brillo de fondo animado */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                
                <span className="text-4xl">{isCheckingIn ? "⏳" : "📍"}</span>
                <span className="text-lg font-black tracking-wider">
                    {isCheckingIn ? "Registrando..." : "Registrar Entrada"}
                </span>
                <span className="text-xs font-normal text-white/80">Toca aquí al llegar al gimnasio</span>
            </button>

            {/* ACORDEÓN DE INFORMACIÓN */}
            <div className={AppStyles.glassCard.replace("p-8", "p-2")}>
                <button 
                    onClick={() => setIsInfoOpen(!isInfoOpen)}
                    className="w-full p-2 flex items-center justify-between hover:bg-white/5 transition-colors rounded-2xl"
                >
                    <h3 className="text-blue-400 font-bold flex items-center gap-2 text-sm">
                        <span>ℹ️</span> ¿Cómo funciona esto?
                    </h3>
                    <span className={`text-gray-400 transition-transform duration-300 ${isInfoOpen ? 'rotate-180' : ''}`}>
                        ▼
                    </span>
                </button>

                <div className={`transition-all duration-500 ease-in-out px-4 ${isInfoOpen ? 'max-h-[500px] opacity-100 pb-4' : 'max-h-0 opacity-0'}`}>
                    <div className="pt-4 border-t border-white/10 text-gray-300 text-sm leading-relaxed">
                        <p>
                            ¡Ayúdanos a mantener la información actualizada! 🤝<br/><br/>
                            Toca el botón <strong>"Registrar Entrada"</strong> cada vez que llegues al gimnasio.<br/><br/>
                            Esto nos permite calcular cuánta gente hay entrenando en tiempo real para que todos puedan planificar mejor sus horarios. (Tu salida se calcula sola después de 90 mins).
                        </p>
                    </div>
                </div>
            </div>

            {/* TARJETA DE CONCURRENCIA */}
            <div className={`${AppStyles.glassCard} relative overflow-hidden border-green-500/30 shadow-lg shadow-green-900/10`}>
                <div className="absolute top-0 right-0 w-40 h-40 bg-green-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                
                <div className="relative z-10 flex items-start gap-4">
                    <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/10 p-4 rounded-2xl flex-shrink-0 border border-green-500/30 shadow-inner">
                        <span className="text-3xl">🔥</span>
                    </div>
                    
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                            </span>
                            <h3 className="text-green-400 font-bold tracking-widest uppercase text-[10px]">En Vivo</h3>
                        </div>
                        
                        {loadingConcurrencia ? (
                            <div className="animate-pulse flex flex-col gap-2 mb-2">
                                <div className="h-6 bg-white/10 rounded w-3/4"></div>
                                <div className="h-4 bg-white/5 rounded w-full"></div>
                            </div>
                        ) : (
                            <>
                                <p className="text-white font-medium text-lg leading-tight mb-2">
                                    Hay aprox. <span className="font-black text-xl">{concurrencia} personas</span>.
                                </p>
                                <p className={`text-sm leading-relaxed font-semibold ${getMensajeConcurrencia(concurrencia || 0).color}`}>
                                    {getMensajeConcurrencia(concurrencia || 0).texto}
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </div>
            
        </div>
    );
};