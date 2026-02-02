import { AppStyles } from "../../Styles/AppStyles";
import { ToggleSwitch } from "../../Components/UI/ToggleSwitch";
import { usePreferences } from "../../Hooks/Config/usePreferences";

export const Preferences = () => {
    const { 
        loading, 
        autoBirthday, toggleBirthday,
        autoReceipts, toggleReceipts,
        showFinancialMetrics, setShowFinancialMetrics
    } = usePreferences();

    if (loading) return <div className="text-white text-center pt-20">Cargando preferencias...</div>;

    return (
        <div className="w-full h-full flex flex-col pt-6 px-4 animate-fade-in">
            <div className="w-full max-w-4xl mx-auto">
                
                <div className={AppStyles.headerContainer.replace("text-center", "text-left")}>
                    <h1 className={AppStyles.title}>Configuración ⚙️</h1>
                    <p className={AppStyles.subtitle}>Personaliza el comportamiento de tu sistema.</p>
                </div>

                <div className="space-y-6 mt-8">
                    
                    {/* SECCIÓN 1: AUTOMATIZACIONES (Backend) */}
                    <div className={AppStyles.glassCard}>
                        <h3 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">
                            🤖 Automatizaciones (WhatsApp)
                        </h3>
                        
                        {/* Cumpleaños */}
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <p className="text-white font-bold text-lg">Saludos de Cumpleaños</p>
                                <p className="text-gray-400 text-sm">Enviar un mensaje automático a las 9:00 AM a los socios que cumplan años.</p>
                            </div>
                            <ToggleSwitch checked={autoBirthday} onChange={toggleBirthday} />
                        </div>

                        {/* Recibos */}
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white font-bold text-lg">Recibos de Pago</p>
                                <p className="text-gray-400 text-sm">Enviar PDF del comprobante automáticamente al registrar un pago o renovación.</p>
                            </div>
                            <ToggleSwitch checked={autoReceipts} onChange={toggleReceipts} />
                        </div>
                    </div>

                    {/* SECCIÓN 2: INTERFAZ (Local) */}
                    <div className={AppStyles.glassCard}>
                        <h3 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">
                            🖥️ Interfaz y Métricas
                        </h3>

                        {/* Métricas Financieras */}
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white font-bold text-lg">Panel Financiero</p>
                                <p className="text-gray-400 text-sm">Mostrar gráficas de ingresos y métricas en el historial de pagos.</p>
                            </div>
                            <ToggleSwitch checked={showFinancialMetrics} onChange={setShowFinancialMetrics} />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};