import { useLogin } from "../Hooks/Login/useLogin"; // Ajusta ruta si es necesario
import { PageLayout } from "../Components/UI/PageLayout";
import { Card } from "../Components/UI/Card";
import { Input } from "../Components/UI/Input";
import { Button } from "../Components/UI/Button";
import fondoLogin from "../assets/Fondo-Login.jpg";
import { LoginStyles } from "../Styles/LoginStyles";
import { Link } from "react-router-dom";

export const Login = () => {
  const { 
    dni,             
    password, 
    rememberMe,
    error, 
    loading,          
    handleDniChange,  
    handlePasswordChange, 
    handleRememberMeChange,
    handleLogin 
  } = useLogin();

  return (
    <PageLayout centered showNavbar={false} backgroundImage={fondoLogin}>
      
      <Card className={LoginStyles.glassCard}> 
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white drop-shadow-md">GymMate</h1>
          <p className="text-gray-200 mt-2 text-lg">Inicia sesión para entrenar</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
              <label className={LoginStyles.label}>DNI</label> 
              <Input 
                type="text" // 'text' con validación numérica es mejor que 'number' para quitar flechitas
                inputMode="numeric" // Teclado numérico en móvil
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

          {/* CHECKBOX RECORDAR */}
          <div className="flex items-center gap-2">
            <input 
                id="rememberMe"
                type="checkbox" 
                checked={rememberMe}
                onChange={handleRememberMeChange}
                className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-green-500 focus:ring-green-500 focus:ring-offset-gray-800 cursor-pointer"
            />
            <label htmlFor="rememberMe" className="text-sm text-gray-300 cursor-pointer select-none">
                Recordar mis datos
            </label>
          </div>

          {error && (
            <div className={LoginStyles.errorBox}>
              {error}
            </div>
          )}

          <Button type="submit" className={LoginStyles.btnPrimary} disabled={loading}>
            {loading ? "INGRESANDO..." : "INGRESAR"}
          </Button>
        </form>
        
        <div className="mt-8 text-center flex flex-col gap-2">
          <Link 
            to="/forgot-password" 
            className="text-sm text-gray-400 hover:text-green-400 transition-colors cursor-pointer">
              ¿Olvidaste tu contraseña?
          </Link>

          <p className="text-xs text-gray-500">
            Si tienes problemas, contacta a tu entrenador.
          </p>
        </div>
      </Card>

    </PageLayout>
  );
};