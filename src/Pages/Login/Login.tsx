import { useState } from "react";
import { useLogin } from "../../Hooks/Login/useLogin"; 
import { useRegister } from "../../Hooks/Login/useRegister"; // Nuevo Hook
import { PageLayout } from "../../Components/UI/PageLayout";
import { Card } from "../../Components/UI/Card";
import { Input } from "../../Components/UI/Input";
import { Button } from "../../Components/UI/Button";
import fondoLogin from "../../assets/Fondo-Login.jpg";
import { LoginStyles } from "../../Styles/LoginStyles";
import { Link, useNavigate } from "react-router-dom";
import { PlanExpiredModal } from "../../Components/Planes/PlanExpiredModal"; 

export const Login = () => {
  // Estado para alternar vistas
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();

  // --- HOOK LOGIN ---
  const { 
    dni, password, rememberMe, error: loginError, loading: loginLoading,          
    showExpiredModal, setShowExpiredModal, handleDniChange, handlePasswordChange, 
    handleRememberMeChange, handleLogin 
  } = useLogin();

  // --- HOOK REGISTRO ---
  const {
    formData, handleChange, handleRegister, loading: registerLoading
  } = useRegister(() => navigate("/home")); // Al éxito, va al home

  return (
    <PageLayout centered showNavbar={false} backgroundImage={fondoLogin}
        className={isRegistering ? "max-w-2xl transition-all duration-500" : "max-w-md transition-all duration-500"}
    >
      
      {/* MODAL (Solo relevante en login) */}
      <PlanExpiredModal 
        isOpen={showExpiredModal} 
        onClose={() => setShowExpiredModal(false)} 
      />

      <Card className={`${LoginStyles.glassCard} max-w-lg transition-all duration-500`}> 
        
        {/* ENCABEZADO */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-white drop-shadow-md tracking-tight">GymMate</h1>
          <p className="text-gray-200 mt-2 text-lg">
            {isRegistering ? "Crea tu cuenta gratis" : "Inicia sesión para entrenar"}
          </p>
        </div>

        {/* --- FORMULARIO DE REGISTRO --- */}
        {isRegistering ? (
            <form onSubmit={handleRegister} className="space-y-4 animate-fade-in mx-center">
                
                {/* Nombre y Apellido (Responsive) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input name="nombre" placeholder="Nombre" value={formData.nombre} onChange={handleChange} required className={LoginStyles.inputDark} />
                    <Input name="apellido" placeholder="Apellido" value={formData.apellido} onChange={handleChange} required className={LoginStyles.inputDark} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input name="dni" placeholder="DNI" type="number" value={formData.dni} onChange={handleChange} required className={LoginStyles.inputDark} />
                    <Input name="telefono" placeholder="Teléfono" type="tel" value={formData.telefono} onChange={handleChange} className={LoginStyles.inputDark} />
                </div>

                <Input name="nombreUsuario" placeholder="Nombre de Usuario" value={formData.nombreUsuario} onChange={handleChange} required className={LoginStyles.inputDark} />
                
                <Input name="fechaNacimiento" type="date" value={formData.fechaNacimiento} onChange={handleChange} className={`${LoginStyles.inputDark} text-gray-400`} labelClassName={LoginStyles.label}
                    />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input name="contraseña" placeholder="Contraseña" type="password" value={formData.contraseña} onChange={handleChange} required className={LoginStyles.inputDark} />
                    <Input name="confirmarContrasena" placeholder="Repetir Contraseña" type="password" value={formData.confirmarContrasena} onChange={handleChange} required className={LoginStyles.inputDark} />
                </div>

                <Button type="submit" className={LoginStyles.btnPrimary} fullWidth disabled={registerLoading}>
                    {registerLoading ? "CREANDO CUENTA..." : "REGISTRARME 🚀"}
                </Button>

                <div className="text-center pt-4 border-t border-white/10">
                    <p className="text-sm text-gray-300 mb-2">¿Ya tienes una cuenta?</p>
                    <button 
                        type="button"
                        onClick={() => setIsRegistering(false)}
                        className="text-green-400 font-bold hover:text-green-300 transition-colors uppercase text-sm tracking-wide"
                    >
                        Inicia Sesión aquí
                    </button>
                </div>
            </form>
        ) : (
            
        /* --- FORMULARIO DE LOGIN --- */
            <form onSubmit={handleLogin} className="space-y-6 animate-fade-in">
                <div>
                    <label className={LoginStyles.label}>DNI</label> 
                    <Input 
                        type="text" 
                        inputMode="numeric"
                        placeholder="Ingresa tu DNI" 
                        value={dni} 
                        onChange={handleDniChange} 
                        required 
                        className={LoginStyles.inputDark}
                    />
                </div>

                <div>
                    <label className={LoginStyles.label}>Contraseña</label>
                    <Input 
                        type="password" 
                        placeholder="••••••••" 
                        value={password} 
                        onChange={handlePasswordChange} 
                        required 
                        className={LoginStyles.inputDark} 
                    />
                </div>

                <div className="flex items-center gap-2">
                    <input 
                        id="rememberMe"
                        type="checkbox" 
                        checked={rememberMe}
                        onChange={handleRememberMeChange}
                        className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-green-500 focus:ring-green-500 cursor-pointer"
                    />
                    <label htmlFor="rememberMe" className="text-sm text-gray-300 cursor-pointer select-none">
                        Recordar mis datos
                    </label>
                </div>

                {loginError && (
                    <div className={`${LoginStyles.errorBox} flex items-center gap-2`}>
                        {loginError.includes("Mantenimiento") && <span className="text-xl">⚠️</span>}
                        {loginError}
                    </div>
                )}

                <Button type="submit" className={LoginStyles.btnPrimary} disabled={loginLoading}>
                    {loginLoading ? "INGRESANDO..." : "INGRESAR"}
                </Button>
                
                <div className="mt-8 text-center flex flex-col gap-4 border-t border-white/10 pt-6">
                    <div>
                        <p className="text-sm text-gray-300 mb-1">¿Eres nuevo en el gimnasio?</p>
                        <button 
                            type="button"
                            onClick={() => setIsRegistering(true)}
                            className="text-green-400 font-bold hover:text-green-300 transition-colors uppercase text-sm tracking-wide"
                        >
                            ¡Crea tu cuenta ahora!
                        </button>
                    </div>

                    <Link 
                        to="/forgot-password" 
                        className="text-xs text-gray-500 hover:text-gray-300 transition-colors cursor-pointer block mt-2"
                    >
                        ¿Olvidaste tu contraseña?
                    </Link>
                </div>
            </form>
        )}
      </Card>
    </PageLayout>
  );
};