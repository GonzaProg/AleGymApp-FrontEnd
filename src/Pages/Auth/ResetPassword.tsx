import { Link } from "react-router-dom";
import { PageLayout } from "../../Components/UI/PageLayout";
import { Card } from "../../Components/UI/Card";
import { Input } from "../../Components/UI/Input";
import { Button } from "../../Components/UI/Button";
import { AppStyles } from "../../Styles/AppStyles";
import { useResetPassword } from "../../Hooks/Auth/useResetPassword";
import fondoLogin from "../../assets/Fondo-Login.png";

export const ResetPassword = () => {
  const { 
    password, confirmPassword, loading, error, success, isValidToken,
    handlePasswordChange, handleConfirmChange, handleSubmit 
  } = useResetPassword();

  return (
    <PageLayout centered showNavbar={false} backgroundImage={fondoLogin}>
      
      <div className="w-full max-w-md">
        <Card className={AppStyles.glassCard}>
          
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-white drop-shadow-md">Nueva Contraseña</h2>
          </div>

          {success ? (
             // --- ESTADO DE ÉXITO ---
            <div className="text-center py-4">
              <div className="bg-green-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/50">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">¡Contraseña Actualizada!</h3>
              <p className="text-gray-300 mb-6 text-sm">Ya puedes ingresar con tu nueva clave.</p>
              
              <Link to="/login">
                <Button className={`${AppStyles.btnPrimary} w-full`}>
                  IR AL LOGIN
                </Button>
              </Link>
            </div>
          ) : (
             // --- FORMULARIO ---
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {!isValidToken && (
                <div className={AppStyles.errorBox}>
                   Token inválido. Por favor solicita un nuevo correo.
                </div>
              )}

              <div>
                <label className={AppStyles.label}>Nueva Contraseña</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={handlePasswordChange}
                  required
                  minLength={6}
                  className={AppStyles.inputDark}
                  disabled={!isValidToken}
                />
              </div>

              <div>
                <label className={AppStyles.label}>Confirmar Contraseña</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={handleConfirmChange}
                  required
                  className={AppStyles.inputDark}
                  disabled={!isValidToken}
                />
              </div>

              {error && (
                <div className={AppStyles.errorBox}>
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <Button 
                type="submit" 
                disabled={loading || !isValidToken}
                className={`${AppStyles.btnPrimary} w-full`}
              >
                {loading ? "ACTUALIZANDO..." : "CAMBIAR CONTRASEÑA"}
              </Button>
            </form>
          )}

        </Card>
      </div>
    </PageLayout>
  );
};