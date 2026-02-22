import { useState } from "react";
import { type ProductoDTO } from "../../API/Productos/ProductosApi";
import { PagosApi } from "../../API/Pagos/PagosApi";
import { type AlumnoDTO } from "../../API/Usuarios/UsuarioApi";
import { showSuccess, showError, showConfirmSuccess } from "../../Helpers/Alerts";

export interface CartItem extends ProductoDTO {
    cantidadCompra: number;
}

export const useCarritoProductos = (refreshProductos: () => void) => {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [metodoPago, setMetodoPago] = useState("Efectivo");

    // Agregar al carrito
    const addToCart = (product: ProductoDTO) => {
        if (product.stock <= 0) return showError("No hay stock disponible.");

        setCart(prev => {
            const exists = prev.find(item => item.id === product.id);
            
            // Si ya existe, aumentamos cantidad (si hay stock)
            if (exists) {
                if (exists.cantidadCompra >= product.stock) {
                    showError("Stock máximo alcanzado para este producto.");
                    return prev;
                }
                return prev.map(item => 
                    item.id === product.id 
                        ? { ...item, cantidadCompra: item.cantidadCompra + 1 } 
                        : item
                );
            }
            
            // Si no existe, lo agregamos
            return [...prev, { ...product, cantidadCompra: 1 }];
        });
    };

    // Quitar del carrito
    const removeFromCart = (productId: number) => {
        setCart(prev => prev.filter(item => item.id !== productId));
    };

    // Ajustar cantidad manual
    const updateQuantity = (productId: number, delta: number) => {
        setCart(prev => {
            return prev.map(item => {
                if (item.id === productId) {
                    const newQty = item.cantidadCompra + delta;
                    if (newQty > item.stock) {
                        showError("No hay suficiente stock.");
                        return item;
                    }
                    if (newQty < 1) return item;
                    return { ...item, cantidadCompra: newQty };
                }
                return item;
            });
        });
    };

    const clearCart = () => setCart([]);

    // Calcular Total
    const total = cart.reduce((acc, item) => acc + (item.precio * item.cantidadCompra), 0);

    // PROCESAR VENTA
    const handleCheckout = async (alumno: AlumnoDTO | null) => {
        if (cart.length === 0) return showError("El carrito está vacío.");
        if (!alumno) return showError("Debes seleccionar un alumno para realizar la venta.");

        const confirm = await showConfirmSuccess(
            "¿Confirmar Venta?", 
            `Total: $${total} - Método: ${metodoPago}`
        );
        if (!confirm.isConfirmed) return;

        setIsCheckingOut(true);
        try {
            // 1. Preparamos el payload (Array de items)
            const itemsParaVender = cart.map(item => ({
                productoId: item.id,
                cantidad: item.cantidadCompra
            }));

            // 2. HACEMOS UNA SOLA LLAMADA AL BACKEND
            await PagosApi.venderCarrito({
                usuarioId: alumno.id,
                metodoPago: metodoPago,
                items: itemsParaVender
            });

            showSuccess("Venta registrada correctamente.");
            clearCart();
            refreshProductos(); 
        } catch (error: any) {
            showError(error.response?.data?.error || "Error al procesar la venta.");
        } finally {
            setIsCheckingOut(false);
        }
    };

    return {
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        total,
        handleCheckout,
        isCheckingOut,
        metodoPago,
        setMetodoPago
    };
};