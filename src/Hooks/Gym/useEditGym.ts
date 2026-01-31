import { useState } from "react";
import { GymApi, type GymDTO, type CreateUpdateGymDTO } from "../../API/Gym/GymApi";
import { showSuccess, showError } from "../../Helpers/Alerts";
import { CloudinaryApi } from "../../Helpers/Cloudinary/Cloudinary";

export const useEditGym = (onSuccess?: () => void) => {
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingGym, setEditingGym] = useState<GymDTO | null>(null);
    const [nombre, setNombre] = useState("");
    const [codigo, setCodigo] = useState("");
    const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    const openEditModal = (gym: GymDTO) => {
        setEditingGym(gym);
        setNombre(gym.nombre);
        setCodigo(gym.codigoAcceso);
        setSelectedLogo(null);
        setShowEditModal(true);
    };

    const closeEditModal = () => {
        setShowEditModal(false);
        setEditingGym(null);
        setNombre("");
        setCodigo("");
        setSelectedLogo(null);
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedLogo(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingGym) return;

        if (!nombre.trim() || !codigo.trim()) return showError("Campos obligatorios.");

        setLoading(true);
        try {
            let logoUrl = editingGym.logoUrl || "";

            // Subir nuevo logo si existe
            if (selectedLogo) {
                logoUrl = await CloudinaryApi.upload(selectedLogo);
            }

            const updateData: CreateUpdateGymDTO = {
                nombre: nombre.trim(),
                codigoAcceso: codigo.trim().toUpperCase(),
                logoUrl
            };

            await GymApi.update(editingGym.id, updateData);
            showSuccess("Gimnasio actualizado correctamente.");
            closeEditModal();
            onSuccess?.(); // Recargar lista
        } catch (error: any) {
            const msg = error.response?.data?.error || "Error al actualizar gimnasio";
            showError(msg);
        } finally {
            setLoading(false);
        }
    };

    return {
        showEditModal,
        editingGym,
        nombre, setNombre,
        codigo, setCodigo,
        selectedLogo, handleLogoChange,
        loading,
        openEditModal,
        closeEditModal,
        handleSubmit
    };
};