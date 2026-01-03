import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../../Components/Navbar";
import { useNotificaciones } from "../../Hooks/Notificaciones/useNotificaciones";
import { AppStyles } from "../../Styles/AppStyles";
import fondoNotificaciones from "../../assets/Fondo-Notificaciones.png";

export const CreateNotification = () => {
  const navigate = useNavigate();
  const { sendBroadcast, loading } = useNotificaciones();
  
  const [form, setForm] = useState({ titulo: "", mensaje: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titulo.trim() || !form.mensaje.trim()) return;
    
    await sendBroadcast(form.titulo, form.mensaje);
    navigate("/home"); // Volver al inicio tras enviar
  };

  return (
    <div className={AppStyles.pageContainer}>
      <div
        className={AppStyles.fixedBackground}
        style={{
          backgroundImage: `url(${fondoNotificaciones})`,
          filter: "brightness(0.6) contrast(1.1)",
        }}
      />

      <Navbar />

      <div className={AppStyles.contentContainer}>
        <div className="w-full max-w-2xl">
          <h2 className={AppStyles.title}>
            Nueva <span className={AppStyles.highlight}>Notificación</span> 📢
          </h2>

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
                  type="button"
                  onClick={() => navigate(-1)}
                  className={AppStyles.btnSecondary}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={AppStyles.btnPrimary + " px-8"}
                >
                  {loading ? "Enviando..." : "🚀 Enviar a Todos"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};