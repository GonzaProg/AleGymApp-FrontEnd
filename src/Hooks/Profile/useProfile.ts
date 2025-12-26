import { useState, useEffect } from "react";
import api from "../../API/axios"; 

export const useProfile = () => {
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

  // 1. CARGAR DATOS
  useEffect(() => {
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

  // --- HANDLERS PARA INPUTS ---
  const handleEditChange = (field: string, value: string) => {
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

  // --- GUARDAR PERFIL (DATOS) ---
  const handleSaveProfile = async () => {
    try {
      // Usamos api.put
      const res = await api.put(`/api/users/${localId}`, editForm);

      const updatedUser = { ...userData, ...res.data };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUserData(updatedUser);
      setIsEditingProfile(false);
      
      alert("Datos actualizados correctamente");
      window.location.reload(); 
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
      // Usamos api.patch
      await api.patch(`/api/users/${localId}/password`, passForm);
      
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
    handleCancelPassword
  };
};