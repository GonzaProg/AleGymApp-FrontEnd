import React, { useState, useEffect } from "react";
import { useNotificaciones } from "../../Hooks/Notificaciones/useNotificaciones";
import { useAuthUser } from "../../Hooks/Auth/useAuthUser";
import { AppStyles } from "../../Styles/AppStyles";
import { showConfirmDelete } from "../../Helpers/Alerts";
import { Megaphone, Send, Globe, Building2, Trash2, Power } from "lucide-react";

export const CreateNotification = () => {
  const { sendBroadcast, sendBroadcastGlobal, loading, gymNotificaciones, fetchGymNotifications, toggleNotification, deleteNotification } = useNotificaciones();
  const { isAdmin, currentUser } = useAuthUser();
  const [alcance, setAlcance] = useState<"gym" | "global">("gym");
  const [form, setForm] = useState<{ titulo: string, mensaje: string, duracionDias: number | string }>({ titulo: "", mensaje: "", duracionDias: 7 });

  useEffect(() => {
    fetchGymNotifications();
  }, [fetchGymNotifications]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titulo.trim() || !form.mensaje.trim()) return;

    let exito = false;
    const duracionFinal = typeof form.duracionDias === 'number' ? form.duracionDias : parseInt(form.duracionDias as string) || 7;

    if (isAdmin && alcance === "global") {
      exito = await sendBroadcastGlobal(form.titulo, form.mensaje, duracionFinal);
    } else {
      exito = await sendBroadcast(form.titulo, form.mensaje, duracionFinal);
    }

    if (exito) {
      setForm({ titulo: "", mensaje: "", duracionDias: 7 });
    }
  };

  const gymNombre = currentUser?.gym?.nombre || "Gimnasio Actual";

  return (
    <div className={AppStyles.principalContainer}>
        <div className="w-full max-w-2xl">
          
          <div className={AppStyles.headerContainer + " mb-10"}>
            <h2 className="text-4xl font-bold mb-3 drop-shadow-lg flex items-center justify-center">
                <span className={AppStyles.subtitle}>
                  {isAdmin && alcance === "global" 
                    ? "Notificación Global para Toda la Plataforma" 
                    : "Envía una Notificación a los Usuarios"}
                </span>
                {isAdmin && alcance === "global" ? (
                  <Globe className="w-8 h-8 text-cyan-400 ml-3 shrink-0" />
                ) : (
                  <Megaphone className="w-8 h-8 text-white ml-3 shrink-0" />
                )}
            </h2>
            <p className="text-gray-400 text-sm">
              {isAdmin && alcance === "global"
                ? "Llega a todos los socios registrados de todos los gimnasios (Sin Notificación Push)"
                : `Llega a todos los socios activos de ${gymNombre}`}
            </p>
          </div>

          <div className={AppStyles.glassCard}>
            <div className={AppStyles.gradientDivider}></div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* SELECTOR DE ALCANCE: SOLO PARA ADMINISTRADORES */}
              {isAdmin && (
                <div className="bg-black/30 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className={AppStyles.label + " mb-0"}>
                      Destinatarios del Mensaje
                    </label>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      Opciones Admin
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setAlcance("gym")}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                        alcance === "gym"
                          ? "border-green-500 bg-green-500/15 text-white shadow-lg shadow-green-950/50 scale-[1.01]"
                          : "border-white/10 bg-black/20 text-gray-400 hover:border-white/20 hover:text-gray-300"
                      }`}
                    >
                      <Building2 className={`w-5 h-5 shrink-0 ${alcance === "gym" ? "text-green-400" : "text-gray-500"}`} />
                      <div className="overflow-hidden">
                        <p className="text-sm font-semibold truncate">{gymNombre}</p>
                        <p className="text-xs text-gray-400">Solo socios de este gimnasio</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAlcance("global")}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                        alcance === "global"
                          ? "border-cyan-500 bg-cyan-500/15 text-white shadow-lg shadow-cyan-950/50 scale-[1.01]"
                          : "border-white/10 bg-black/20 text-gray-400 hover:border-white/20 hover:text-gray-300"
                      }`}
                    >
                      <Globe className={`w-5 h-5 shrink-0 ${alcance === "global" ? "text-cyan-400" : "text-gray-500"}`} />
                      <div className="overflow-hidden">
                        <p className="text-sm font-semibold truncate text-cyan-300">Global (Todos)</p>
                        <p className="text-xs text-gray-400">Todos los usuarios del sistema</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className={AppStyles.label}>Título</label>
                <input
                  type="text"
                  maxLength={50}
                  className={AppStyles.inputDark}
                  placeholder="Ej: Aviso Importante"
                  value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className={AppStyles.label}>
                  Mensaje <span className="text-xs lowercase text-gray-500">(Máx 500 caracteres)</span>
                </label>
                <textarea
                  rows={5}
                  maxLength={500}
                  className={AppStyles.inputDark + " resize-none"}
                  placeholder={
                    isAdmin && alcance === "global"
                      ? "Escribe el contenido del mensaje global para toda la plataforma..."
                      : "Escribe el contenido del mensaje para todos los alumnos..."
                  }
                  value={form.mensaje}
                  onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
                  required
                />
                <p className="text-right text-xs text-gray-500 mt-1">
                  {form.mensaje.length}/500
                </p>
              </div>

              <div>
                <label className={AppStyles.label}>
                  Duración en el tablón (días)
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  className={AppStyles.inputDark}
                  value={form.duracionDias}
                  onChange={(e) => setForm({ ...form, duracionDias: e.target.value === '' ? '' : parseInt(e.target.value) })}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Días que la notificación será visible para los usuarios.
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className={`${
                    isAdmin && alcance === "global"
                      ? "bg-cyan-600/70 hover:bg-cyan-500 text-white border-cyan-400 shadow-cyan-900/30"
                      : AppStyles.btnPrimary
                  } px-8 w-full font-bold py-3 rounded-xl shadow-lg border transition-all hover:scale-[1.02] flex items-center justify-center gap-2`}
                >
                  {loading ? (
                    "Enviando..."
                  ) : isAdmin && alcance === "global" ? (
                    <span className="flex items-center justify-center gap-2">
                      <Globe className="w-4 h-4 text-white" /> Enviar Notificación Global
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Send className="w-4 h-4" /> Enviar a Usuarios
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
          
          {/* LISTA DE NOTIFICACIONES */}
          <div className="mt-10 mb-20">
            <h3 className="text-xl font-bold text-white mb-4">Notificaciones Enviadas</h3>
            <div className="space-y-4">
              {gymNotificaciones.length === 0 ? (
                <p className="text-gray-400 text-center py-6 bg-black/20 rounded-xl border border-white/5">No hay notificaciones masivas enviadas.</p>
              ) : (
                gymNotificaciones.map(notif => (
                  <div key={notif.id} className={`${AppStyles.glassCard} !p-4 flex items-center justify-between gap-4 border ${notif.activa ? 'border-green-500/30' : 'border-gray-500/30 opacity-70'}`}>
                    <div className="flex-1">
                      <h4 className="text-white font-bold mb-1 flex items-center gap-2">
                        {notif.titulo}
                        {!notif.activa && <span className="text-[10px] bg-gray-600/50 text-gray-300 px-2 py-0.5 rounded-full uppercase tracking-wider">Inactiva</span>}
                      </h4>
                      <p className="text-gray-400 text-sm whitespace-pre-wrap break-words">{notif.mensaje}</p>
                      <p className="text-[10px] text-gray-500 mt-2">
                        Creada: {new Date(notif.fechaCreacion).toLocaleDateString()} 
                        {notif.fechaExpiracion && ` • Expira: ${new Date(notif.fechaExpiracion).toLocaleDateString()}`}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => toggleNotification(notif.id)}
                        className={`p-2 rounded-xl transition-all ${notif.activa ? 'bg-orange-500/10 text-orange-400 hover:bg-orange-500/20' : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'}`}
                        title={notif.activa ? "Desactivar del tablón" : "Activar en tablón"}
                      >
                        <Power className="w-5 h-5" />
                      </button>
                      
                      <button 
                        onClick={async () => {
                          const result = await showConfirmDelete("¿Eliminar Notificación?", "¿Seguro que deseas eliminar esta notificación permanentemente?");
                          if (result.isConfirmed) {
                            deleteNotification(notif.id);
                          }
                        }}
                        className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl transition-all"
                        title="Eliminar permanentemente"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
    </div>
  );
};