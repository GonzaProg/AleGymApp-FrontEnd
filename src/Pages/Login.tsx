import { useLogin } from "../Hooks/Login/useLogin";
import { PageLayout } from "../Components/UI/PageLayout";
import { Card } from "../Components/UI/Card";
import { Input } from "../Components/UI/Input";
import { Button } from "../Components/UI/Button";
import fondoLogin from "../assets/Fondo-Login.png";

export const Login = () => {
  const { email, password, error, handleEmailChange, handlePasswordChange, handleLogin } = useLogin();

  const darkInputStyle = "bg-white/10 border-white/20 text-white placeholder-gray-400 focus:ring-green-500 focus:border-transparent";
  const darkLabelStyle = "text-gray-300";

  return (
    <PageLayout centered showNavbar={false} backgroundImage={fondoLogin}>
      
      <Card className="p-8 shadow-2xl bg-black/40 backdrop-blur-md border border-white/10"> 
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white drop-shadow-md">Gym App</h1>
          <p className="text-gray-200 mt-2 text-lg">Inicia sesión para entrenar</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
             <label className={`block text-sm font-bold uppercase tracking-wide mb-1 ${darkLabelStyle}`}>Correo Electrónico</label>
             <Input 
               type="email" 
               placeholder="ejemplo@gym.com" 
               value={email} 
               onChange={handleEmailChange} 
               required 
               className={darkInputStyle}
             />
          </div>

          <div>
             <label className={`block text-sm font-bold uppercase tracking-wide mb-1 ${darkLabelStyle}`}>Contraseña</label>
             <Input 
               type="password" 
               placeholder="••••••••" 
               value={password} 
               onChange={handlePasswordChange} 
               required 
               className={darkInputStyle}
             />
          </div>

          {error && (
            <div className="p-3 text-sm text-red-200 bg-red-900/50 border border-red-500/50 rounded-lg text-center font-bold animate-pulse">
              {error}
            </div>
          )}

          <Button type="submit" fullWidth size="lg" className="mt-6 bg-green-600 hover:bg-green-500 text-white shadow-lg hover:shadow-green-500/30 ring-1 ring-white/20">
            INGRESAR
          </Button>
        </form>
        
        <p className="text-xs text-center text-gray-400 mt-8">
          ¿Olvidaste tu contraseña? Contacta a tu entrenador.
        </p>
      </Card>

    </PageLayout>
  );
};