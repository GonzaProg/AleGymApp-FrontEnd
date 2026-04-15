import React, { useState } from "react";
import { useNotificaciones } from "../../Hooks/Notificaciones/useNotificaciones";
import { AppStyles } from "../../Styles/AppStyles";
import { Megaphone, Send } from "lucide-react";

export const CreateNotification = () => {
  const { sendBroadcast, loading } = useNotificaciones();
  const [form, setForm] = useState({ titulo: "", mensaje: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titulo.trim() || !form.mensaje.trim()) return;
    await sendBroadcast(form.titulo, form.mensaje);
    // Aquí podrías limpiar el form o mostrar mensaje de éxito
    setForm({ titulo: "", mensaje: "" });
  };

  return (
    <div className={AppStyles.principalContainer}>
        <div className="w-full max-w-2xl">
          
          <div className={AppStyles.headerContainer + " mb-14"}>
            <h2 className="text-4xl font-bold mb-4 drop-shadow-lg flex items-center">
                <span className={AppStyles.subtitle}>Envía una Notificación a todos los Usuarios</span>
                <Megaphone className="w-8 h-8 text-white ml-3" />
            </h2>
          </div>

          <div className={AppStyles.glassCard}>
            <div className={AppStyles.gradientDivider}></div>

            <form onSubmit={handleSubmit} className="space-y-6">
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
                  placeholder="Escribe el contenido del mensaje para todos los alumnos..."
                  value={form.mensaje}
                  onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
                  required
                />
                <p className="text-right text-xs text-gray-500 mt-1">
                  {form.mensaje.length}/500
                </p>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className={AppStyles.btnPrimary + " px-8 w-full"}
                >
                  {loading ? "Enviando..." : <span className="flex items-center justify-center gap-2"><Send className="w-4 h-4" /> Enviar a Todos</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
    </div>
  );
};