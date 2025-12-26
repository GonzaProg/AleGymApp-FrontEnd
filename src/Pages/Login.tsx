import { useLogin } from "../Hooks/Login/useLogin";
import { PageLayout } from "../Components/UI/PageLayout";
import { Card } from "../Components/UI/Card";
import { Input } from "../Components/UI/Input";
import { Button } from "../Components/UI/Button";

export const Login = () => {
  const { email, password, error, handleEmailChange, handlePasswordChange, handleLogin } = useLogin();

  return (
    <PageLayout centered showNavbar={false}>
      <div className="w-full max-w-md">
        <Card className="p-8"> {/* Override padding interno */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-green-800">Gym App</h1>
            <p className="text-gray-500">Inicia sesión para ver tu rutina</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-2">
            <Input label="Correo Electrónico" type="email" placeholder="ejemplo@gym.com" value={email} onChange={handleEmailChange} required />
            <Input label="Contraseña" type="password" placeholder="••••••••" value={password} onChange={handlePasswordChange} required />

            {error && <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg">{error}</div>}

            <Button type="submit" fullWidth className="mt-4">INGRESAR</Button>
          </form>
        </Card>
      </div>
    </PageLayout>
  );
};