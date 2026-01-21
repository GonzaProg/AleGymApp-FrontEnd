import { useCreateUser } from "../../Hooks/CreateUser/useCreateUser";
import { Input } from "../../Components/UI/Input";
import { Button } from "../../Components/UI/Button";
import { AppStyles } from "../../Styles/AppStyles"; 

export const CreateUser = () => {
  const { formData, isAdmin, handleChange, handleSubmit, handleCancel } = useCreateUser();

  return (
    <div className="w-full h-full flex flex-col items-center justify-center animate-fade-in p-6">
        <div className="w-full max-w-2xl">
          
            {/* Título */}
            <div className={AppStyles.headerContainer}>
                <p className={AppStyles.subtitle + " mb-10"}>Completa los datos para dar de alta un acceso.</p>
            </div>

            {/* TARJETA */}
            <div className={`${AppStyles.glassCard} p-6 md:p-8`}>
                
                <div className={AppStyles.gradientDivider}></div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input 
                        label="Nombre *" name="nombre" value={formData.nombre} onChange={handleChange} 
                        className={AppStyles.inputDark} labelClassName={AppStyles.label}
                    />
                    <Input 
                        label="Apellido" name="apellido" value={formData.apellido} onChange={handleChange} 
                        className={AppStyles.inputDark} labelClassName={AppStyles.label}
                    />
                    <Input 
                        label="Usuario *" name="nombreUsuario" value={formData.nombreUsuario} onChange={handleChange}
                        className={AppStyles.inputDark} labelClassName={AppStyles.label}
                    />
                    <Input 
                        label="Email *" type="email" name="email" value={formData.email} onChange={handleChange} 
                        className={AppStyles.inputDark} labelClassName={AppStyles.label}
                    />
                    <div className="md:col-span-2">
                          <Input 
                            label="Contraseña *" type="password" name="contraseña" value={formData.contraseña} onChange={handleChange} 
                            className={AppStyles.inputDark} labelClassName={AppStyles.label}
                        />
                    </div>
                    
                    <div className="md:col-span-2">
                        <Input 
                            as="select" 
                            label="Rol Asignado *" 
                            name="rol" 
                            value={formData.rol} 
                            onChange={handleChange} 
                            disabled={!isAdmin}
                            className={`${AppStyles.inputDark} appearance-none cursor-pointer`}
                            labelClassName={AppStyles.label}
                        >
                            <option value="Alumno" className="text-gray-900">Alumno</option>
                            {isAdmin && <option value="Entrenador" className="text-gray-900">Entrenador</option>}
                        </Input>
                        
                        {!isAdmin && (
                            <div className={AppStyles.infoBox}>
                                <span className="text-lg">ℹ️</span>
                                <p>Como Entrenador solo tienes permisos para crear Alumnos.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-4 border-t border-white/10 pt-6">
                    <Button 
                        variant="ghost" 
                        onClick={handleCancel}
                        className={AppStyles.btnSecondary + " hover:text-white"}
                    >
                        Cancelar
                    </Button>
                    <Button 
                        onClick={handleSubmit}
                        className={AppStyles.btnPrimary + " px-8 tracking-wide"}
                    >
                        CREAR USUARIO
                    </Button>
                </div>
            </div>
        </div>
    </div>
  );
};