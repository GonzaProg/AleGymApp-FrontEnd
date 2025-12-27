import { useCreateUser } from "../Hooks/CreateUser/useCreateUser";
import { Navbar } from "../Components/Navbar"; // Asumo que tienes este componente basado en el ejemplo anterior
import { Input } from "../Components/UI/Input";
import { Button } from "../Components/UI/Button";
import fondoUser from "../assets/Fondo-CreateUser.png"; // Importamos la nueva imagen

export const CreateUser = () => {
  const { formData, isAdmin, handleChange, handleSubmit, handleCancel } = useCreateUser();

  // Clases comunes para mantener el estilo "Dark Glass"
  const darkInputClass = "bg-black/30 border-white/10 text-white focus:border-green-500/50 p-3 placeholder-gray-500";
  const darkLabelClass = "text-gray-400 text-xs uppercase font-bold tracking-wider";

  return (
    <div className="relative min-h-screen font-sans bg-gray-900 text-gray-200">
      
      {/* --- FONDO FIJO (Igual que en CreateRoutine) --- */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${fondoUser})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          filter: 'brightness(0.4) contrast(1.1)' // Ajustado un poco más oscuro para que se lean los inputs
        }}
      />

      {/* Navbar superpuesta */}
      <Navbar />

      {/* --- CONTENEDOR PRINCIPAL --- */}
      <div className="relative z-10 pt-32 pb-10 px-4 w-full flex justify-center items-center min-h-[80vh]">
        <div className="w-full max-w-2xl">
          
            {/* Título Principal fuera de la tarjeta para dar aire */}
            <div className="mb-6 text-center md:text-left">
                <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight drop-shadow-lg">
                    Registrar <span className="text-green-500">Nuevo Usuario</span>
                </h2>
                <p className="text-gray-300 text-sm mt-2 font-medium">Completa los datos para dar de alta un acceso.</p>
            </div>

            {/* --- TARJETA DE FORMULARIO (Glassmorphism) --- */}
            <div className="w-full backdrop-blur-xl bg-gray-900/80 border border-white/10 rounded-2xl shadow-2xl p-6 md:p-8 relative overflow-hidden">
                
                {/* Banner decorativo superior */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-green-900"></div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input 
                        label="Nombre" 
                        name="nombre" 
                        value={formData.nombre} 
                        onChange={handleChange} 
                        className={darkInputClass}
                        labelClassName={darkLabelClass}
                    />
                    <Input 
                        label="Apellido" 
                        name="apellido" 
                        value={formData.apellido} 
                        onChange={handleChange} 
                        className={darkInputClass}
                        labelClassName={darkLabelClass}
                    />
                    <Input 
                        label="Usuario" 
                        name="nombreUsuario" 
                        value={formData.nombreUsuario} 
                        onChange={handleChange}
                        className={darkInputClass}
                        labelClassName={darkLabelClass}
                    />
                    <Input 
                        label="Email" 
                        type="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleChange} 
                        className={darkInputClass}
                        labelClassName={darkLabelClass}
                    />
                    <div className="md:col-span-2">
                         <Input 
                            label="Contraseña" 
                            type="password" 
                            name="contraseña" 
                            value={formData.contraseña} 
                            onChange={handleChange} 
                            className={darkInputClass}
                            labelClassName={darkLabelClass}
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
                            className={`${darkInputClass} appearance-none cursor-pointer`}
                            labelClassName={darkLabelClass}
                        >
                            <option value="Alumno" className="text-gray-900">Alumno</option>
                            {isAdmin && <option value="Entrenador" className="text-gray-900">Entrenador</option>}
                        </Input>
                        
                        {!isAdmin && (
                            <div className="mt-2 flex items-center gap-2 text-yellow-500/80 bg-yellow-500/10 p-2 rounded-lg border border-yellow-500/20">
                                <span className="text-lg">ℹ️</span>
                                <p className="text-xs font-bold">Como Entrenador solo tienes permisos para crear Alumnos.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-4 border-t border-white/10 pt-6">
                    <Button 
                        variant="ghost" 
                        onClick={handleCancel}
                        className="text-gray-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all"
                    >
                        Cancelar
                    </Button>
                    <Button 
                        onClick={handleSubmit}
                        className="bg-green-600 hover:bg-green-500 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-green-900/20 border border-green-500/20 tracking-wide transition-all hover:scale-105"
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