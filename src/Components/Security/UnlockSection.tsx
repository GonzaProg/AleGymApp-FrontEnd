import { Lock } from "lucide-react";
import { AppStyles } from "../../Styles/AppStyles";
import { Input } from "../UI/Input";
import { Button } from "../UI/Button";

interface UnlockSectionProps {
    passwordInput: string;
    setPasswordInput: (val: string) => void;
    handleDesbloquear: () => void;
    verifying: boolean;
    className?: string;
}

export const UnlockSection = ({ passwordInput, setPasswordInput, handleDesbloquear, verifying, className = "" }: UnlockSectionProps) => {
    return (
        <div className={`flex justify-center items-center w-full animate-fade-in-down ${className}`}>
            <div className={`${AppStyles.glassCard} flex flex-col items-center justify-center p-8 border-red-500/30 text-center w-full max-w-md`}>
                <Lock className="w-12 h-12 text-red-400 mb-6" />
                <h2 className="text-xl font-bold text-white mb-4">Acceso Restringido</h2>
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                    <Input 
                        type="password" 
                        placeholder="Contraseña" 
                        value={passwordInput} 
                        onChange={(e) => setPasswordInput(e.target.value)} 
                        className={`${AppStyles.inputDark} text-center tracking-[0.3em] font-mono`}
                        onKeyDown={(e) => e.key === 'Enter' && handleDesbloquear()}
                    />
                    <Button 
                        onClick={handleDesbloquear} 
                        disabled={verifying}
                        className="bg-red-600/50 hover:bg-red-500 border border-red-500/50 text-white font-bold px-6"
                    >
                        {verifying ? "Verificando..." : "Desbloquear"}
                    </Button>
                </div>
            </div>
        </div>
    );
};
