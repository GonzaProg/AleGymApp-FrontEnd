import { useState, useEffect } from "react";
import { useAuthUser } from "../useAuthUser"; 
import { UsuarioApi, type UpdateProfileDTO, type ChangePasswordDTO } from "../../API/Usuarios/UsuarioApi"; 

// LEEMOS LAS VARIABLES DEL .ENV
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const API_URL_CLOUDINARY = import.meta.env.VITE_API_URL_CLOUDINARY;

export const useProfile = () => {
  // 1. Obtenemos datos del contexto
  const { currentUser } = useAuthUser();
  const localId = currentUser?.id;

  // ESTADOS DE VISTA
  const [loading, setLoading] = useState(true); // Carga inicial y guardado
  const [uploadingImage, setUploadingImage] = useState(false); // Feedback específico de subida
  
  // ESTADOS DE EDICIÓN PERFIL
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  // Inicializamos con tipos seguros
  const [editForm, setEditForm] = useState<UpdateProfileDTO>({
    nombre: "",
    apellido: "",
    nombreUsuario: "",
    email: "",
    fotoPerfil: ""
  });

  // ESTADOS PARA MANEJO DE IMAGEN (CLOUDINARY)
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // Archivo crudo
  const [imagePreview, setImagePreview] = useState<string | null>(null); // Previsualización local

  // ESTADOS DE CAMBIO CONTRASEÑA 
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
        apellido: currentUser.apellido || "", 
        nombreUsuario: currentUser.nombreUsuario || "", 
        email: currentUser.email || "", 
        fotoPerfil: currentUser.fotoPerfil || "" 
      });
      setLoading(false);
    }
  }, [currentUser]);

  // HANDLERS PARA INPUTS DE TEXTO
  const handleEditChange = (field: keyof UpdateProfileDTO, value: string) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePassChange = (field: string, value: string) => {
    setPassForm((prev) => ({ ...prev, [field]: value }));
  };

  // MANEJO DE SELECCIÓN DE IMAGEN (SOLO PREVIEW)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 1. Guardamos el archivo para subirlo luego
      setSelectedFile(file);
      // 2. Creamos URL temporal para mostrarla al instante (Preview)
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // FUNCIÓN AUXILIAR: SUBIR A CLOUDINARY
  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET); 

    try {
        const response = await fetch(
            `${API_URL_CLOUDINARY}/${CLOUD_NAME}/image/upload`,
            {
                method: 'POST',
                body: formData
            }
        );
        const data = await response.json();
        if (!response.ok) throw new Error("Error al subir imagen a la nube");
        return data.secure_url; // Retornamos la URL HTTPS
    } catch (error) {
        console.error("Error cloudinary:", error);
        throw error;
    }
  };

  // GUARDAR PERFIL (Lógica Principal)
  const handleSaveProfile = async () => {
    if (!localId) return;

    // Validación de Email 
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (editForm.email && !emailRegex.test(editForm.email)) {
        return alert("⚠️ El formato del correo electrónico no es válido.");
    }

    setLoading(true);

    try {
      let finalImageUrl = editForm.fotoPerfil; 

      // 1. Si hay una imagen nueva seleccionada, la subimos primero
      if (selectedFile) {
          setUploadingImage(true);
          finalImageUrl = await uploadToCloudinary(selectedFile);
          setUploadingImage(false);
      }

      // 2. Preparamos el DTO con la URL final (sea la nueva o la vieja)
      const updatedDTO: UpdateProfileDTO = {
        ...editForm,
        fotoPerfil: finalImageUrl
      };

      // 3. Llamada limpia a la API (Backend guarda solo la URL)
      const data = await UsuarioApi.update(localId, updatedDTO);

      // 4. Actualizamos LocalStorage
      const updatedUser = { ...currentUser, ...data };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      // Limpieza de estados
      setIsEditingProfile(false);
      setSelectedFile(null);
      setImagePreview(null);
      
      alert("Datos actualizados correctamente");
      window.location.reload(); 

    } catch (error: any) {
      setUploadingImage(false);
      alert(error.response?.data?.error || error.message || "Error al actualizar");
    } finally {
        setLoading(false);
    }
  };

  // GUARDAR CONTRASEÑA 
  const handleChangePassword = async () => {
    if (!localId) return;

    if (!passForm.currentPassword || !passForm.newPassword || !passForm.confirmPassword) {
      return alert("Todos los campos de contraseña son obligatorios");
    }
    if (passForm.newPassword !== passForm.confirmPassword) {
      return alert("Las nuevas contraseñas no coinciden");
    }
    
    setLoading(true);
    try {
      const passwordData: ChangePasswordDTO = {
          currentPassword: passForm.currentPassword,
          newPassword: passForm.newPassword
      };

      await UsuarioApi.changePassword(localId, passwordData);
      
      alert("Contraseña modificada con éxito.");
      setShowPasswordSection(false);
      setPassForm({ currentPassword: "", newPassword: "", confirmPassword: "" }); 
    } catch (error: any) {
      alert(error.response?.data?.error || "Error al cambiar contraseña");
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
    uploadingImage, // Nuevo export para mostrar spinner de subida
    userData: currentUser, 
    isEditingProfile,
    editForm,
    imagePreview, // Nuevo export para mostrar la previsualización
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