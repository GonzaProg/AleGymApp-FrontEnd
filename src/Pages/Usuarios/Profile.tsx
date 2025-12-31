import { useProfile } from "../../Hooks/Profile/useProfile";
import { Navbar } from "../../Components/Navbar";
import { Input } from "../../Components/UI/Input";
import { Button } from "../../Components/UI/Button";
import fondoPerfil from "../../assets/Fondo-Perfil.png";
import { AppStyles } from "../../Styles/AppStyles"; // Globales
import { ProfileStyles } from "../../Styles/ProfileStyles"; // Específicos

export const Profile = () => {
  const { loading, userData, isEditingProfile, editForm, showPasswordSection, passForm, setIsEditingProfile, setShowPasswordSection, handleEditChange, handlePassChange, handleImageUpload, handleSaveProfile, handleChangePassword, handleCancelPassword } = useProfile();

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-300">Cargando...</div>;
  if (!userData) return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-red-400">Error: No se pudo cargar el usuario.</div>;

  return (
    <div className={AppStyles.pageContainer}>

      <div
        className={AppStyles.fixedBackground}
        style={{
          backgroundImage: `url(${fondoPerfil})`,
          filter: 'brightness(0.4) contrast(1.1)' 
        }}
      />

      <Navbar />

      <div className={AppStyles.contentContainer}>
        
        <div className="w-full max-w-2xl space-y-8">

          {/* --- CARD PERFIL (Diseño Especial) --- */}
          {/* Aquí no usamos glassCard global porque tiene overflow hidden y diseño distinto */}
          <div className="w-full backdrop-blur-xl bg-gray-900/80 border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
            
            <div className={ProfileStyles.coverGradient}></div>

            <div className="px-10 pb-10">
              
              <div className={ProfileStyles.avatarContainer}>
                <div className={ProfileStyles.avatarWrapper}>
                  
                  {userData.fotoPerfil || editForm.fotoPerfil ? (
                    <img src={isEditingProfile ? editForm.fotoPerfil : userData.fotoPerfil} alt="Perfil" className={ProfileStyles.avatarImg} />
                  ) : (
                    <div className={ProfileStyles.avatarPlaceholder}>
                        {userData.nombre?.charAt(0)}
                    </div>
                  )}

                  {isEditingProfile && (
                    <label className={ProfileStyles.uploadOverlay}>
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
                      <Input label="Nombre" value={editForm.nombre} onChange={e => handleEditChange('nombre', e.target.value)} className={AppStyles.inputDark} labelClassName={AppStyles.label}/>
                      <Input label="Apellido" value={editForm.apellido} onChange={e => handleEditChange('apellido', e.target.value)} className={AppStyles.inputDark} labelClassName={AppStyles.label}/>
                    </div>
                    <Input label="Usuario" value={editForm.nombreUsuario} onChange={e => handleEditChange('nombreUsuario', e.target.value)} className={AppStyles.inputDark} labelClassName={AppStyles.label}/>
                    <Input label="Email" value={editForm.email} onChange={e => handleEditChange('email', e.target.value)} className={AppStyles.inputDark} labelClassName={AppStyles.label}/>

                    <div className="flex justify-center gap-4 pt-6">
                      <Button variant="ghost" onClick={() => setIsEditingProfile(false)} className={AppStyles.btnSecondary}>Cancelar</Button>
                      <Button onClick={handleSaveProfile} className={AppStyles.btnPrimary}>Guardar Cambios</Button>
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
                    
                    <div className="pt-10">
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

          {/* --- CARD SEGURIDAD (Usa estilos globales) --- */}
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
                        <Input label="Nueva" type="password" value={passForm.newPassword} onChange={e => handlePassChange('newPassword', e.target.value)} className={AppStyles.inputDark} labelClassName={AppStyles.label}/>
                        <Input label="Repetir" type="password" value={passForm.confirmPassword} onChange={e => handlePassChange('confirmPassword', e.target.value)} className={AppStyles.inputDark} labelClassName={AppStyles.label}/>
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
    </div>
  );
};