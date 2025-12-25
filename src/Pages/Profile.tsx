import { useState, useEffect } from "react";
import axios from "axios";
import { Navbar } from "../Components/Navbar";

export const Profile = () => {
  const token = localStorage.getItem("token");
  // Obtenemos ID del localStorage de forma segura
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const localId = storedUser.id;

  // --- ESTADOS DE VISTA ---
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  
  // --- ESTADOS DE EDICIÓN PERFIL ---
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    nombre: "",
    apellido: "",
    nombreUsuario: "",
    email: "",
    fotoPerfil: ""
  });

  // --- ESTADOS DE CAMBIO CONTRASEÑA ---
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passForm, setPassForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // 1. CARGAR DATOS AL INICIAR
  useEffect(() => {
    // Simulamos carga de datos frescos usando lo que tenemos en localStorage
    // (Idealmente aquí harías un GET /api/users/me si tuvieras ese endpoint)
    if (storedUser) {
      setUserData(storedUser);
      setEditForm({
        nombre: storedUser.nombre || "",
        apellido: storedUser.apellido || "",
        nombreUsuario: storedUser.nombreUsuario || "",
        email: storedUser.email || "",
        fotoPerfil: storedUser.fotoPerfil || ""
      });
    }
    setLoading(false);
  }, []);

  // --- MANEJO DE FOTO ---
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm({ ...editForm, fotoPerfil: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // --- GUARDAR PERFIL (DATOS) ---
  const handleSaveProfile = async () => {
    try {
      const res = await axios.put(`http://localhost:3000/api/users/${localId}`, editForm, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Actualizamos localStorage y estado
      const updatedUser = { ...userData, ...res.data };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUserData(updatedUser);
      setIsEditingProfile(false);
      
      alert("Datos actualizados correctamente");
      window.location.reload(); // Recargar para ver cambios en el Navbar
    } catch (error: any) {
      alert(error.response?.data?.error || "Error al actualizar");
    }
  };

  // --- GUARDAR CONTRASEÑA ---
  const handleChangePassword = async () => {
    if (!passForm.currentPassword || !passForm.newPassword || !passForm.confirmPassword) {
      return alert("Todos los campos de contraseña son obligatorios");
    }
    if (passForm.newPassword !== passForm.confirmPassword) {
      return alert("Las nuevas contraseñas no coinciden");
    }
    
    try {
      await axios.patch(`http://localhost:3000/api/users/${localId}/password`, passForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert("Contraseña modificada con éxito.");
      setShowPasswordSection(false);
      setPassForm({ currentPassword: "", newPassword: "", confirmPassword: "" }); 
    } catch (error: any) {
      alert(error.response?.data?.error || "Error al cambiar contraseña");
    }
  };

  if (loading) return <div className="p-10 text-center">Cargando perfil...</div>;

  return (
    <div className="min-h-screen bg-gray-100 pb-10">
      <Navbar />

      <div className="container mx-auto p-4 flex flex-col items-center mt-6 space-y-6">
        
        {/* === TARJETA 1: DATOS DE PERFIL === */}
        <div className="bg-white w-full max-w-2xl rounded-xl shadow-lg overflow-hidden">
          
          {/* Banner Verde */}
          <div className="bg-green-600 h-32"></div>
          
          <div className="px-8 pb-8">
            
            {/* ARREGLO VISUAL AQUÍ:
               Usamos Flexbox con margen negativo (-mt-16).
               Esto "sube" la foto 64px hacia el verde, pero mantiene su espacio físico abajo,
               empujando el texto "Nombre Completo" para que no se superponga.
            */}
            <div className="relative flex justify-center -mt-16 mb-6">
              
              <div className="relative">
                {/* Círculo de la foto */}
                <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-gray-200 shadow-md flex items-center justify-center">
                  {isEditingProfile && editForm.fotoPerfil ? (
                     <img src={editForm.fotoPerfil} className="w-full h-full object-cover" />
                  ) : userData?.fotoPerfil ? (
                     <img src={userData.fotoPerfil} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl text-gray-400 font-bold uppercase">
                      {userData?.nombre?.charAt(0)}
                    </span>
                  )}
                </div>

                {/* Botón de Cámara (Solo visible al editar) */}
                {isEditingProfile && (
                  <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 shadow border-2 border-white transition-transform hover:scale-110">
                    📷 
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                )}
              </div>
            </div>

            {/* DATOS DEL USUARIO (Ahora fluyen debajo de la foto correctamente) */}
            <div className="text-center space-y-6">
              
              {/* NOMBRE COMPLETO */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Nombre Completo</label>
                {isEditingProfile ? (
                  <div className="flex gap-2 justify-center">
                    <input className="border p-2 rounded w-full focus:ring-2 focus:ring-green-500 outline-none" value={editForm.nombre} onChange={e => setEditForm({...editForm, nombre: e.target.value})} placeholder="Nombre" />
                    <input className="border p-2 rounded w-full focus:ring-2 focus:ring-green-500 outline-none" value={editForm.apellido} onChange={e => setEditForm({...editForm, apellido: e.target.value})} placeholder="Apellido" />
                  </div>
                ) : (
                  <h2 className="text-3xl font-bold text-gray-800 capitalize">
                    {userData.nombre} {userData.apellido}
                  </h2>
                )}
              </div>

              {/* USUARIO Y EMAIL */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left bg-gray-50 p-4 rounded-lg">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Usuario</label>
                  {isEditingProfile ? (
                    <input className="border p-2 rounded w-full mt-1 bg-white" value={editForm.nombreUsuario} onChange={e => setEditForm({...editForm, nombreUsuario: e.target.value})} />
                  ) : (
                    <p className="text-gray-700 font-medium truncate">@{userData.nombreUsuario || '...'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Email</label>
                  {isEditingProfile ? (
                    <input className="border p-2 rounded w-full mt-1 bg-white" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} />
                  ) : (
                    <p className="text-gray-700 font-medium truncate">{userData.email}</p>
                  )}
                </div>
              </div>

              {/* BOTONES ACCIÓN PERFIL */}
              <div className="pt-2 flex justify-center gap-3">
                {isEditingProfile ? (
                  <>
                    <button onClick={() => setIsEditingProfile(false)} className="px-4 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded">Cancelar</button>
                    <button onClick={handleSaveProfile} className="bg-green-600 text-white px-6 py-2 rounded font-bold hover:bg-green-700 shadow-lg">Guardar Cambios</button>
                  </>
                ) : (
                  <button onClick={() => setIsEditingProfile(true)} className="bg-blue-600 text-white px-8 py-2 rounded-full font-bold hover:bg-blue-700 shadow transition transform hover:-translate-y-1">
                    ✏️ Editar Perfil
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* === TARJETA 2: SEGURIDAD (CONTRASEÑA) === */}
        <div className="bg-white w-full max-w-2xl rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              🔒 Seguridad
            </h3>
            {!showPasswordSection && (
              <button 
                onClick={() => setShowPasswordSection(true)} 
                className="text-green-600 font-bold text-sm hover:underline hover:text-green-800"
              >
                Cambiar Contraseña
              </button>
            )}
          </div>

          {showPasswordSection && (
            <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 mt-4 animate-fade-in">
              <p className="text-sm text-gray-500 mb-4 border-b pb-2">
                Ingresa tu contraseña actual y la nueva para confirmar el cambio.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase">Contraseña Actual</label>
                  <input 
                    type="password" 
                    className="w-full border p-2 rounded mt-1 focus:ring-2 focus:ring-green-500 outline-none" 
                    value={passForm.currentPassword}
                    onChange={e => setPassForm({...passForm, currentPassword: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase">Nueva Contraseña</label>
                    <input 
                      type="password" 
                      className="w-full border p-2 rounded mt-1 focus:ring-2 focus:ring-green-500 outline-none" 
                      value={passForm.newPassword}
                      onChange={e => setPassForm({...passForm, newPassword: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase">Confirmar Nueva</label>
                    <input 
                      type="password" 
                      className="w-full border p-2 rounded mt-1 focus:ring-2 focus:ring-green-500 outline-none" 
                      value={passForm.confirmPassword}
                      onChange={e => setPassForm({...passForm, confirmPassword: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t pt-4">
                <button 
                  onClick={() => {
                    setShowPasswordSection(false);
                    setPassForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                  }} 
                  className="px-4 py-2 text-gray-500 font-bold hover:bg-gray-200 rounded"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleChangePassword} 
                  className="bg-green-600 text-white px-6 py-2 rounded font-bold hover:bg-green-700 shadow"
                >
                  Actualizar Contraseña
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};