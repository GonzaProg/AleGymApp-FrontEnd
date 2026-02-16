import { useState, useEffect } from "react";
import { ProductosApi, type ProductoDTO } from "../../API/Productos/ProductosApi";
import { CloudinaryApi } from "../../Helpers/Cloudinary/Cloudinary";
import { useAuthUser } from "../Auth/useAuthUser";
import { showSuccess, showError, showConfirmDelete } from "../../Helpers/Alerts";

export const useProductos = () => {
    const { currentUser } = useAuthUser();
    
    // Estados de Datos
    const [productos, setProductos] = useState<ProductoDTO[]>([]);
    const [archivedProductos, setArchivedProductos] = useState<ProductoDTO[]>([]);
    const [loading, setLoading] = useState(false);

    // Estados de Interfaz
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isTrashOpen, setIsTrashOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<ProductoDTO | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);

    // Formulario
    const [form, setForm] = useState({
        nombre: "",
        descripcion: "",
        precio: "",
        stock: "",
        imagenUrl: ""
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Carga Inicial
    useEffect(() => {
        loadProductos();
    }, []);

    const loadProductos = async () => {
        setLoading(true);
        try {
            const data = await ProductosApi.getAll();
            setProductos(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const loadArchived = async () => {
        try {
            const data = await ProductosApi.getArchived();
            setArchivedProductos(data);
        } catch (error) {
            console.error(error);
        }
    };

    // --- MANEJO DEL FORMULARIO ---
    const resetForm = () => {
        setForm({ nombre: "", descripcion: "", precio: "", stock: "", imagenUrl: "" });
        setSelectedFile(null);
        setImagePreview(null);
        setEditingProduct(null);
        setIsModalOpen(false);
    };

    const handleOpenCreate = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const handleOpenEdit = (prod: ProductoDTO) => {
        setEditingProduct(prod);
        setForm({
            nombre: prod.nombre,
            descripcion: prod.descripcion || "",
            precio: prod.precio.toString(),
            stock: prod.stock.toString(),
            imagenUrl: prod.imagenUrl || ""
        });
        setImagePreview(prod.imagenUrl || null);
        setIsModalOpen(true);
    };

    const handleOpenTrash = () => {
        loadArchived();
        setIsTrashOpen(true);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    // --- ACCIONES CRUD ---
    const handleSave = async () => {
        if (!form.nombre || !form.precio || !form.stock) {
            return showError("Nombre, Precio y Stock son obligatorios");
        }

        setUploadingImage(true);
        try {
            let finalImageUrl = form.imagenUrl;

            // 1. Subir Imagen a Cloudinary (Si hay archivo nuevo)
            if (selectedFile) {
                // Borrar anterior si existe y es edición
                if (editingProduct?.imagenUrl && editingProduct.imagenUrl.includes("cloudinary")) {
                    await CloudinaryApi.delete(editingProduct.imagenUrl, 'image');
                }

                const gymCode = currentUser?.gym?.codigoAcceso || 'Global';
                const folder = `Productos/Gym_${gymCode}`;
                
                finalImageUrl = await CloudinaryApi.upload(selectedFile, 'productos', folder);
            }

            const payload = {
                nombre: form.nombre,
                descripcion: form.descripcion,
                // Math.max(0, ...) asegura que el valor enviado nunca sea menor a cero
                precio: Math.max(0, Number(form.precio)),
                stock: Math.max(0, Math.floor(Number(form.stock))), // floor para asegurar enteros en stock
                imagenUrl: finalImageUrl
            };

            if (editingProduct) {
                await ProductosApi.update(editingProduct.id, payload);
                showSuccess("Producto actualizado");
            } else {
                await ProductosApi.create(payload);
                showSuccess("Producto creado");
            }

            loadProductos();
            resetForm();

        } catch (error: any) {
            // Si el error es conflicto (409), sugerimos revisar la papelera
            if (error.response?.status === 409) {
                showError(error.response.data.error);
            } else {
                showError("Error al guardar producto");
            }
        } finally {
            setUploadingImage(false);
        }
    };

    const handleDelete = async (prod: ProductoDTO) => {
        const confirm = await showConfirmDelete("¿Eliminar producto?", `"${prod.nombre}" se moverá a la papelera.`);
        if (!confirm.isConfirmed) return;

        try {
            await ProductosApi.delete(prod.id);
            showSuccess("Producto movido a la papelera");
            loadProductos();
        } catch (error) {
            showError("No se pudo eliminar");
        }
    };

    const handleRestore = async (prod: ProductoDTO) => {
        try {
            await ProductosApi.reactivate(prod.id);
            showSuccess("Producto restaurado y disponible para la venta");
            loadArchived(); // Recargar papelera
            loadProductos(); // Recargar lista principal
        } catch (error) {
            showError("No se pudo restaurar");
        }
    };

    return {
        productos, loading, 
        isModalOpen, setIsModalOpen,
        isTrashOpen, setIsTrashOpen,
        form, setForm, 
        handleOpenCreate, handleOpenEdit, handleOpenTrash,
        handleImageChange, imagePreview, uploadingImage,
        handleSave, handleDelete,
        archivedProductos, handleRestore,
        editingProduct ,
        loadProductos
    };
};