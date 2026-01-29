import { useState } from "react";
import { GymApi } from "../../API/Gym/GymApi";
import { AuthApi, type CreateUserDTO } from "../../API/Auth/AuthApi";
import { showSuccess, showError, showConfirmSuccess } from "../../Helpers/Alerts";

export const useCreateGym = () => {
    // --- ESTADO GYM ---
    const [nombre, setNombre] = useState("");
    const [codigo, setCodigo] = useState("");
    const [loadingGym, setLoadingGym] = useState(false);

    // --- ESTADO MODAL DUEÑO ---
    const [showOwnerModal, setShowOwnerModal] = useState(false);
    const [createdGymCode, setCreatedGymCode] = useState(""); // Guardamos el código del gym recién creado
    const [createdGymName, setCreatedGymName] = useState("");

    // --- ESTADO FORMULARIO DUEÑO ---
    const [ownerForm, setOwnerForm] = useState<CreateUserDTO>({
        dni: "", nombre: "", apellido: "", nombreUsuario: "",
        email: "", contraseña: "", telefono: "", fechaNacimiento: "",
        rol: "Entrenador"
    });
    const [loadingOwner, setLoadingOwner] = useState(false);

    // 1. CREAR GIMNASIO
    const handleSubmitGym = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!nombre.trim() || !codigo.trim()) return showError("Campos obligatorios.");

        setLoadingGym(true);
        try {
            const gymDTO = { nombre, codigoAcceso: codigo.toUpperCase() };
            const newGym = await GymApi.create(gymDTO);
            
            // ÉXITO: No limpiamos, sino que abrimos el modal del dueño
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
            // IMPORTANTE: Enviamos el codigoGym del NUEVO gimnasio, no del contexto actual
            const ownerData: any = {
                ...ownerForm,
                codigoGym: createdGymCode // <--- Vinculación clave
            };

            // No enviar campos vacíos opcionales
            if (!ownerData.telefono) delete ownerData.telefono;
            if (!ownerData.fechaNacimiento) delete ownerData.fechaNacimiento;

            await AuthApi.createUser(ownerData);

            showSuccess(`Dueño asignado a ${createdGymName} correctamente.`);
            
            // FIN DEL FLUJO: Limpiamos todo
            setShowOwnerModal(false);
            setNombre("");
            setCodigo("");
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
        }
    };

    return {
        // Gym Form
        nombre, setNombre,
        codigo, setCodigo,
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