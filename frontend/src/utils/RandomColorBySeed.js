// reference: https://stackoverflow.com/questions/8132081/generate-a-random-seeded-hex-color
// https://stackoverflow.com/questions/3942878/how-to-decide-font-color-in-white-or-black-depending-on-background-color
export default function genColor (seed) {
    let color = Math.floor((Math.abs(Math.sin(seed) * 16777215)) % 16777215).toString(16);
    // pad any colors shorter than 6 characters with leading 0s
    while(color.length < 6) {
        color = '0' + color;
    }

    return {bg: "#"+color, fg: chooseFontColor(color, "#FFFFFF", "#000000")};
}

function chooseFontColor(bgColor, lightColor, darkColor) {
    let color = (bgColor.charAt(0) === '#') ? bgColor.substring(1, 7) : bgColor;
    let r = parseInt(color.substring(0, 2), 16); // hexToR
    let g = parseInt(color.substring(2, 4), 16); // hexToG
    let b = parseInt(color.substring(4, 6), 16); // hexToB
    return (((r * 0.299) + (g * 0.587) + (b * 0.114)) > 186) ?
        darkColor : lightColor;
}