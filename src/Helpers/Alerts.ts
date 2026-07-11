import Swal from 'sweetalert2';

const commonCustomClass = {
    popup: 'border border-gray-700 shadow-2xl rounded-2xl',
    container: 'z-[10000]' // Asegura que las alertas estén por encima de otros elementos
};

// Configuración base para alertas tipo Toast/Info
const toastMixin = Swal.mixin({
    background: '#1f2937', // bg-gray-800
    color: '#ffffff',      // Texto blanco
    confirmButtonColor: '#22c55e', // green-500
    cancelButtonColor: '#ef4444',  // red-500
    customClass: commonCustomClass
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

export const showConfirmDelete = (title: string, text: string) => {
    return Swal.fire({
        title: title,
        text: text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444', // Rojo
        cancelButtonColor: '#6b7280',  // Gris
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        background: '#1f2937',
        color: '#e5e7eb',
        customClass: commonCustomClass // Aplicamos el z-index alto
    });
};

export const showConfirmSuccess = (title: string, text: string) => {
    return Swal.fire({
        title: title,
        text: text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#22c55e', // Verde
        cancelButtonColor: '#6b7280',  // Gris
        confirmButtonText: 'Sí, Confirmar',
        cancelButtonText: 'Cancelar',
        background: '#1f2937',
        color: '#e5e7eb',
        customClass: commonCustomClass // Aplicamos el z-index alto
    });
};

export const showPasswordPrompt = async (title: string, text: string) => {
    return Swal.fire({
        title: title,
        text: text,
        input: 'password',
        inputPlaceholder: 'Ingrese su contraseña',
        inputAttributes: {
            autocapitalize: 'off',
            autocorrect: 'off'
        },
        showCancelButton: true,
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#3b82f6',
        cancelButtonColor: '#6b7280',
        background: '#1f2937',
        color: '#e5e7eb',
        customClass: commonCustomClass,
        inputValidator: (value) => {
            if (!value) {
                return '¡Necesitas escribir la contraseña!';
            }
            return null;
        }
    });
};

export const showEditNotePrompt = async (conceptoActual: string) => {
    return Swal.fire({
        title: 'Modificar Nota',
        html: `
            <div style="text-align: left; margin-top: 10px;">
                <label style="color: #9ca3af; font-size: 14px; margin-bottom: 5px; display: block;">Concepto</label>
                <textarea id="swal-input-concepto" class="swal2-textarea" style="width: 100%; margin: 0; box-sizing: border-box;">${conceptoActual}</textarea>
            </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#3b82f6',
        cancelButtonColor: '#6b7280',
        background: '#1f2937',
        color: '#e5e7eb',
        customClass: commonCustomClass,
        preConfirm: () => {
            const concepto = (document.getElementById('swal-input-concepto') as HTMLTextAreaElement).value;
            if (!concepto.trim()) {
                Swal.showValidationMessage('El concepto no puede estar vacío');
                return false;
            }
            return { concepto };
        }
    });
};