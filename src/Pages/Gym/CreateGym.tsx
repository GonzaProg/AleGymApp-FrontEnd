import { useCreateGym } from "../../Hooks/Gym/useCreateGym";
import { Card } from "../../Components/UI/Card";
import { Input } from "../../Components/UI/Input";
import { Button } from "../../Components/UI/Button";
import { AppStyles } from "../../Styles/AppStyles";

export const CreateGym = () => {
    const { 
        nombre, setNombre, codigo, setCodigo, 
        selectedLogo, handleLogoChange, // Nuevos props
        loadingGym, handleSubmitGym,
        showOwnerModal, createdGymName, ownerForm, loadingOwner, handleOwnerChange, handleSubmitOwner, skipOwnerCreation
    } = useCreateGym();

    return (
        <div className="mt-10 pb-10"> {/* Agregado padding bottom para scroll si es necesario */}
            <div className="flex justify-center items-center h-full relative">
                
                {/* --- FORMULARIO PASO 1: CREAR GIMNASIO --- */}
                <Card className={`${AppStyles.glassCard} max-w-lg w-full p-8 ${showOwnerModal ? 'blur-sm pointer-events-none' : ''}`}>
                    <div className="text-center mb-6">
                        <h2 className="text-3xl font-bold text-white drop-shadow-md">Nuevo Gimnasio 🏢</h2>
                        <p className="text-gray-300 text-sm mt-2">Paso 1: Dar de alta la sucursal.</p>
                    </div>

                    <form onSubmit={handleSubmitGym} className="space-y-6">
                        {/* NOMBRE */}
                        <div>
                            <label className={AppStyles.label}>Nombre del Gimnasio</label>
                            <Input 
                                placeholder="Ej: Power Fit Center"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                className={AppStyles.inputDark}
                            />
                        </div>

                        {/* CÓDIGO */}
                        <div>
                            <label className={AppStyles.label}>Código de Acceso Único</label>
                            <Input 
                                placeholder="Ej: POWER-FIT-01"
                                value={codigo}
                                onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                                className={`${AppStyles.inputDark} uppercase tracking-wider font-bold`}
                            />
                        </div>

                        {/* --- DRAG & DROP LOGO (Nuevo) --- */}
                        <div>
                            <label className={AppStyles.label}>Logo del Gimnasio (Opcional)</label>
                            <div className="mt-2 border-2 border-dashed border-white/20 rounded-xl p-4 text-center hover:border-green-500/50 hover:bg-white/5 transition-all group cursor-pointer relative h-32 flex items-center justify-center">
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleLogoChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className="flex flex-col items-center gap-2 pointer-events-none">
                                    {selectedLogo ? (
                                        <>
                                            <span className="text-3xl">🖼️</span>
                                            <p className="text-green-400 font-bold text-sm truncate max-w-[200px]">{selectedLogo.name}</p>
                                        </>
                                    ) : (
                                        <>
                                            <span className="text-3xl text-gray-500 group-hover:scale-110 transition">📷</span>
                                            <p className="text-gray-400 text-xs">Arrastra el logo aquí</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Button type="submit" disabled={loadingGym} className={`w-full ${AppStyles.btnPrimary} py-3 text-lg`}>
                            {loadingGym ? "Subiendo datos..." : "Siguiente: Asignar Dueño →"}
                        </Button>
                    </form>
                </Card>

                {/* --- MODAL PASO 2: CREAR DUEÑO (Overlay) --- */}
                {showOwnerModal && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                        <Card className="bg-gray-900 border border-green-500/30 max-w-2xl w-full p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-bold text-white">
                                    ¡Gimnasio <span className="text-green-400">{createdGymName}</span> Creado!
                                </h2>
                                <p className="text-gray-300 text-sm mt-2">
                                    Ahora crea la cuenta del <b>Entrenador/Dueño</b> que administrará este local.
                                </p>
                            </div>

                            <form onSubmit={handleSubmitOwner} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Datos Personales */}
                                <div className="col-span-1">
                                    <label className={AppStyles.label}>Nombre</label>
                                    <Input name="nombre" value={ownerForm.nombre} onChange={handleOwnerChange} className={AppStyles.inputDark} required />
                                </div>
                                <div className="col-span-1">
                                    <label className={AppStyles.label}>Apellido</label>
                                    <Input name="apellido" value={ownerForm.apellido} onChange={handleOwnerChange} className={AppStyles.inputDark} required />
                                </div>
                                <div className="col-span-1">
                                    <label className={AppStyles.label}>DNI (Usuario)</label>
                                    <Input name="dni" value={ownerForm.dni} onChange={handleOwnerChange} className={AppStyles.inputDark} required />
                                </div>
                                <div className="col-span-1">
                                    <label className={AppStyles.label}>Teléfono (WhatsApp)</label>
                                    <Input name="telefono" value={ownerForm.telefono} onChange={handleOwnerChange} className={AppStyles.inputDark} />
                                </div>
                                
                                {/* Datos Cuenta */}
                                <div className="col-span-1">
                                    <label className={AppStyles.label}>Contraseña</label>
                                    <Input type="password" name="contraseña" value={ownerForm.contraseña} onChange={handleOwnerChange} className={AppStyles.inputDark} required />
                                </div>

                                <div className="col-span-1">
                                    <label className={AppStyles.label}>Fecha Nacimiento</label>
                                    <Input 
                                        type="date" 
                                        name="fechaNacimiento" 
                                        value={ownerForm.fechaNacimiento} 
                                        onChange={handleOwnerChange} 
                                        className={AppStyles.inputDark} 
                                    />
                                </div>

                                <div className="col-span-2 mt-4 flex gap-4">
                                    <Button type="button" onClick={skipOwnerCreation} className={`w-1/3 ${AppStyles.btnSecondary}`}>
                                        Omitir
                                    </Button>
                                    <Button type="submit" disabled={loadingOwner} className={`w-2/3 ${AppStyles.btnPrimary}`}>
                                        {loadingOwner ? "Registrando..." : "Registrar Dueño y Finalizar"}
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    </div>
                )}

            </div>
        </div>
    );
};