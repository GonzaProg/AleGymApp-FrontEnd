import { useLogin } from "../Hooks/Login/useLogin";
import { PageLayout } from "../Components/UI/PageLayout";
import { Card } from "../Components/UI/Card";
import { Input } from "../Components/UI/Input";
import { Button } from "../Components/UI/Button";
import fondoLogin from "../assets/Fondo-Login.jpg";
import { LoginStyles } from "../Styles/LoginStyles";
import { Link } from "react-router-dom";

export const Login = () => {
  const { email, password, error, handleEmailChange, handlePasswordChange, handleLogin } = useLogin();

  return (
    <PageLayout centered showNavbar={false} backgroundImage={fondoLogin}>
      
      <Card className={LoginStyles.glassCard}> 
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white drop-shadow-md">Gym App</h1>
          <p className="text-gray-200 mt-2 text-lg">Inicia sesión para entrenar</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
             <label className={LoginStyles.label}>Correo Electrónico</label>
             <Input 
               type="email" 
               placeholder="ejemplo@gym.com" 
               value={email} 
               onChange={handleEmailChange} 
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
               className={LoginStyles.inputDark} // <--- Reutilizamos
             />
          </div>

          {error && (
            <div className={LoginStyles.errorBox}>
              {error}
            </div>
          )}

          {/* Nota: En el botón ya incluimos w-full, py-3, etc en el estilo */}
          <Button type="submit" className={LoginStyles.btnPrimary}>
            INGRESAR
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