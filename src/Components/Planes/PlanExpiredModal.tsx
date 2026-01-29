import { Button } from "../UI/Button";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const PlanExpiredModal = ({ isOpen, onClose }: Props) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-gray-900 border border-red-500/30 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl shadow-red-900/20 relative transform transition-all scale-100">
        
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">📅</span>
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">¡Plan Vencido!</h2>
        
        <p className="text-gray-300 text-sm mb-6">
          Tu suscripción ha expirado. Para seguir entrenando, por favor acércate a recepción o contacta a tu entrenador para renovar tu acceso.
        </p>

        <Button onClick={onClose} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3">
          Entendido, voy a renovar
        </Button>
      </div>
    </div>
  );
};