import { AppStyles } from "../../Styles/AppStyles";
import { ChevronDown } from "lucide-react";

interface Props {
    value: string;
    onChange: (value: string) => void;
    label?: string;
    className?: string;
    selectClassName?: string; // Para personalizar el input (ej: centrar texto)
}

export const PaymentMethodSelect = ({ 
    value, 
    onChange, 
    label = "Método de Pago", 
    className = "",
    selectClassName = ""
}: Props) => {
    return (
        <div className={className}>
            {label && <label className={AppStyles.label}>{label}</label>}
            
            <div className="relative group">
                {/* appearance-none: Oculta la flecha fea por defecto del navegador.
                    bg-gray-900 en options: Fuerza el fondo oscuro al desplegar.
                */}
                <select 
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={`${AppStyles.inputDark} appearance-none cursor-pointer pr-10 ${selectClassName}`}
                >
                    <option value="Efectivo" className={AppStyles.darkBackgroundSelect}>💵 Efectivo</option>
                    <option value="Transferencia" className={AppStyles.darkBackgroundSelect}>💳 Transferencia</option>
                </select>

                {/* Flecha personalizada con efecto Neon */}
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500 group-hover:text-green-400 transition-colors">
                    <ChevronDown className="w-4 h-4 fill-current" />
                </div>
            </div>
        </div>
    );
};