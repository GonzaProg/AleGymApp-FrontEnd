import { useState, useRef } from "react";
import { EmpleadoApi, type EmpleadoDTO } from "../../API/Empleados/EmpleadoApi";
import { CloudinaryApi } from "../../Helpers/Cloudinary/Cloudinary";
import { showSuccess, showError } from "../../Helpers/Alerts";

export const useEmpleadoForm = (
    gymId: number, 
    onSuccess: () => void, 
    empleadoToEdit?: EmpleadoDTO | null
) => {
    const [nombre, setNombre] = useState(empleadoToEdit?.nombre || '');
    const [apellido, setApellido] = useState(empleadoToEdit?.apellido || '');
    const [telefono, setTelefono] = useState(empleadoToEdit?.telefono || '');
    
    const [fotoFile, setFotoFile] = useState<File | null>(null);
    const [fotoPreview, setFotoPreview] = useState<string | null>(
        empleadoToEdit?.fotoPerfil ? CloudinaryApi.getUrl(empleadoToEdit.fotoPerfil) : null
    );
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setFotoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setFotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemovePhoto = () => {
        setFotoFile(null);
        setFotoPreview(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!nombre || !apellido) {
            showError('Nombre y apellido son obligatorios');
            return;
        }

        setIsUploading(true);
        try {
            let fotoPerfilUrl = empleadoToEdit?.fotoPerfil || null;

            // Obtener codigoAcceso del usuario actual
            const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
            const currentUser = userStr ? JSON.parse(userStr) : null;
            const codigoAcceso = currentUser?.gym?.codigoAcceso;

            // Si hay un archivo nuevo, lo subimos
            if (fotoFile) {
                // Borrar la vieja si existe
                if (empleadoToEdit?.fotoPerfil) {
                    await CloudinaryApi.delete(empleadoToEdit.fotoPerfil);
                }
                const customPath = codigoAcceso ? `Empleados/${codigoAcceso}` : undefined;
                fotoPerfilUrl = await CloudinaryApi.upload(fotoFile, 'empleados', customPath);
            } else if (!fotoPreview && fotoPerfilUrl) {
                // Si el preview es nulo y antes había foto, significa que la borraron
                await CloudinaryApi.delete(fotoPerfilUrl);
                fotoPerfilUrl = null;
            }

            const data = {
                nombre,
                apellido,
                telefono,
                fotoPerfil: fotoPerfilUrl
            };

            if (empleadoToEdit) {
                await EmpleadoApi.modificarEmpleado(gymId, empleadoToEdit.id, data);
            } else {
                await EmpleadoApi.crearEmpleado(gymId, data);
            }

            showSuccess(`Empleado ${empleadoToEdit ? 'actualizado' : 'creado'} correctamente.`);
            onSuccess();
        } catch (error: any) {
            showError(error.response?.data?.error || 'Ocurrió un error al guardar');
        } finally {
            setIsUploading(false);
        }
    };

    return {
        nombre,
        setNombre,
        apellido,
        setApellido,
        telefono,
        setTelefono,
        fotoFile,
        fotoPreview,
        isUploading,
        fileInputRef,
        handleFileChange,
        handleRemovePhoto,
        handleSubmit
    };
};
