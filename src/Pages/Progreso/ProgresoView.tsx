import { useState } from "react";
import { MyPersonalRecords } from "../PersonalRecords/MyPersonalRecords";
import { EvolucionCorporal } from "../Evoluciones/EvolucionCorporal";

export const ProgresoView = ({ currentUser }: { currentUser: any }) => {
    const [tab, setTab] = useState<'prs' | 'cuerpo'>('prs');

    return (
        <div className="mt-24 px-4 pb-24 max-w-2xl mx-auto h-full flex flex-col">
            
            {/* CABECERA Y TOGGLE FACHERO */}
            <div className="mb-6 shrink-0">
                
                <div className="bg-gray-900/80 p-1 rounded-xl flex items-center border border-white/5 relative">
                    {/* Fondo animado */}
                    <div 
                        className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-green-500 rounded-lg shadow-lg transition-transform duration-300 ease-out ${tab === 'cuerpo' ? 'translate-x-[100%]' : 'translate-x-0'}`}
                    ></div>

                    <button 
                        onClick={() => setTab('prs')}
                        className={`flex-1 py-2.5 text-sm font-bold z-10 transition-colors duration-300 ${tab === 'prs' ? 'text-gray-950' : 'text-gray-400'}`}
                    >
                        Récords (PR)
                    </button>
                    <button 
                        onClick={() => setTab('cuerpo')}
                        className={`flex-1 py-2.5 text-sm font-bold z-10 transition-colors duration-300 ${tab === 'cuerpo' ? 'text-gray-950' : 'text-gray-400'}`}
                    >
                        Peso Corporal
                    </button>
                </div>
            </div>

            {/* CONTENIDO DINÁMICO */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {tab === 'prs' ? (
                    <MyPersonalRecords />
                ) : (
                    <EvolucionCorporal currentUser={currentUser} />
                )}
            </div>

        </div>
    );
};