import { createPortal } from "react-dom";
import { useProductos } from "../../Hooks/Productos/useProductos";
import { useAlumnoSearch } from "../../Hooks/useAlumnoSearch"; // Importamos tu hook de búsqueda
import { useCarritoProductos } from "../../Hooks/Productos/useCarritoProductos"; // El hook nuevo
import { AppStyles } from "../../Styles/AppStyles";
import { Button } from "../../Components/UI/Button";
import { Input } from "../../Components/UI/Input";
import { PaymentMethodSelect } from "../../Components/UI/PaymentMethodSelect";

export const ProductosManager = () => {
    // 1. Hook de Productos (CRUD)
    const {
        productos, loading,
        isModalOpen, setIsModalOpen,
        isTrashOpen, setIsTrashOpen,
        form, setForm,
        handleOpenCreate, handleOpenEdit, handleOpenTrash,
        handleImageChange, imagePreview, uploadingImage,
        handleSave, handleDelete,
        archivedProductos, handleRestore,
        editingProduct,
        loadProductos // Necesitamos esto para refrescar el stock después de vender
    } = useProductos();

    // 2. Hook de Búsqueda de Alumnos
    const {
        busqueda,
        sugerencias,
        mostrarSugerencias,
        alumnoSeleccionado,
        handleSearchChange,
        handleSelectAlumno,
        setMostrarSugerencias,
        clearSelection
    } = useAlumnoSearch();

    // 3. Hook de Carrito / Venta
    const {
        cart, addToCart, removeFromCart, updateQuantity, clearCart, 
        total, handleCheckout, isCheckingOut, metodoPago, setMetodoPago
    } = useCarritoProductos(loadProductos);

    // Helpers
    const formatPrice = (price: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(price);
    const modalTitle = editingProduct ? "Editar Producto" : "Nuevo Producto";
    const submitButtonText = editingProduct ? "Guardar Cambios" : "Crear Producto";
    const iconModal = editingProduct ? "✏️" : "✨";

    return (
        <div className={AppStyles.principalContainer}>
            <div className="w-full max-w-7xl mx-auto space-y-8 pb-20">
                
                {/* --- HEADER --- */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gray-900/50 p-6 rounded-2xl border border-white/5 backdrop-blur-sm">
                    <div>
                        <h1 className={AppStyles.title}>Tienda & Stock 🛒</h1>
                        <p className={AppStyles.subtitle}>Administra productos y realiza ventas rápidas.</p>
                    </div>
                    <div className="flex flex-wrap gap-3 w-full md:w-auto">
                        <button onClick={handleOpenTrash} className={AppStyles.btnSecondaryNotFlex + " flex items-center gap-2 justify-center flex-1 md:flex-none"}>
                            <span>🗑️</span> Papelera
                        </button>
                        <button onClick={handleOpenCreate} className={AppStyles.btnPrimary + " flex items-center gap-2 justify-center flex-1 md:flex-none py-3 px-6"}>
                            <span>+</span> Nuevo Producto
                        </button>
                    </div>
                </div>

                {/* --- SECCIÓN PUNTO DE VENTA (CARRITO) --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* COLUMNA IZQ: BUSCADOR Y CARRITO */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className={`${AppStyles.glassCard} border-l-4 border-l-green-500`}>
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <span>🏧</span> Punto de Venta
                            </h3>

                            {/* 1. BUSCADOR DE ALUMNOS (Estilo Hero) */}
                            <div className="relative z-50 mb-8">
                                <div className={AppStyles.searchWrapper}>
                                    <div className={`${AppStyles.searchGlow} bg-gradient-to-r from-green-600 to-blue-600`}></div>
                                    <input
                                        type="text"
                                        value={busqueda}
                                        onChange={(e) => handleSearchChange(e.target.value)}
                                        onFocus={() => busqueda && setMostrarSugerencias(true)}
                                        placeholder="🔍 Buscar alumno para vender..."
                                        className={AppStyles.searchInput}
                                    />
                                    {/* Botón limpiar */}
                                    {alumnoSeleccionado && (
                                        <button 
                                            onClick={clearSelection}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white z-20"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>

                                {/* Sugerencias Dropdown */}
                                {mostrarSugerencias && sugerencias.length > 0 && (
                                    <ul className={AppStyles.suggestionsList + " max-w-2xl mx-auto left-0 right-0 top-full mt-2"}>
                                        {sugerencias.map((alumno) => (
                                            <li key={alumno.id} onClick={() => handleSelectAlumno(alumno)} className={AppStyles.suggestionItem}>
                                                <div className={AppStyles.avatarSmall}>{alumno.nombre.charAt(0)}</div>
                                                <span className="text-gray-200">{alumno.nombre} {alumno.apellido}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {/* 2. TABLA DEL CARRITO */}
                            {cart.length > 0 ? (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="overflow-hidden rounded-xl border border-white/10">
                                        <table className="w-full text-left">
                                            <thead className="bg-black/40 text-gray-400 text-xs uppercase font-bold">
                                                <tr>
                                                    <th className="p-4">Producto</th>
                                                    <th className="p-4 text-center">Cant.</th>
                                                    <th className="p-4 text-right">Precio</th>
                                                    <th className="p-4 text-right">Subtotal</th>
                                                    <th className="p-4 text-center"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5 bg-black/20">
                                                {cart.map(item => (
                                                    <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                                        <td className="p-4 font-medium text-white">{item.nombre}</td>
                                                        <td className="p-4">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 rounded bg-white/80 hover:bg-white/90 flex items-center justify-center">-</button>
                                                                <span className="w-8 text-center text-white">{item.cantidadCompra}</span>
                                                                <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 rounded bg-white/80 hover:bg-white/90 flex items-center justify-center">+</button>
                                                            </div>
                                                        </td>
                                                        <td className="p-4 text-right text-white">{formatPrice(item.precio)}</td>
                                                        <td className="p-4 text-right font-bold text-green-400">{formatPrice(item.precio * item.cantidadCompra)}</td>
                                                        <td className="p-4 text-center">
                                                            <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-300">✕</button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* FOOTER DEL CARRITO: TOTAL Y PAGAR */}
                                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-4 border-t border-white/10">
                                        
                                        {/* Selector Método Pago */}
                                        <div className="flex items-center gap-4">
                                            <button 
                                                onClick={clearCart}
                                                className="mr-6 text-red-400 hover:text-red-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-colors"
                                            >
                                                🗑️ Vaciar
                                            </button>
                                            {/* Usamos el componente PaymentMethodSelect */}
                                            <div className="flex-1 md:flex-none">
                                                <PaymentMethodSelect 
                                                    value={metodoPago}
                                                    onChange={setMetodoPago}
                                                    // No pasamos 'label' para que se adapte al diseño horizontal
                                                    // Ajustamos estilos para que quede alineado
                                                    selectClassName="py-2 text-sm min-w-[160px]"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <span className="block text-gray-400 text-xs font-bold uppercase">Total a Pagar</span>
                                                <span className="text-3xl font-black text-white">{formatPrice(total)}</span>
                                            </div>
                                            <Button 
                                                onClick={() => handleCheckout(alumnoSeleccionado)} 
                                                disabled={isCheckingOut}
                                                className="bg-green-600 hover:bg-green-500 text-white px-8 py-4 rounded-xl shadow-lg shadow-green-900/40 font-bold text-lg transition-all hover:scale-105 disabled:opacity-50 disabled:scale-100"
                                            >
                                                {isCheckingOut ? "Procesando..." : "✅ Confirmar Venta"}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-700 rounded-xl">
                                    <span className="text-4xl block mb-2 opacity-50">🛒</span>
                                    Selecciona productos abajo para agregarlos al carrito
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- GRID DE PRODUCTOS --- */}
                <div className="pt-8 border-t border-white/10">
                    <h2 className="text-2xl font-bold text-white mb-6">Catálogo de Productos</h2>
                    
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : productos.length === 0 ? (
                        <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/5">
                            <p className="text-gray-400">No hay productos disponibles.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {productos.map((prod) => (
                                <div key={prod.id} className={`${AppStyles.glassCard} p-0 flex flex-col group hover:border-green-500/30 transition-all duration-300 min-h-[400px]`}>
                                    
                                    <div className="h-48 w-full bg-black/40 relative overflow-hidden border-b border-white/5">
                                        {prod.imagenUrl ? (
                                            <img src={prod.imagenUrl} alt={prod.nombre} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 bg-gray-900/50">
                                                <span className="text-4xl opacity-30 mb-2">📷</span>
                                            </div>
                                        )}
                                        <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-black border backdrop-blur-md shadow-lg transition-all ${prod.stock > 5 ? "bg-black/60 text-white border-white/10" : "bg-red-600/90 text-white border-red-400 animate-pulse"}`}>
                                            {prod.stock > 0 ? `${prod.stock} un.` : "SIN STOCK"}
                                        </div>
                                    </div>

                                    <div className="p-5 flex-1 flex flex-col">
                                        <h3 className="text-lg font-bold text-white mb-1 truncate">{prod.nombre}</h3>
                                        <p className="text-xs text-gray-400 mb-4 line-clamp-2 min-h-[2.5em]">{prod.descripcion || "Sin descripción."}</p>
                                        
                                        <div className="mt-auto">
                                            <div className="flex justify-between items-center mb-3">
                                                <span className="text-xl font-black text-white">{formatPrice(prod.precio)}</span>
                                            </div>
                                            
                                            {/* BOTÓN AGREGAR AL CARRITO */}
                                            <button 
                                                onClick={() => addToCart(prod)}
                                                className="w-full bg-green-600/20 hover:bg-green-500 text-green-400 hover:text-white font-bold py-2 rounded-lg border border-green-500/30 transition-all mb-3 flex items-center justify-center gap-2"
                                            >
                                                <span>🛒</span> Agregar
                                            </button>

                                            <div className="flex justify-between pt-3 border-t border-white/10">
                                                <button onClick={() => handleOpenEdit(prod)} className="text-xs font-bold text-yellow-500 hover:text-yellow-400 flex items-center gap-1">
                                                    ✏️ Editar
                                                </button>
                                                <button onClick={() => handleDelete(prod)} className="text-xs font-bold text-red-500 hover:text-red-400 flex items-center gap-1">
                                                    🗑️ Eliminar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* --- MODALES (CREAR/EDITAR y PAPELERA) --- */}
                {/* (Aquí va el mismo código de modales que ya tenías, no hace falta repetirlo si no cambió) */}
                {/* ... Modal Crear/Editar ... */}
                {isModalOpen && createPortal(
                    <div className={AppStyles.modalOverlay}>
                        <div className={`${AppStyles.modalContent} max-w-lg`} onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center p-6 border-b border-white/10 bg-black/20">
                                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                                    <span className="text-2xl">{iconModal}</span>
                                    {modalTitle}
                                </h2>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white text-3xl leading-none transition-colors">&times;</button>
                            </div>
                            <div className={`p-8 space-y-6 ${AppStyles.customScrollbar}`}>
                                <div className="flex justify-center">
                                    <label className="relative w-40 h-40 rounded-2xl bg-black/40 border-2 border-dashed border-gray-600 hover:border-green-500 hover:bg-white/5 flex flex-col items-center justify-center cursor-pointer overflow-hidden group transition-all shadow-inner">
                                        {imagePreview ? (
                                            <>
                                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover opacity-80 group-hover:opacity-40 transition-opacity" />
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span className="bg-black/60 text-white px-3 py-1 rounded-full text-xs font-bold">Cambiar</span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-center text-gray-500 group-hover:text-green-400 transition-colors">
                                                <span className="text-4xl block mb-2">📷</span>
                                                <span className="text-xs font-bold uppercase tracking-wider">Subir Foto</span>
                                            </div>
                                        )}
                                        <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                                    </label>
                                </div>
                                <div className="space-y-5">
                                    <Input label="Nombre del Producto" placeholder="Ej: Agua Mineral 500ml" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} className={AppStyles.inputDark} labelClassName={AppStyles.label} />
                                    <div className="space-y-2">
                                        <label className={AppStyles.label}>Descripción</label>
                                        <textarea value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} className={`${AppStyles.inputDark} min-h-[80px] resize-none`} placeholder="Detalles del producto..." />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <Input label="Precio ($)" type="number" min={0} step="0.01" value={form.precio} onChange={e => { const val = parseFloat(e.target.value); setForm({...form, precio: val < 0 ? "0" : e.target.value}); }} className={`${AppStyles.inputDark} text-right font-mono text-lg font-bold text-green-400`} labelClassName={AppStyles.label} />
                                        <Input label="Stock Inicial" type="number" min={0} value={form.stock} onChange={e => { const val = parseInt(e.target.value); setForm({...form, stock: val < 0 ? "0" : e.target.value}); }} className={`${AppStyles.inputDark} text-right font-mono text-lg font-bold`} labelClassName={AppStyles.label} />
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 border-t border-white/10 bg-black/20 flex gap-4">
                                <button onClick={() => setIsModalOpen(false)} className={AppStyles.btnSecondary}>Cancelar</button>
                                <button onClick={handleSave} disabled={uploadingImage} className={`${AppStyles.btnPrimary} flex-1 py-3 text-base`}>
                                    {uploadingImage ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></span>Subiendo...</span> : submitButtonText}
                                </button>
                            </div>
                        </div>
                    </div>, document.body
                )}

                {/* ... Modal Papelera ... */}
                {isTrashOpen && createPortal(
                    <div className={AppStyles.modalOverlay}>
                        <div className={`${AppStyles.modalContent} max-w-2xl`} onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center p-6 border-b border-white/10 bg-black/20">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-3"><span>🗑️</span> Papelera de Reciclaje</h2>
                                <button onClick={() => setIsTrashOpen(false)} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
                            </div>
                            <div className="p-6 bg-gray-900/50">
                                <p className="text-sm text-gray-400 mb-2">Aquí están los productos eliminados. Puedes restaurarlos para volver a venderlos.</p>
                            </div>
                            <div className={`flex-1 p-6 space-y-3 min-h-[300px] ${AppStyles.customScrollbar}`}>
                                {archivedProductos.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-500 py-10 opacity-50">
                                        <span className="text-5xl mb-2">🍃</span>
                                        <p>La papelera está limpia</p>
                                    </div>
                                ) : (
                                    archivedProductos.map(prod => (
                                        <div key={prod.id} className="flex items-center justify-between bg-black/30 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 bg-gray-800 rounded-lg overflow-hidden border border-white/10">
                                                    {prod.imagenUrl ? <img src={prod.imagenUrl} className="w-full h-full object-cover grayscale opacity-70" alt="" /> : <div className="w-full h-full flex items-center justify-center text-xl">📦</div>}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-300 text-lg group-hover:text-white transition-colors">{prod.nombre}</p>
                                                    <p className="text-xs text-gray-500 font-mono">Precio histórico: {formatPrice(prod.precio)}</p>
                                                </div>
                                            </div>
                                            <button onClick={() => handleRestore(prod)} className="px-4 py-2 bg-green-500/10 text-green-400 text-sm font-bold rounded-lg border border-green-500/20 hover:bg-green-500/20 hover:border-green-500/50 transition-all flex items-center gap-2"><span>♻️</span> Restaurar</button>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="p-4 border-t border-white/10 bg-black/20 text-right">
                                <button onClick={() => setIsTrashOpen(false)} className={AppStyles.btnSecondary}>Cerrar</button>
                            </div>
                        </div>
                    </div>, document.body
                )}

            </div>
        </div>
    );
};