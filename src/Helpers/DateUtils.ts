 // Formatea una fecha string (YYYY-MM-DD) para mostrarla en la zona horaria local
 // Ya que sino se puede restar un día por la diferencia de UTC.

export const formatearFechaUTC = (fechaInput: string | Date | undefined | null): string => {
    if (!fechaInput) return "";

    const fecha = new Date(fechaInput);

    // Validar si es una fecha válida
    if (isNaN(fecha.getTime())) return "";

    // Obtenemos la diferencia en minutos entre UTC y la hora local y la convertimos a milisegundos
    const userTimezoneOffset = fecha.getTimezoneOffset() * 60000;
    
    // Sumamos el offset para "cancelar" la resta que hace el navegador al convertir a local
    const fechaCorregida = new Date(fecha.getTime() + userTimezoneOffset);
    
    return fechaCorregida.toLocaleDateString();
};