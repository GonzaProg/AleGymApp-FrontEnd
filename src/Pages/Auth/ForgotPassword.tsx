import { Link } from "react-router-dom";
import { PageLayout } from "../../Components/UI/PageLayout";
import { Card } from "../../Components/UI/Card";
import { Input } from "../../Components/UI/Input";
import { Button } from "../../Components/UI/Button";
import { AppStyles } from "../../Styles/AppStyles";
import { useForgotPassword } from "../../Hooks/Auth/useForgotPassword";
import fondoLogin from "../../assets/Fondo-Login.png"; 

export const ForgotPassword = () => {
  const { email, loading, message, error, handleEmailChange, handleSubmit } = useForgotPassword();

  return (
    <PageLayout centered showNavbar={false} backgroundImage={fondoLogin}>
      
      {/* Reutilizamos glassCard pero limitamos el ancho para que se vea elegante */}
      <div className="w-full max-w-md">
        <Card className={AppStyles.glassCard}>
          
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-white drop-shadow-md mb-2">Recuperar Acceso</h2>
            <p className="text-gray-300 text-sm">
              Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
            </p>
          </div>

          {/* Renderizado Condicional: Formulario o Mensaje de Éxito */}
          {!message ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className={AppStyles.label}>Correo Electrónico</label>
                <Input
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={handleEmailChange}
                  required
                  className={AppStyles.inputDark}
                />
              </div>

              {error && (
                <div className={AppStyles.errorBox}>
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <Button 
                type="submit" 
                disabled={loading}
                className={`${AppStyles.btnPrimary} w-full flex justify-center items-center`}
              >
                {loading ? "ENVIANDO..." : "ENVIAR ENLACE"}
              </Button>
            </form>
          ) : (
            <div className="text-center bg-green-500/10 border border-green-500/20 p-6 rounded-xl animate-fade-in">
              <div className="text-4xl mb-3">📩</div>
              <h3 className="text-white font-bold text-lg mb-2">¡Correo Enviado!</h3>
              <p className="text-gray-300 text-sm mb-4">{message}</p>
            </div>
          )}

          <div className="mt-8 text-center border-t border-white/10 pt-4">
            <Link to="/login" className="text-sm text-gray-400 hover:text-green-400 transition-colors font-semibold">
              ← Volver al Login
            </Link>
          </div>

        </Card>
      </div>
    </PageLayout>
  );
};