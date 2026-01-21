import { useCreateUser } from "../../Hooks/CreateUser/useCreateUser";
import { Input } from "../../Components/UI/Input";
import { Button } from "../../Components/UI/Button";
import { AppStyles } from "../../Styles/AppStyles"; 

export const CreateUser = () => {
  const { formData, isAdmin, handleChange, handleSubmit, handleCancel } = useCreateUser();

  return (
    <div className="w-full h-full flex flex-col items-center justify-center animate-fade-in p-6">
        <div className="w-full max-w-3xl">
          
            {/* Título */}
            <div className={AppStyles.headerContainer + " mt-24 mb-6"}>
                <p className={AppStyles.subtitle}>Completa los datos para dar de alta un acceso.</p>
            </div>

            {/* TARJETA */}
            <div className={`${AppStyles.glassCard} p-6 md:p-8`}>
                
                <div className={AppStyles.gradientDivider}></div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Fila 1 */}
                    <Input 
                        label="DNI *" type="number" name="dni" value={formData.dni} onChange={handleChange} 
                        className={AppStyles.inputDark} labelClassName={AppStyles.label} placeholder="Sin puntos"
                    />
                    <Input 
                        label="Rol Asignado *" as="select" name="rol" value={formData.rol} onChange={handleChange} disabled={!isAdmin}
                        className={`${AppStyles.inputDark} appearance-none cursor-pointer`} labelClassName={AppStyles.label}
                    >
                        <option value="Alumno" className="text-gray-900">Alumno</option>
                        {isAdmin && <option value="Entrenador" className="text-gray-900">Entrenador</option>}
                    </Input>

                    {/* Fila 2 */}
                    <Input 
                        label="Nombre *" name="nombre" value={formData.nombre} onChange={handleChange} 
                        className={AppStyles.inputDark} labelClassName={AppStyles.label}
                    />
                    <Input 
                        label="Apellido *" name="apellido" value={formData.apellido} onChange={handleChange} 
                        className={AppStyles.inputDark} labelClassName={AppStyles.label}
                    />
                    
                    {/* Fila 3 */}
                    <Input 
                        label="Usuario *" name="nombreUsuario" value={formData.nombreUsuario} onChange={handleChange}
                        className={AppStyles.inputDark} labelClassName={AppStyles.label}
                    />
                    <Input 
                        label="Email *" type="email" name="email" value={formData.email} onChange={handleChange} 
                        className={AppStyles.inputDark} labelClassName={AppStyles.label}
                    />

                    {/* Fila 4: Datos Opcionales */}
                    <Input 
                        label="Teléfono" type="tel" name="telefono" value={formData.telefono} onChange={handleChange} 
                        className={AppStyles.inputDark} labelClassName={AppStyles.label}
                    />
                    <Input 
                        label="Fecha Nacimiento" type="date" name="fechaNacimiento" value={formData.fechaNacimiento} onChange={handleChange} 
                        className={AppStyles.inputDark} labelClassName={AppStyles.label}
                    />

                    {/* Fila 5: Contraseña (Full Width) */}
                    <div className="md:col-span-2">
                          <Input 
                            label="Contraseña *" type="password" name="contraseña" value={formData.contraseña} onChange={handleChange} 
                            className={AppStyles.inputDark} labelClassName={AppStyles.label}
                        />
                    </div>
                    
                    {!isAdmin && (
                        <div className="md:col-span-2">
                            <div className={AppStyles.infoBox}>
                                <span className="text-lg">ℹ️</span>
                                <p>Como Entrenador solo tienes permisos para crear Alumnos.</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-8 flex justify-end gap-4 border-t border-white/10 pt-6">
                    <Button variant="ghost" onClick={handleCancel} className={AppStyles.btnSecondary + " hover:text-white"}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} className={AppStyles.btnPrimary + " px-8 tracking-wide"}>
                        CREAR USUARIO
                    </Button>
                </div>
            </div>
        </div>
    </div>
  );
};