import { useProfile } from "../Hooks/Profile/useProfile";
import { Navbar } from "../Components/Navbar";
import { Input } from "../Components/UI/Input";
import { Button } from "../Components/UI/Button";
import fondoPerfil from "../assets/Fondo-Perfil.png";

export const Profile = () => {
  const { loading, userData, isEditingProfile, editForm, showPasswordSection, passForm, setIsEditingProfile, setShowPasswordSection, handleEditChange, handlePassChange, handleImageUpload, handleSaveProfile, handleChangePassword, handleCancelPassword } = useProfile();

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-300">Cargando...</div>;

  return (
    <div className="relative min-h-screen font-sans bg-gray-900 text-gray-200">

      {/* --- FONDO FIJO --- */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${fondoPerfil})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          filter: 'brightness(0.4) contrast(1.1)' 
        }}
      />

      <Navbar />

      {/* --- CONTENEDOR PRINCIPAL --- */}
      <div style={{marginTop:"20px"}} className="relative z-10 pt-28 pb-10 px-4 w-full flex justify-center">
        
        {/* max-w-2xl (antes era lg) */}
        <div className="w-full max-w-2xl space-y-8">

          {/* --- CARD PERFIL --- */}
          <div className="w-full backdrop-blur-xl bg-gray-900/80 border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
            
            <div className="h-36 bg-gradient-to-r from-green-900 to-blue-900/40 relative"></div>

            <div className="px-10 pb-10">
              
              <div className="relative flex justify-center -mt-20 mb-6">
                <div className="w-32 h-32 rounded-full border-[6px] border-gray-800 bg-gray-700 shadow-2xl overflow-hidden relative group z-10">
                  {userData?.fotoPerfil || editForm.fotoPerfil ? (
                    <img src={isEditingProfile ? editForm.fotoPerfil : userData.fotoPerfil} alt="Perfil" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl text-gray-400 font-bold">{userData?.nombre?.charAt(0)}</div>
                  )}

                  {isEditingProfile && (
                    <label className="absolute inset-0 bg-black/60 flex items-center justify-center cursor-pointer text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-4xl">📷</span>
                      <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                    </label>
                  )}
                </div>
              </div>

              {/* Contenido Texto */}
              <div className="text-center">
                {isEditingProfile ? (
                  // MODO EDICIÓN
                  <div className="space-y-5 text-left animate-fade-in-up px-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Nombre" value={editForm.nombre} onChange={e => handleEditChange('nombre', e.target.value)} className="bg-black/30 border-white/10 text-white p-3" />
                      <Input label="Apellido" value={editForm.apellido} onChange={e => handleEditChange('apellido', e.target.value)} className="bg-black/30 border-white/10 text-white p-3" />
                    </div>
                    <Input label="Usuario" value={editForm.nombreUsuario} onChange={e => handleEditChange('nombreUsuario', e.target.value)} className="bg-black/30 border-white/10 text-white p-3" />
                    <Input label="Email" value={editForm.email} onChange={e => handleEditChange('email', e.target.value)} className="bg-black/30 border-white/10 text-white p-3" />

                    <div className="flex justify-center gap-4 pt-6">
                      <Button variant="ghost" onClick={() => setIsEditingProfile(false)} className="text-gray-400 text-lg px-6">Cancelar</Button>
                      <Button onClick={handleSaveProfile} className="bg-green-600 hover:bg-green-500 text-white text-lg px-8 py-2">Guardar Cambios</Button>
                    </div>
                  </div>
                ) : (
                  // MODO VISTA
                  <div className="space-y-3">
                    <h2 className="text-4xl md:text-5xl font-black capitalize text-white tracking-tight drop-shadow-lg">
                      {userData.nombre} <span className="text-green-500">{userData.apellido}</span>
                    </h2>
                    
                    <p className="text-base md:text-lg text-gray-300 font-medium">
                      @{userData.nombreUsuario} • {userData.email}
                    </p>
                    
                    <div className="pt-10">
                      <Button 
                        onClick={() => setIsEditingProfile(true)} 
                        className="bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 text-base py-3 px-8 rounded-xl flex items-center gap-3 mx-auto transition-all hover:scale-105"
                      >
                        ✏️ Editar Perfil
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* --- CARD SEGURIDAD --- */}
          <div className="w-full backdrop-blur-xl bg-gray-900/80 border border-white/10 rounded-2xl shadow-xl p-8">
            {!showPasswordSection ? (
              <div className="flex justify-between items-center">
                 <div className="flex items-center gap-4">
                    <span className="text-3xl bg-gray-800 p-2 rounded-lg">🔒</span>
                    <div>
                        <span className="font-bold text-gray-100 text-xl block">Seguridad</span>
                        <span className="text-gray-500 text-sm">Gestiona tu contraseña</span>
                    </div>
                 </div>
                 <button onClick={() => setShowPasswordSection(true)} className="text-green-500 hover:text-green-400 font-bold text-base tracking-wider hover:bg-green-500/10 px-4 py-2 rounded-lg transition-all">
                    Cambiar Contraseña
                 </button>
              </div>
            ) : (
              <div className="animate-fade-in-up space-y-6">
                <h3 className="text-lg font-bold text-gray-300 border-b border-white/5 pb-3">🔒 ACTUALIZAR CONTRASEÑA</h3>
                
                <div className="bg-black/20 p-6 rounded-xl border border-white/5 space-y-4">
                    <Input label="Contraseña Actual" type="password" value={passForm.currentPassword} onChange={e => handlePassChange('currentPassword', e.target.value)} className="bg-black/30 border-white/10 text-white p-3" />
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Nueva" type="password" value={passForm.newPassword} onChange={e => handlePassChange('newPassword', e.target.value)} className="bg-black/30 border-white/10 text-white p-3" />
                        <Input label="Repetir" type="password" value={passForm.confirmPassword} onChange={e => handlePassChange('confirmPassword', e.target.value)} className="bg-black/30 border-white/10 text-white p-3" />
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <Button variant="ghost" onClick={handleCancelPassword} className="text-gray-400 text-base">Cancelar</Button>
                    <Button onClick={handleChangePassword} className="bg-red-600/80 hover:bg-red-500 text-white text-base px-6">Actualizar</Button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};