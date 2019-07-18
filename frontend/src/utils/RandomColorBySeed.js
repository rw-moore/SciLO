// reference: https://stackoverflow.com/questions/8132081/generate-a-random-seeded-hex-color
export default function genColor (seed) {
    let color = Math.floor((Math.abs(Math.sin(seed) * 16777215)) % 16777215).toString(16);
    // pad any colors shorter than 6 characters with leading 0s
    while(color.length < 6) {
        color = '0' + color;
    }

    return color;
}