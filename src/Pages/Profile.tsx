import { useProfile } from "../Hooks/Profile/useProfile";
import { PageLayout } from "../Components/UI/PageLayout";
import { Card } from "../Components/UI/Card";
import { Input } from "../Components/UI/Input";
import { Button } from "../Components/UI/Button";

export const Profile = () => {
  const { loading, userData, isEditingProfile, editForm, showPasswordSection, passForm, setIsEditingProfile, setShowPasswordSection, handleEditChange, handlePassChange, handleImageUpload, handleSaveProfile, handleChangePassword, handleCancelPassword } = useProfile();

  if (loading) return <div className="p-10 text-center">Cargando...</div>;

  return (
    <PageLayout>
      <div className="flex flex-col items-center space-y-6 max-w-2xl mx-auto">
        
        {/* CARD PERFIL */}
        <div className="w-full bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          <div className="bg-green-600 h-32"></div> {/* Banner manual */}
          <div className="px-8 pb-8">
             <div className="relative flex justify-center -mt-16 mb-6">
               <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 overflow-hidden relative">
                 {userData?.fotoPerfil || editForm.fotoPerfil ? (
                    <img src={isEditingProfile ? editForm.fotoPerfil : userData.fotoPerfil} className="w-full h-full object-cover" />
                 ) : <div className="w-full h-full flex items-center justify-center text-4xl text-gray-400 font-bold">{userData?.nombre?.charAt(0)}</div>}
                 
                 {isEditingProfile && <label className="absolute inset-0 bg-black/30 flex items-center justify-center cursor-pointer text-white text-2xl">📷 <input type="file" className="hidden" onChange={handleImageUpload} /></label>}
               </div>
             </div>

             <div className="space-y-4">
               {isEditingProfile ? (
                 <>
                   <div className="flex gap-2">
                     <Input placeholder="Nombre" value={editForm.nombre} onChange={e => handleEditChange('nombre', e.target.value)} />
                     <Input placeholder="Apellido" value={editForm.apellido} onChange={e => handleEditChange('apellido', e.target.value)} />
                   </div>
                   <Input label="Usuario" value={editForm.nombreUsuario} onChange={e => handleEditChange('nombreUsuario', e.target.value)} />
                   <Input label="Email" value={editForm.email} onChange={e => handleEditChange('email', e.target.value)} />
                   <div className="flex justify-center gap-2">
                      <Button variant="secondary" onClick={() => setIsEditingProfile(false)}>Cancelar</Button>
                      <Button onClick={handleSaveProfile}>Guardar</Button>
                   </div>
                 </>
               ) : (
                 <div className="text-center">
                    <h2 className="text-3xl font-bold capitalize">{userData.nombre} {userData.apellido}</h2>
                    <p className="text-gray-500">@{userData.nombreUsuario} • {userData.email}</p>
                    <div className="mt-4 flex justify-center">
                       <Button variant="info" onClick={() => setIsEditingProfile(true)}>✏️ Editar Perfil</Button>
                    </div>
                 </div>
               )}
             </div>
          </div>
        </div>

        {/* CARD SEGURIDAD */}
        <Card title="🔒 Seguridad" className="w-full">
           {!showPasswordSection ? (
              <button onClick={() => setShowPasswordSection(true)} className="text-green-600 font-bold hover:underline">Cambiar Contraseña</button>
           ) : (
              <div className="bg-gray-50 p-4 rounded mt-2">
                 <Input label="Actual" type="password" value={passForm.currentPassword} onChange={e => handlePassChange('currentPassword', e.target.value)} />
                 <div className="grid grid-cols-2 gap-2">
                    <Input label="Nueva" type="password" value={passForm.newPassword} onChange={e => handlePassChange('newPassword', e.target.value)} />
                    <Input label="Repetir" type="password" value={passForm.confirmPassword} onChange={e => handlePassChange('confirmPassword', e.target.value)} />
                 </div>
                 <div className="flex justify-end gap-2 mt-2">
                    <Button variant="ghost" onClick={handleCancelPassword}>Cancelar</Button>
                    <Button onClick={handleChangePassword}>Actualizar</Button>
                 </div>
              </div>
           )}
        </Card>

      </div>
    </PageLayout>
  );
};