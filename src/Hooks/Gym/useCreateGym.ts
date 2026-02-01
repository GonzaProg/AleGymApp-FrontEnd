import { useState } from "react";
import { GymApi } from "../../API/Gym/GymApi";
import { AuthApi, type CreateUserDTO } from "../../API/Auth/AuthApi";
import { showSuccess, showError, showConfirmSuccess } from "../../Helpers/Alerts";
import { CloudinaryApi } from "../../Helpers/Cloudinary/Cloudinary";

export const useCreateGym = () => {
    // --- ESTADO GYM ---
    const [nombre, setNombre] = useState("");
    const [codigo, setCodigo] = useState("");
    const [selectedLogo, setSelectedLogo] = useState<File | null>(null); // Nuevo estado
    const [loadingGym, setLoadingGym] = useState(false);

    // --- ESTADO MODAL DUEÑO ---
    const [showOwnerModal, setShowOwnerModal] = useState(false);
    const [createdGymCode, setCreatedGymCode] = useState(""); 
    const [createdGymName, setCreatedGymName] = useState("");

    // --- ESTADO FORMULARIO DUEÑO ---
    const [ownerForm, setOwnerForm] = useState<CreateUserDTO>({
        dni: "", nombre: "", apellido: "", nombreUsuario: "",
        email: "", contraseña: "", telefono: "", fechaNacimiento: "",
        rol: "Entrenador"
    });
    const [loadingOwner, setLoadingOwner] = useState(false);

    // --- HANDLER FILE ---
    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedLogo(e.target.files[0]);
        }
    };

    // 1. CREAR GIMNASIO
    const handleSubmitGym = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!nombre.trim() || !codigo.trim()) return showError("Campos obligatorios.");

        setLoadingGym(true);
        try {
            let logoUrl = "";

            // 1. Subir logo si existe
            if (selectedLogo) {
                // Por defecto sube como 'image', así que no hace falta el 2do parámetro
                logoUrl = await CloudinaryApi.upload(selectedLogo);
            }

            // 2. Crear Gym con la URL
            const gymDTO = { 
                nombre, 
                codigoAcceso: codigo.toUpperCase(),
                logoUrl: logoUrl // Enviamos la URL (puede ser string vacío)
            };

            const newGym = await GymApi.create(gymDTO);
            
            // ÉXITO
            setCreatedGymCode(newGym.codigoAcceso);
            setCreatedGymName(newGym.nombre);
            setShowOwnerModal(true); 
            
            showSuccess(`Gimnasio "${newGym.nombre}" creado. Ahora asigna un dueño.`);
            
        } catch (error: any) {
            const msg = error.response?.data?.error || "Error al crear gimnasio";
            showError(msg);
        } finally {
            setLoadingGym(false);
        }
    };

    // 2. CREAR DUEÑO (Entrenador)
    const handleOwnerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setOwnerForm({ ...ownerForm, [e.target.name]: e.target.value });
    };

    const handleSubmitOwner = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!ownerForm.dni || !ownerForm.email || !ownerForm.contraseña) return showError("Completa los datos del dueño.");

        setLoadingOwner(true);
        try {
            const ownerData: any = {
                ...ownerForm,
                codigoGym: createdGymCode 
            };

            if (!ownerData.telefono) delete ownerData.telefono;
            if (!ownerData.fechaNacimiento) delete ownerData.fechaNacimiento;

            await AuthApi.createUser(ownerData);

            showSuccess(`Dueño asignado a ${createdGymName} correctamente.`);
            
            // RESET TOTAL
            setShowOwnerModal(false);
            setNombre("");
            setCodigo("");
            setSelectedLogo(null); // Reset logo
            setOwnerForm({
                dni: "", nombre: "", apellido: "", nombreUsuario: "",
                email: "", contraseña: "", telefono: "", fechaNacimiento: "",
                rol: "Entrenador"
            });

        } catch (error: any) {
            showError(error.response?.data?.error || "Error al crear dueño.");
        } finally {
            setLoadingOwner(false);
        }
    };

    const skipOwnerCreation = async () => {
        const result = await showConfirmSuccess(
            "¿Omitir asignación de dueño?", 
            "El gimnasio quedará creado pero vacío (solo tú como Admin tendrás acceso)."
        );

        if(result.isConfirmed) {
            setShowOwnerModal(false);
            setNombre("");
            setCodigo("");
            setSelectedLogo(null);
        }
    };

    return {
        // Gym Form
        nombre, setNombre,
        codigo, setCodigo,
        selectedLogo, handleLogoChange, // Exponemos
        loadingGym,
        handleSubmitGym,

        // Owner Modal Logic
        showOwnerModal,
        createdGymName,
        ownerForm,
        loadingOwner,
        handleOwnerChange,
        handleSubmitOwner,
        skipOwnerCreation
    };
};