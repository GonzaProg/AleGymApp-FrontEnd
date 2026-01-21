import { useProfile } from "../../Hooks/Profile/useProfile";
import { Input } from "../../Components/UI/Input";
import { Button } from "../../Components/UI/Button";
import { AppStyles } from "../../Styles/AppStyles"; 
import { ProfileStyles } from "../../Styles/ProfileStyles"; 
import { formatearFechaUTC } from "../../Helpers/DateUtils";

export const Profile = () => {
  const { 
    loading, 
    userData, 
    isEditingProfile, 
    editForm, 
    showPasswordSection, 
    passForm, 
    setIsEditingProfile, 
    setShowPasswordSection, 
    handleEditChange, 
    handlePassChange, 
    handleImageUpload, 
    handleSaveProfile, 
    handleChangePassword, 
    handleCancelPassword,
    uploadingImage,
    imagePreview
  } = useProfile();

  if (loading) return <div className="h-full flex items-center justify-center text-gray-300">Cargando...</div>;
  if (!userData) return <div className="h-full flex items-center justify-center text-red-400">Error: No se pudo cargar el usuario.</div>;

  const avatarSrc = imagePreview || (isEditingProfile ? editForm.fotoPerfil : userData.fotoPerfil);
  return (
    <div className="w-full h-full flex flex-col pt-6 px-4 pb-10 animate-fade-in overflow-y-auto">
        <div className="w-full max-w-3xl mx-auto space-y-8">

          {/* --- CARD PERFIL --- */}
          <div className="w-full backdrop-blur-xl bg-gray-900/80 border border-white/10 rounded-3xl shadow-2xl overflow-hidden relative">
            
            <div className={ProfileStyles.coverGradient}></div>

            <div className="px-10 pb-10">
              <div className={ProfileStyles.avatarContainer}>
                <div className={ProfileStyles.avatarWrapper}>
                  {avatarSrc ? (
                    <img 
                      src={avatarSrc} 
                      alt="Perfil" 
                      className={`${ProfileStyles.avatarImg} ${uploadingImage ? 'opacity-50 grayscale' : ''} transition-all duration-300`} 
                    />
                  ) : (
                    <div className={ProfileStyles.avatarPlaceholder}>
                        {userData.nombre?.charAt(0)}
                    </div>
                  )}

                  {uploadingImage && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full z-20 backdrop-blur-sm">
                      <div className="flex flex-col items-center">
                          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                          <span className="text-white text-[10px] font-bold tracking-wider animate-pulse">SUBIENDO</span>
                      </div>
                    </div>
                  )}

                  {isEditingProfile && !uploadingImage && (
                    <label className={ProfileStyles.uploadOverlay}>
                      <span className="text-4xl cursor-pointer hover:scale-110 transition-transform">📷</span>
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
                      <Input label="Nombre" value={editForm.nombre} onChange={e => handleEditChange('nombre', e.target.value)} className={AppStyles.inputDark} labelClassName={AppStyles.label}/>
                      <Input label="Apellido" value={editForm.apellido} onChange={e => handleEditChange('apellido', e.target.value)} className={AppStyles.inputDark} labelClassName={AppStyles.label}/>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Usuario" value={editForm.nombreUsuario} onChange={e => handleEditChange('nombreUsuario', e.target.value)} className={AppStyles.inputDark} labelClassName={AppStyles.label}/>
                        
                        {/* DNI NO EDITABLE */}
                        <div>
                            <label className={AppStyles.label}>DNI (No editable)</label>
                            <div className="w-full bg-black/20 border border-white/5 text-gray-400 p-3 rounded-lg font-mono text-sm">
                                {userData.dni}
                            </div>
                        </div>
                    </div>

                    <Input label="Email" value={editForm.email} onChange={e => handleEditChange('email', e.target.value)} className={AppStyles.inputDark} labelClassName={AppStyles.label}/>

                    <div className="grid grid-cols-2 gap-4">
                        <Input 
                            label="Teléfono" 
                            value={editForm.telefono || ""} 
                            onChange={e => handleEditChange('telefono', e.target.value)} 
                            className={AppStyles.inputDark} 
                            labelClassName={AppStyles.label}
                            placeholder="Ej: 11 1234 5678"
                        />
                        <Input 
                            label="Fecha Nacimiento" 
                            type="date" 
                            value={editForm.fechaNacimiento || ""} 
                            onChange={e => handleEditChange('fechaNacimiento', e.target.value)} 
                            className={AppStyles.inputDark} 
                            labelClassName={AppStyles.label}
                        />
                    </div>

                    <div className="flex justify-center gap-4 pt-6">
                      <Button variant="ghost" onClick={() => setIsEditingProfile(false)} className={AppStyles.btnSecondary}>Cancelar</Button>
                      <Button onClick={handleSaveProfile} className={AppStyles.btnPrimary} disabled={uploadingImage}>
                        {uploadingImage ? 'Guardando...' : 'Guardar Cambios'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  // MODO VISTA
                  <div className="space-y-3">
                    <h2 className={ProfileStyles.nameTitle}>
                      {userData.nombre} <span className="text-green-500">{userData.apellido}</span>
                    </h2>
                    
                    <p className={ProfileStyles.usernameSubtitle}>
                      @{userData.nombreUsuario} • {userData.email}
                    </p>
                    
                    {/* VISUALIZACIÓN DE DATOS EXTRA */}
                    <div className="flex flex-wrap justify-center gap-4 mt-6">
                        <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl flex flex-col min-w-[100px]">
                            <span className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">DNI</span>
                            <span className="text-white font-mono">{userData.dni}</span>
                        </div>

                        {userData.telefono && (
                            <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl flex flex-col min-w-[100px]">
                                <span className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">Teléfono</span>
                                <span className="text-white">{userData.telefono}</span>
                            </div>
                        )}

                        {userData.fechaNacimiento && (
                            <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl flex flex-col min-w-[100px]">
                                <span className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">Nacimiento</span>
                                {/* USAMOS LA FUNCIÓN DE FORMATEO CORRECTA AQUÍ */}
                                <span className="text-white">{formatearFechaUTC(userData.fechaNacimiento)}</span>
                            </div>
                        )}
                    </div>

                    <div className="pt-8">
                      <Button 
                        onClick={() => setIsEditingProfile(true)} 
                        className={ProfileStyles.editProfileBtn}
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
          <div className={AppStyles.glassCard + " p-8"}>
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
                <h3 className={AppStyles.sectionTitle.replace('text-xl', 'text-lg text-gray-300 border-white/5')}>🔒 ACTUALIZAR CONTRASEÑA</h3>
                
                <div className="bg-black/20 p-6 rounded-xl border border-white/5 space-y-4">
                    <Input label="Contraseña Actual" type="password" value={passForm.currentPassword} onChange={e => handlePassChange('currentPassword', e.target.value)} className={AppStyles.inputDark} labelClassName={AppStyles.label}/>
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Nueva" type="password" autoComplete="new-password" value={passForm.newPassword} onChange={e => handlePassChange('newPassword', e.target.value)} className={AppStyles.inputDark} labelClassName={AppStyles.label}/>
                        <Input label="Repetir" type="password" autoComplete="new-password" value={passForm.confirmPassword} onChange={e => handlePassChange('confirmPassword', e.target.value)} className={AppStyles.inputDark} labelClassName={AppStyles.label}/>
                    </div>
                </div>

                <div className="flex justify-center gap-4">
                    <Button variant="ghost" onClick={handleCancelPassword} className={AppStyles.btnSecondary}>Cancelar</Button>
                    <Button onClick={handleChangePassword} className={AppStyles.btnDanger}>Actualizar</Button>
                </div>
              </div>
            )}
          </div>
        </div>
    </div>
  );
};