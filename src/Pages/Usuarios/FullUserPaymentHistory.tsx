import { type AlumnoDTO } from "../../API/Usuarios/UsuarioApi";
import { SharedPaymentHistory } from "../../Components/Usuarios/SharedPaymentHistory";

export const FullUserPaymentHistory = ({ user, onBack }: { user: AlumnoDTO, onBack: () => void }) => {
    return (
        <SharedPaymentHistory 
            user={user} 
            onBack={onBack} 
            showPlanSummary={false} 
            isEmbedded={false} 
        />
    );
};
