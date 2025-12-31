import { useCreateUser } from "../../Hooks/CreateUser/useCreateUser";
import { Navbar } from "../../Components/Navbar"; 
import { Input } from "../../Components/UI/Input";
import { Button } from "../../Components/UI/Button";
import fondoUser from "../../assets/Fondo-CreateUser.png"; 
import { AppStyles } from "../../Styles/AppStyles"; 

export const CreateUser = () => {
  const { formData, isAdmin, handleChange, handleSubmit, handleCancel } = useCreateUser();

  return (
    <div className={AppStyles.pageContainer}>
      
      {/* FONDO FIJO */}
      <div
        className={AppStyles.fixedBackground}
        style={{
          backgroundImage: `url(${fondoUser})`,
          filter: 'brightness(0.6) contrast(1.1)' 
        }}
      />

      <Navbar />

      {/* CONTENIDO */}
      <div className={`${AppStyles.contentContainer} min-h-[80vh] items-center`}> {/* Ajuste flex */}
        <div className="w-full max-w-2xl">
          
            {/* Título */}
            <div className="mb-6 text-center justify-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight drop-shadow-lg">
                    Registrar <span className={AppStyles.highlight}>Nuevo Usuario</span>
                </h2>
                <p className="text-gray-300 text-sm mt-2 font-medium">Completa los datos para dar de alta un acceso.</p>
            </div>

            {/* TARJETA */}
            <div className={`${AppStyles.glassCard} p-6 md:p-8`}>
                
                <div className={AppStyles.gradientDivider}></div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input 
                        label="Nombre" name="nombre" value={formData.nombre} onChange={handleChange} 
                        className={AppStyles.inputDark} labelClassName={AppStyles.label}
                    />
                    <Input 
                        label="Apellido" name="apellido" value={formData.apellido} onChange={handleChange} 
                        className={AppStyles.inputDark} labelClassName={AppStyles.label}
                    />
                    <Input 
                        label="Usuario" name="nombreUsuario" value={formData.nombreUsuario} onChange={handleChange}
                        className={AppStyles.inputDark} labelClassName={AppStyles.label}
                    />
                    <Input 
                        label="Email" type="email" name="email" value={formData.email} onChange={handleChange} 
                        className={AppStyles.inputDark} labelClassName={AppStyles.label}
                    />
                    <div className="md:col-span-2">
                         <Input 
                            label="Contraseña" type="password" name="contraseña" value={formData.contraseña} onChange={handleChange} 
                            className={AppStyles.inputDark} labelClassName={AppStyles.label}
                        />
                    </div>
                    
                    <div className="md:col-span-2">
                        <Input 
                            as="select" 
                            label="Rol Asignado" 
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
                        className={AppStyles.btnSecondary + " border-transparent hover:border-white/10"}
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
    </div>
  );
};