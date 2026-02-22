import { useState } from "react"; // <-- Importamos useState aquí
import { createPortal } from "react-dom";
import { AppStyles } from "../../Styles/AppStyles";
import { CloudinaryApi } from "../../Helpers/Cloudinary/Cloudinary";
import { usePersonalRecords } from "../../Hooks/PersonalRecords/usePersonalRecords";
import { VideoEjercicio } from "../../Components/VideoEjercicios/VideoEjercicio"; 

export const MyPersonalRecords = () => {
    const {
        prs, ejercicios, busqueda, loading,
        ejercicioId: _ejercicioId, peso, videoPreview, editandoId, fileInputRef, videoSeleccionado,
        isFormOpen, ejercicioSearch, showDropdown, 
        isSaveDisabled, esDuplicado, prExistente,
        setBusqueda, setEjercicioId, setPeso, setVideoSeleccionado, setIsFormOpen,
        setEjercicioSearch, setShowDropdown,
        handleFileChange, handleSave, handleEdit, handleDelete, resetForm
    } = usePersonalRecords();

    // Estado local para el nuevo acordeón de información
    const [isInfoOpen, setIsInfoOpen] = useState(false);

    const ejerciciosFiltrados = ejercicios.filter(ej => 
        ej.nombre.toLowerCase().includes(ejercicioSearch.toLowerCase())
    );

    return (
        <div className="mt-24 p-4 animate-fade-in pb-24 space-y-6 max-w-lg mx-auto relative">
            
            <div className="flex items-center justify-center">
                <h2 className={AppStyles.title + " text-center"}>Mis Records</h2>
                <p className="text-2xl ml-2">🏆</p>
            </div>

            {/* ACORDEÓN DE INFORMACIÓN */}
            <div className={AppStyles.glassCard.replace("p-8", "p-2")}>
                <button 
                    onClick={() => setIsInfoOpen(!isInfoOpen)}
                    className="w-full p-2 flex items-center justify-between hover:bg-white/5 transition-colors rounded-2xl"
                >
                    <h3 className="text-blue-400 font-bold flex items-center gap-2">
                        <span>ℹ️</span> Información
                    </h3>
                    <span className={`text-gray-400 transition-transform duration-300 ${isInfoOpen ? 'rotate-180' : ''}`}>
                        ▼
                    </span>
                </button>

                <div className={`transition-all duration-500 ease-in-out px-4 ${isInfoOpen ? 'max-h-[500px] opacity-100 pb-5' : 'max-h-0 opacity-0'}`}>
                    <div className="pt-4 border-t border-white/10 text-gray-300 text-sm leading-relaxed">
                        <p>
                            <strong className="text-green-400 text-base">¡Prepárate para competir!</strong> 🥇<br/><br/>
                            Al finalizar cada mes, generaremos un <strong>Ranking Automático</strong> con los alumnos que levanten los mayores pesos en ejercicios seleccionados.<br/><br/>
                            Asegúrate de grabar tus mejores levantamientos, mantener una buena técnica y subir tus PRs para asegurar tu lugar en el podio de tu gimnasio.
                        </p>
                    </div>
                </div>

                <div className={`transition-all duration-500 ease-in-out px-5 ${isInfoOpen ? 'max-h-[500px] opacity-100 pb-5' : 'max-h-0 opacity-0'}`}>
                    <div className="pt-4 border-t border-white/10 text-yellow-400 text-sm leading-relaxed">
                        <p>
                            Solo los PRs que tengan video se van a tomar en cuenta para el Ranking.
                        </p>
                    </div>
                </div>
            </div>

            {/* FORMULARIO DE CARGA (DESPLEGABLE) */}
            <div className={`${AppStyles.glassCard} p-0 overflow-visible`}>
                
                <button 
                    onClick={() => {
                        if (editandoId) {
                            resetForm(); 
                        } else {
                            setIsFormOpen(!isFormOpen);
                        }
                    }}
                    className="w-full p-5 flex items-center justify-between hover:bg-white/5 transition-colors rounded-2xl"
                >
                    <h3 className="text-white font-bold flex items-center gap-2">
                        {editandoId ? "✏️ Editando Record" : "➕ Añadir Nuevo Record"}
                    </h3>
                    <span className={`text-gray-400 transition-transform duration-300 ${isFormOpen ? 'rotate-180' : ''}`}>
                        ▼
                    </span>
                </button>

                <div className={`transition-all duration-500 ease-in-out px-5 ${isFormOpen ? 'max-h-[1200px] opacity-100 pb-5 overflow-visible' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                    <div className="space-y-4 pt-4 border-t border-white/10">
                        
                        {!editandoId && (
                            <div className="relative">
                                <input 
                                    type="text" 
                                    placeholder="🔍 Buscar y seleccionar ejercicio..." 
                                    value={ejercicioSearch}
                                    onFocus={() => setShowDropdown(true)}
                                    onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                                    onChange={(e) => {
                                        setEjercicioSearch(e.target.value);
                                        setShowDropdown(true);
                                        setEjercicioId(""); 
                                    }}
                                    className={AppStyles.inputDark}
                                />
                                
                                {showDropdown && (
                                    <div className="absolute z-[100] w-full mt-2 max-h-52 overflow-y-auto bg-gray-950 border border-white/20 rounded-xl shadow-2xl touch-pan-y">
                                        {ejerciciosFiltrados.length > 0 ? (
                                            ejerciciosFiltrados.map(ej => (
                                                <div 
                                                    key={ej.id} 
                                                    onClick={() => {
                                                        setEjercicioId(ej.id.toString());
                                                        setEjercicioSearch(ej.nombre);
                                                        setShowDropdown(false);
                                                    }}
                                                    className="p-4 active:bg-green-500/40 hover:bg-green-500/20 text-white border-b border-white/5 last:border-0"
                                                >
                                                    {ej.nombre}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-4 text-gray-500 text-sm text-center italic">No se encontró el ejercicio</div>
                                        )}
                                    </div>
                                )}

                                {/* ALERTA DE DUPLICIDAD */}
                                {esDuplicado && prExistente && (
                                    <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-xl flex flex-col items-center gap-3 animate-fade-in mt-4 shadow-lg">
                                        <p className="text-yellow-400 text-sm text-center leading-relaxed">
                                            Ya tienes un record de <span className="font-bold text-yellow-300 text-base">{prExistente.peso} KG</span> para este ejercicio.
                                        </p>
                                        <button 
                                            onClick={() => handleEdit(prExistente)}
                                            className="text-yellow-400 text-xs font-bold uppercase tracking-widest bg-yellow-500/20 px-5 py-2.5 rounded-lg hover:bg-yellow-500/30 transition-all active:scale-95 border border-yellow-500/20 flex items-center gap-2"
                                        >
                                            <span>✏️</span> Modificar Existente
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex gap-4">
                            <input 
                                type="number" 
                                placeholder="Peso:" 
                                value={peso}
                                onChange={(e) => setPeso(e.target.value)}
                                className={AppStyles.inputDark + " flex-1"}
                            />
                            <div className="flex items-center text-gray-400 font-bold px-4 bg-black/20 rounded-lg">KG</div>
                        </div>

                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="w-48 h-48 mx-auto rounded-xl border-2 border-dashed border-white/20 hover:border-green-500/50 flex flex-col items-center justify-center bg-black/30 cursor-pointer overflow-hidden relative transition-colors group shadow-lg"
                        >
                            {videoPreview ? (
                                <video src={videoPreview} className="w-full h-full object-cover" controls={false} muted loop autoPlay />
                            ) : (
                                <div className="text-center p-3">
                                    <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform">📹</span>
                                    <span className="text-gray-400 text-xs font-medium">Subir video</span>
                                </div>
                            )}
                            {videoPreview && (
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <span className="text-white text-xs font-bold bg-black/50 px-3 py-1 rounded-lg">Cambiar</span>
                                </div>
                            )}
                            <input type="file" accept="video/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                        </div>

                        {editandoId && (
                            <p className="text-center text-yellow-400 text-sm font-medium">Si cambias el video, se eliminará el anterior. Si lo queres conservar primero descargalo.</p>
                        )}

                        <div className="flex gap-4 pt-2 justify-center w-full">
                            {editandoId && (
                                <button 
                                    onClick={resetForm} 
                                    className={`${AppStyles.btnSecondary} flex items-center justify-center px-6 py-2 min-w-[130px] h-11`}
                                >
                                    Cancelar
                                </button>
                            )}
                            <button 
                                onClick={handleSave} 
                                disabled={isSaveDisabled} 
                                className={`${AppStyles.btnPrimary} flex items-center justify-center px-6 py-2 min-w-[130px] h-11 ${!editandoId ? 'w-full' : ''} disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                <span className="text-center w-full">
                                    {loading ? "Guardando..." : (editandoId ? "Actualizar" : "Guardar PR")}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative">
                <input 
                    type="text" 
                    placeholder="🔍 Buscar por ejercicio..." 
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className={AppStyles.inputDark + " pl-10"}
                />
            </div>

            <div className="space-y-4">
                <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider pl-2">
                    {busqueda ? "Resultados" : "Últimos 5 Records"}
                </h3>
                
                {prs.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">No se encontraron records.</p>
                ) : (
                    prs.map(pr => (
                        <div key={pr.id} className="bg-gray-800/50 border border-white/5 rounded-2xl p-4 flex gap-4 items-center">
                            
                            <div 
                                onClick={() => pr.videoUrl ? setVideoSeleccionado(pr.videoUrl) : null}
                                className={`w-20 h-20 bg-black/50 rounded-xl overflow-hidden shrink-0 border border-white/10 relative flex items-center justify-center ${pr.videoUrl ? 'cursor-pointer hover:border-green-500 transition-colors' : ''}`}
                            >
                                {pr.videoUrl ? (
                                    <>
                                        <img src={CloudinaryApi.getThumbnail(undefined, pr.videoUrl)!} className="w-full h-full object-cover opacity-70" alt="thumbnail" />
                                        <span className="absolute text-white text-2xl drop-shadow-md">▶</span>
                                    </>
                                ) : (
                                    <span className="text-3xl text-gray-600">💪</span>
                                )}
                            </div>

                            <div className="flex-1">
                                <h4 className="text-white font-bold">{pr.ejercicio.nombre}</h4>
                                <p className="text-green-400 font-black text-xl">{pr.peso} KG</p>
                                <p className="text-xs text-gray-500">{new Date(pr.fechaActualizacion).toLocaleDateString()}</p>
                            </div>

                            <div className="flex flex-col gap-2 shrink-0">
                                <button onClick={() => handleEdit(pr)} className={AppStyles.btnEdit}>✏️</button>
                                <button onClick={() => handleDelete(pr.id, pr.videoUrl)} className={AppStyles.btnDelete}>🗑️</button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {videoSeleccionado && createPortal(
                <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex flex-col p-4 animate-fade-in">
                    <div className="flex justify-end pb-4 pt-8">
                        <button 
                            onClick={() => setVideoSeleccionado(null)}
                            className="text-white bg-white/10 hover:bg-white/20 p-2 rounded-full px-6 font-bold transition-colors"
                        >
                            Cerrar ✕
                        </button>
                    </div>
                    
                    <div className="flex-1 w-full max-w-2xl mx-auto pb-10 flex items-center justify-center">
                        <VideoEjercicio 
                            url={videoSeleccionado} 
                            controls={true}
                            muted={false}
                            loop={false}
                        />
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};