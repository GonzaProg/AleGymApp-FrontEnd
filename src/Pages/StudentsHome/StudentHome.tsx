import { useState } from "react";
import { AppStyles } from "../../Styles/AppStyles";

export const StudentHome = ({ currentUser }: { currentUser: any }) => {
    // Valor mockeado por ahora. Más adelante lo traerás del backend.
    const estimatedPeople = 4;
    
    // Estado para controlar el acordeón de información
    const [isInfoOpen, setIsInfoOpen] = useState(false);

    return (
        <div className="mt-24 p-4 animate-fade-in pb-24 space-y-6 max-w-lg mx-auto relative">
            
            {/* SALUDO INICIAL */}
            <div className="mb-10 px-2">
                <h1 className="text-3xl font-black text-white mb-2 tracking-tight">
                    Hola, <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">{currentUser?.nombre}</span> 👋
                </h1>
                <p className="text-gray-400 text-lg font-medium">¿Qué vamos a entrenar hoy?</p>
            </div>

                        {/* ACORDEÓN DE INFORMACIÓN (AVISO DE BETA) */}
            <div className={AppStyles.glassCard.replace("p-8", "p-2")}>
                <button 
                    onClick={() => setIsInfoOpen(!isInfoOpen)}
                    className="w-full p-2 flex items-center justify-between hover:bg-white/5 transition-colors rounded-2xl"
                >
                    <h3 className="text-blue-400 font-bold flex items-center gap-2 text-sm">
                        <span>ℹ️</span> Información
                    </h3>
                    <span className={`text-gray-400 transition-transform duration-300 ${isInfoOpen ? 'rotate-180' : ''}`}>
                        ▼
                    </span>
                </button>

                <div className={`transition-all duration-500 ease-in-out px-4 ${isInfoOpen ? 'max-h-[500px] opacity-100 pb-4' : 'max-h-0 opacity-0'}`}>
                    <div className="pt-4 border-t border-white/10 text-gray-300 text-sm leading-relaxed">
                        <p>
                            <strong className="text-yellow-400 text-base">¡Funcionalidad en Desarrollo!</strong> 🚧<br/><br/>
                            El indicador de personas en el gimnasio actualmente es una <strong>versión de prueba (Beta)</strong>. Estoy terminando de desarrollar el sistema para medir la concurrencia real.<br/><br/>
                            Por el momento, el número mostrado es solo un ejemplo, ¡así que no le hagas mucho caso todavía!
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
                    
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                            </span>
                            <h3 className="text-green-400 font-bold tracking-widest uppercase text-[10px]">En Vivo</h3>
                        </div>
                        
                        <p className="text-white font-medium text-lg leading-tight mb-2">
                            Hay aprox. <span className="text-green-400 font-black text-xl">{estimatedPeople} personas</span>.
                        </p>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Es el momento perfecto para entrenar y aprovechar las máquinas libres. ¡A darle!
                        </p>
                    </div>
                </div>
            </div>
            
        </div>
    );
};