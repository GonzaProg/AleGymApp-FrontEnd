import React, { useState } from "react";
import { useNotificaciones } from "../../Hooks/Notificaciones/useNotificaciones";
import { useAuthUser } from "../../Hooks/Auth/useAuthUser";
import { AppStyles } from "../../Styles/AppStyles";
import { Megaphone, Send, Globe, Building2 } from "lucide-react";

export const CreateNotification = () => {
  const { sendBroadcast, sendBroadcastGlobal, loading } = useNotificaciones();
  const { isAdmin, currentUser } = useAuthUser();
  const [alcance, setAlcance] = useState<"gym" | "global">("gym");
  const [form, setForm] = useState({ titulo: "", mensaje: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titulo.trim() || !form.mensaje.trim()) return;

    let exito = false;
    if (isAdmin && alcance === "global") {
      exito = await sendBroadcastGlobal(form.titulo, form.mensaje);
    } else {
      exito = await sendBroadcast(form.titulo, form.mensaje);
    }

    if (exito) {
      setForm({ titulo: "", mensaje: "" });
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
        </div>
    </div>
  );
};