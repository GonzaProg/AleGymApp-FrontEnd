import { useState } from "react";
import { useGymConfig } from "../../Context/GymConfigContext";
import { PageLayout } from "../../Components/UI/PageLayout";
import { Card } from "../../Components/UI/Card";
import { Input } from "../../Components/UI/Input";
import { Button } from "../../Components/UI/Button";
import { AppStyles } from "../../Styles/AppStyles";
import fondoSetup from "../../assets/Fondo-Login.jpg"; 

export const SetupScreen = () => {
  const { setGymLocal } = useGymConfig();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Validamos con el Backend que el código exista realmente
      // Necesitarás un endpoint simple tipo GET /api/gyms/validate/:code
      // O simplemente intentamos guardar y si el back no chilla, ok.
      
      // Simulación de validación (idealmente haz una llamada a API real)
      if (code.length < 3) throw new Error("Código muy corto.");
      
      // 2. Si es válido, lo guardamos "Para siempre" en esta PC
      setGymLocal(code);
      
      // La app se recargará o redirigirá sola gracias al Context
    } catch (err) {
      setError("Código inválido o error de conexión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout centered showNavbar={false} backgroundImage={fondoSetup}>
      <Card className={AppStyles.glassCard}>
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white">Configuración Inicial ⚙️</h1>
          <p className="text-gray-300 mt-2">
            Esta PC aún no está vinculada a ningún gimnasio.
          </p>
        </div>

        <form onSubmit={handleSaveConfig} className="space-y-6">
          <div>
            <label className={AppStyles.label}>Código del Gimnasio</label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())} // Forzamos mayúsculas
              placeholder="Ej: IRON-GYM"
              className={AppStyles.inputDark}
              required
            />
            <p className="text-xs text-gray-500 mt-1">Este código lo provee el administrador del sistema.</p>
          </div>

          {error && <div className={AppStyles.errorBox}>{error}</div>}

          <Button type="submit" disabled={loading} className={`${AppStyles.btnPrimary} w-full`}>
            VINCULAR ESTA PC
          </Button>
        </form>
      </Card>
    </PageLayout>
  );
};