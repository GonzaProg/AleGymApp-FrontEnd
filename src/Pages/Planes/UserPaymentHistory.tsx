import { SharedPaymentHistory } from "../../Components/Usuarios/SharedPaymentHistory";

export const UserPaymentHistory = ({ alumnoSeleccionado, onBack }: any) => {
    return (
        <SharedPaymentHistory 
            user={alumnoSeleccionado} 
            onBack={onBack} 
            showPlanSummary={true} 
            isEmbedded={true} 
        />
    );
};
