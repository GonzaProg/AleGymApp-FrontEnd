import Swal from 'sweetalert2';

// Configuración base 
const toastMixin = Swal.mixin({
  background: '#1f2937', // Gris oscuro (bg-gray-800)
  color: '#ffffff',      // Texto blanco
  confirmButtonColor: '#22c55e', // Verde (green-500)
  cancelButtonColor: '#ef4444',  // Rojo
  customClass: {
    popup: 'border border-gray-700 shadow-xl'
  }
});

export const showSuccess = (message: string) => {
  return toastMixin.fire({
    icon: 'success',
    title: '¡Éxito!',
    text: message,
    confirmButtonText: 'Aceptar'
  });
};

export const showError = (message: string) => {
  return toastMixin.fire({
    icon: 'error',
    title: 'Ocurrió un error',
    text: message,
    confirmButtonText: 'Entendido'
  });
};

export const showConfirm = (title: string, text: string) => {
  return Swal.fire({
    title: title,
    text: text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444', // Rojo (red-500) para indicar peligro
    cancelButtonColor: '#6b7280',  // Gris (gray-500) para cancelar
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    background: '#1f2937', // Fondo oscuro
    color: '#e5e7eb',      // Texto claro
    customClass: {
      popup: 'border border-gray-700 shadow-2xl rounded-2xl'
    }
  });
};