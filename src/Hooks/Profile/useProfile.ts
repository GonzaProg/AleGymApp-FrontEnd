import { useState, useEffect } from "react";
import { useAuthUser } from "../useAuthUser"; // 1. Hook de Auth
import { UsuarioApi, type UpdateProfileDTO, type ChangePasswordDTO } from "../../API/Usuarios/UsuarioApi"; // 2. API

export const useProfile = () => {
  // 1. Obtenemos datos del contexto (Reemplaza el JSON.parse manual)
  const { currentUser } = useAuthUser();
  const localId = currentUser?.id;

  // --- ESTADOS DE VISTA ---
  const [loading, setLoading] = useState(true);
  
  // --- ESTADOS DE EDICIÓN PERFIL ---
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  // Inicializamos con tipos seguros
  const [editForm, setEditForm] = useState<UpdateProfileDTO>({
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

  // 1. CARGAR DATOS (Cuando currentUser esté listo)
  useEffect(() => {
    if (currentUser) {
      setEditForm({
        nombre: currentUser.nombre || "",
        apellido: currentUser.apellido || "", // Asumiendo que tu interfaz User tiene apellido
        nombreUsuario: currentUser.nombreUsuario || "", // Asumiendo propiedad
        email: currentUser.email || "", // Asumiendo propiedad
        fotoPerfil: currentUser.fotoPerfil || "" // Asumiendo propiedad
      });
      setLoading(false);
    }
  }, [currentUser]);

  // --- HANDLERS PARA INPUTS ---
  const handleEditChange = (field: keyof UpdateProfileDTO, value: string) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePassChange = (field: string, value: string) => {
    setPassForm((prev) => ({ ...prev, [field]: value }));
  };

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

  // --- GUARDAR PERFIL ---
  const handleSaveProfile = async () => {
    if (!localId) return;

    try {
      // 2. Llamada limpia a la API
      const data = await UsuarioApi.update(localId, editForm);

      // Actualizamos LocalStorage para mantener la sesión sincronizada
      // (Combinamos los datos viejos con los nuevos que devolvió la API)
      const updatedUser = { ...currentUser, ...data };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      setIsEditingProfile(false);
      
      alert("Datos actualizados correctamente");
      // Recargamos para que useAuthUser lea los nuevos datos del storage
      window.location.reload(); 

    } catch (error: any) {
      alert(error.response?.data?.error || "Error al actualizar");
    }
  };

  // --- GUARDAR CONTRASEÑA ---
  const handleChangePassword = async () => {
    if (!localId) return;

    if (!passForm.currentPassword || !passForm.newPassword || !passForm.confirmPassword) {
      return alert("Todos los campos de contraseña son obligatorios");
    }
    if (passForm.newPassword !== passForm.confirmPassword) {
      return alert("Las nuevas contraseñas no coinciden");
    }
    
    try {
      // Preparar DTO
      const passwordData: ChangePasswordDTO = {
          currentPassword: passForm.currentPassword,
          newPassword: passForm.newPassword
      };

      // 3. Llamada limpia a la API
      await UsuarioApi.changePassword(localId, passwordData);
      
      alert("Contraseña modificada con éxito.");
      setShowPasswordSection(false);
      setPassForm({ currentPassword: "", newPassword: "", confirmPassword: "" }); 
    } catch (error: any) {
      alert(error.response?.data?.error || "Error al cambiar contraseña");
    }
  };

  const handleCancelPassword = () => {
    setShowPasswordSection(false);
    setPassForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  return {
    loading,
    userData: currentUser, // Retornamos currentUser directo del contexto
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
    handleCancelPassword
  };
};