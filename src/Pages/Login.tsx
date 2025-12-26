import { useLogin } from "../Hooks/Login/useLogin";
import { PageLayout } from "../Components/UI/PageLayout";
import { Card } from "../Components/UI/Card";
import { Input } from "../Components/UI/Input";
import { Button } from "../Components/UI/Button";

export const Login = () => {
  const { email, password, error, handleEmailChange, handlePasswordChange, handleLogin } = useLogin();

  return (
    // "centered" activa el modo Login del layout (fondo verde y centrado perfecto)
    <PageLayout centered showNavbar={false}>
      
      <Card className="p-8 shadow-2xl"> 
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-green-800">Gym App</h1>
          <p className="text-gray-500">Inicia sesión para ver tu rutina</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <Input 
            label="Correo Electrónico" 
            type="email" 
            placeholder="ejemplo@gym.com" 
            value={email} 
            onChange={handleEmailChange} 
            required 
          />
          <Input 
            label="Contraseña" 
            type="password" 
            placeholder="••••••••" 
            value={password} 
            onChange={handlePasswordChange} 
            required 
          />

          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg text-center font-bold">
              {error}
            </div>
          )}

          <Button type="submit" fullWidth size="lg" className="mt-6">
            INGRESAR
          </Button>
        </form>
        
        <p className="text-xs text-center text-gray-400 mt-6">
          ¿Olvidaste tu contraseña? Contacta a tu entrenador.
        </p>
      </Card>

    </PageLayout>
  );
};