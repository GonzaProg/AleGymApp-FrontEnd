import { Link } from "react-router-dom";
import { PageLayout } from "../../Components/UI/PageLayout";
import { Card } from "../../Components/UI/Card";
import { Input } from "../../Components/UI/Input";
import { Button } from "../../Components/UI/Button";
import { AppStyles } from "../../Styles/AppStyles";
import { useRecoverPassword } from "../../Hooks/Auth/useRecoverPassword";
import fondoLogin from "../../assets/Fondo-Login.jpg";

export const ForgotPassword = () => {
  const { 
    step, loading, error, 
    dni, setDni, 
    code, setCode, 
    newPassword, setNewPassword, 
    confirmPassword, setConfirmPassword,
    telefonoDestino, 
    handleSendCode, handleChangePassword 
  } = useRecoverPassword();

  return (
    <PageLayout centered showNavbar={false} backgroundImage={fondoLogin}>
      <div className="w-full max-w-md animate-fade-in-up">
        <Card className={AppStyles.glassCard}>
          
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-white drop-shadow-md mb-2">
                {step === 1 ? "Recuperar Acceso" : "Verificar Código"}
            </h2>
            <p className="text-gray-300 text-sm px-4">
              {step === 1 
                ? "Ingresa tu DNI para recibir un código por WhatsApp." 
                : <span>Hemos enviado un código al WhatsApp <b className="text-green-400">{telefonoDestino}</b>.</span>
              }
            </p>
          </div>

          {/* Renderizado condicional según el paso */}
          {step === 1 ? (
            //  PASO 1: FORMULARIO DNI 
            <form onSubmit={handleSendCode} className="space-y-6">
              <div>
                <label className={AppStyles.label}>DNI</label>
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="Ingresa tu documento"
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                  required
                  className={AppStyles.inputDark}
                  autoFocus
                />
              </div>
              
              {error && <div className={AppStyles.errorBox}>{error}</div>}

              <Button type="submit" disabled={loading} className={`${AppStyles.btnPrimary} w-full`}>
                {loading ? "ENVIANDO..." : "ENVIAR CÓDIGO"}
              </Button>
            </form>
          ) : (
            //  PASO 2: FORMULARIO CÓDIGO + NUEVA CLAVE 
            <form onSubmit={handleChangePassword} className="space-y-5 animate-fade-in">
              <div>
                <label className={AppStyles.label}>Código de 6 dígitos</label>
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="Ej: 123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  maxLength={6}
                  className={`${AppStyles.inputDark} text-center tracking-widest text-xl font-bold`}
                  autoFocus
                />
              </div>

              <div>
                <label className={AppStyles.label}>Nueva Contraseña</label>
                <Input
                  type="password"
                  placeholder="******"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className={AppStyles.inputDark}
                />
              </div>

              {/* CAMPO DE CONFIRMACIÓN */}
              <div>
                <label className={AppStyles.label}>Confirmar Contraseña</label>
                <Input
                  type="password"
                  placeholder="******"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className={AppStyles.inputDark}
                />
              </div>

              {error && <div className={AppStyles.errorBox}>{error}</div>}

              <Button type="submit" disabled={loading} className={`${AppStyles.btnPrimary} w-full`}>
                {loading ? "VALIDANDO..." : "CAMBIAR CONTRASEÑA"}
              </Button>
            </form>
          )}

          <div className="mt-8 text-center border-t border-white/10 pt-4">
            <Link to="/login" className="text-sm text-gray-400 hover:text-white transition-all">
              ← Volver al Login
            </Link>
          </div>

        </Card>
      </div>
    </PageLayout>
  );
};