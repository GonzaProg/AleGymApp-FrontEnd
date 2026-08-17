export const ORDEN_COMIDAS = ["Desayuno", "Media mañana", "Almuerzo", "Media tarde", "Merienda", "Pre-Cena", "Cena", "Media noche"];

export const sortComidasByTime = (a: any, b: any) => {
    let indexA = ORDEN_COMIDAS.indexOf(a.tipo);
    let indexB = ORDEN_COMIDAS.indexOf(b.tipo);
    if (indexA === -1) indexA = 99;
    if (indexB === -1) indexB = 99;
    return indexA - indexB;
};
