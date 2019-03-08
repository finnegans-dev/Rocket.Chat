//const colors = ['#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39', '#FFC107', '#FF9800', '#FF5722', '#795548', '#9E9E9E', '#607D8B'];
let colors = ["#007c7e", "#b90005", "#d07a00", "af9a04", "#638503", "#007c7e", "#00439e", "#5d1d94", "#9e0069", "#d07a00"];

//export const getAvatarColor = (name) => colors[name.length % colors.length];
/*
    Algoritmo para calcular el color
*/
export const getAvatarColor = (name) => {
    let suma = 0;
    let colorNumber = 0;
    let colores = ["#007c7e", "#b90005", "#d07a00", "af9a04", "#638503", "#007c7e", "#00439e", "#5d1d94", "#9e0069", "#d07a00"];

    if (name.length > 0) {
        for (let i = 0; i < name.length; i++) {
            suma += name.charCodeAt(i);
        }
        colorNumber = (suma % 9);
    } else {
        suma = Math.floor((Math.random() * 10));
        colorNumber = suma;
    }
    return colores[colorNumber]
};
