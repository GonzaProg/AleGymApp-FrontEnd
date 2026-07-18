import { CustomSelect } from "./CustomSelect";
import { AppStyles } from "../../Styles/AppStyles";
import { Banknote, CreditCard } from "lucide-react";

interface Props {
    value: string;
    onChange: (value: string) => void;
    label?: string;
    className?: string;
}

export const PaymentMethodSelect = ({ 
    value, 
    onChange, 
    label = "Método de Pago", 
    className = ""
}: Props) => {
    const paymentOptions = [
        { value: "Efectivo", label: "Efectivo", icon: <Banknote className="w-4 h-4 text-green-400" /> },
        { value: "Transferencia", label: "Transferencia", icon: <CreditCard className="w-4 h-4 text-blue-400" /> }
    ];

    return (
        <div className={className}>
            {label && <label className={AppStyles.label}>{label}</label>}
            <CustomSelect 
                options={paymentOptions}
                value={value}
                onChange={onChange}
                placeholder="Seleccione método"
            />
        </div>
    );
};