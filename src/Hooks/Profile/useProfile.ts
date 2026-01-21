import { useState, useEffect } from "react";
import { useAuthUser } from "../useAuthUser"; 
import { UsuarioApi, type UpdateProfileDTO } from "../../API/Usuarios/UsuarioApi"; 
import { showSuccess, showError } from "../../Helpers/Alerts";

// LEEMOS LAS VARIABLES DEL .ENV
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const API_URL_CLOUDINARY = import.meta.env.VITE_API_URL_CLOUDINARY;

export const useProfile = () => {
  const { currentUser } = useAuthUser();
  const localId = currentUser?.id;

  // Estado local para reflejar cambios instantáneamente sin recargar 
  const [displayUser, setDisplayUser] = useState(currentUser);

  // Sincronizar si el contexto cambia externamente
  useEffect(() => {
    setDisplayUser(currentUser);
  }, [currentUser]);

  // ESTADOS DE VISTA
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false); 
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  // FORMULARIO DE EDICIÓN
  const [editForm, setEditForm] = useState<UpdateProfileDTO>({
    nombre: "",
    apellido: "",
    nombreUsuario: "",
    email: "",
    fotoPerfil: ""
  });

  // ARCHIVOS (Cloudinary)
  const [selectedFile, setSelectedFile] = useState<File | null>(null); 
  const [imagePreview, setImagePreview] = useState<string | null>(null); 

  // CONTRASEÑA
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passForm, setPassForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // CARGAR DATOS AL FORMULARIO CUANDO SE EDITA O CAMBIA EL USUARIO
  useEffect(() => {
    if (displayUser) {
      setEditForm({
        nombre: displayUser.nombre || "",
        apellido: displayUser.apellido || "", 
        nombreUsuario: displayUser.nombreUsuario || "", 
        email: displayUser.email || "", 
        fotoPerfil: displayUser.fotoPerfil || "" 
      });
    }
  }, [displayUser]);

  // HANDLERS
  const handleEditChange = (field: keyof UpdateProfileDTO, value: string) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePassChange = (field: string, value: string) => {
    setPassForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET); 

    try {
        const response = await fetch(
            `${API_URL_CLOUDINARY}/${CLOUD_NAME}/image/upload`,
            { method: 'POST', body: formData }
        );
        const data = await response.json();
        if (!response.ok) throw new Error("Error al subir imagen");
        return data.secure_url; 
    } catch (error) {
        console.error("Error cloudinary:", error);
        throw error;
    }
  };

  // GUARDAR PERFIL
  const handleSaveProfile = async () => {
    if (!localId) return;

    // Validación Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (editForm.email && !emailRegex.test(editForm.email)) {
        return showError("El formato del correo electrónico no es válido.");
    }

    setLoading(true);

    try {
      let finalImageUrl = editForm.fotoPerfil; 

      if (selectedFile) {
          setUploadingImage(true);
          finalImageUrl = await uploadToCloudinary(selectedFile);
          setUploadingImage(false);
      }

      const updatedDTO: UpdateProfileDTO = {
        ...editForm,
        fotoPerfil: finalImageUrl
      };

      // 1. Actualizar en Backend
      const data = await UsuarioApi.update(localId, updatedDTO);

      // 2. Crear objeto actualizado fusionando lo viejo con lo nuevo
      const updatedUser = { ...displayUser, ...data };

      // 3. Actualizar LocalStorage (para que persista al recargar manualmente)
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      // 4. Actualizar Estado Local 
      setDisplayUser(updatedUser);
      
      // 5. Limpieza UI
      setIsEditingProfile(false);
      setSelectedFile(null);
      setImagePreview(null);
      
      showSuccess("Datos actualizados correctamente.");

    } catch (error: any) {
      setUploadingImage(false);
      showError(error.response?.data?.error || error.message || "Error al actualizar");
    } finally {
        setLoading(false);
    }
  };

  // CAMBIAR CONTRASEÑA 
  const handleChangePassword = async () => {
    if (!localId) return;

    const currentPass = passForm.currentPassword.trim();
    const newPass = passForm.newPassword.trim();
    const confirmPass = passForm.confirmPassword.trim();

    if (!currentPass || !newPass || !confirmPass) return showError("Todos los campos son obligatorios");
    if (newPass !== confirmPass) return showError("Las nuevas contraseñas no coinciden");
    
    setLoading(true);
    try {
      const passwordData = {
          currentPassword: currentPass,
          newPassword: newPass,
          confirmPassword: confirmPass
      };

      await UsuarioApi.changePassword(localId, passwordData as any);
      
      showSuccess("Contraseña modificada con éxito.");
      
      setShowPasswordSection(false);
      setPassForm({ currentPassword: "", newPassword: "", confirmPassword: "" }); 
    } catch (error: any) {
      showError(error.response?.data?.error || "Error al cambiar contraseña");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPassword = () => {
    setShowPasswordSection(false);
    setPassForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  return {
    loading,
    uploadingImage, 
    userData: displayUser,
    isEditingProfile,
    editForm,
    imagePreview, 
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