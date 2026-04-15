import { AppStyles } from "../../Styles/AppStyles";
import { ToggleSwitch } from "../../Components/UI/ToggleSwitch";
import { usePreferences } from "../../Hooks/Config/usePreferences";
import { Settings, Bot, Save, Monitor, Package } from "lucide-react";

export const Preferences = () => {
    const { 
        loading, 
        autoBirthday, toggleBirthday,
        autoReceipts, toggleReceipts,
        birthdayMessage, setBirthdayMessage, saveBirthdayMessage, savingMessage,
        showFinancialMetrics, setShowFinancialMetrics,
        moduloAsistencia, toggleAsistencia
    } = usePreferences();

    if (loading) return <div className="text-white text-center pt-20">Cargando preferencias...</div>;

    return (
        <div className={AppStyles.principalContainer}>
            <div className="w-full max-w-4xl mx-auto">
                
                <div className={AppStyles.headerContainer.replace("text-center", "text-left")}>
                    <div className="flex items-center gap-3">
                        <Settings className="w-7 h-7 text-white" />
                        <h1 className={AppStyles.title}>Configuración</h1>
                    </div>
                    <p className={AppStyles.subtitle}>Personaliza el comportamiento de tu sistema.</p>
                </div>

                <div className="space-y-6 mt-8">
                    
                    {/* SECCIÓN 1: AUTOMATIZACIONES (Backend) */}
                    <div className={AppStyles.glassCard}>
                        <h3 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4 flex items-center gap-2">
                            <Bot className="w-6 h-6 text-blue-400" /> Automatizaciones (WhatsApp)
                        </h3>
                        
                        {/* Cumpleaños */}
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <p className="text-white font-bold text-lg">Saludos de Cumpleaños</p>
                                <p className="text-gray-400 text-sm">Enviar un mensaje automático a las 9:00 AM a los socios que cumplan años.</p>
                            </div>
                            <ToggleSwitch checked={autoBirthday} onChange={toggleBirthday} />
                        </div>

                        {/* Cumpleaños - Editor de Mensaje (Solo si está activo) */}
                        {autoBirthday && (
                            <div className="mb-8 ml-1 pl-4 border-l-2 border-green-500/30 animate-fade-in-down">
                                <label className="block text-gray-300 text-sm font-bold mb-2">
                                    Mensaje Personalizado:
                                </label>
                                <div className="text-xs text-gray-500 mb-2">
                                    Puedes usar <span className="text-green-400">{`{nombre}`}</span> para el nombre del socio y <span className="text-green-400">{`{gym}`}</span> para el nombre del gimnasio.
                                    <span className="italic opacity-70 ml-1">(Si lo dejas vacío, se usará el mensaje por defecto).</span>
                                </div>
                                <textarea 
                                    value={birthdayMessage}
                                    onChange={(e) => setBirthdayMessage(e.target.value)}
                                    className="w-full bg-gray-900/50 text-white p-3 rounded-lg border border-white/10 focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all text-sm h-32 resize-none"
                                    placeholder={`¡Feliz Cumpleaños {nombre}! 🎂🎈\n\nDesde *{gym}* queremos desearte un día excelente.\n¡Gracias por entrenar con nosotros! 💪🎁`}
                                />
                                <div className="flex justify-end mt-2">
                                    <button 
                                        onClick={saveBirthdayMessage}
                                        disabled={savingMessage}
                                        className="bg-green-600 hover:bg-green-500 text-white text-xs font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        {savingMessage ? 'Guardando...' : <span className="flex items-center justify-center gap-2"><Save className="w-4 h-4" /> Guardar Mensaje</span>}
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="h-px bg-white/10 my-6"></div>

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
                        <h3 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4 flex items-center gap-2">
                            <Monitor className="w-6 h-6 text-purple-400" /> Interfaz y Métricas
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

                    {/* SECCIÓN 3: MÓDULOS DEL SISTEMA */}
                    <div className={AppStyles.glassCard}>
                        <h3 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4 flex items-center gap-2">
                            <Package className="w-6 h-6 text-green-400" /> Módulos del Sistema
                        </h3>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white font-bold text-lg">Control de Asistencia</p>
                                <p className="text-gray-400 text-sm">Habilita el escaneo de códigos QR, concurrencia en vivo y control de accesos.</p>
                            </div>
                            <ToggleSwitch checked={moduloAsistencia} onChange={toggleAsistencia} />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};