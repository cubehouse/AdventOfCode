// basic colour lib

export default class Colour {

    static yellow = { r: 255, g: 255, b: 0 };
    static red = { r: 255, g: 0, b: 0 };
    static blue = { r: 0, g: 0, b: 255 };
    static green = { r: 0, g: 255, b: 0 };
    static white = { r: 255, g: 255, b: 255 };
    static black = { r: 0, g: 0, b: 0 };
    static orange = { r: 255, g: 165, b: 0 };
    static purple = { r: 255, g: 0, b: 255 };
    static pink = { r: 255, g: 192, b: 203 };
    static aqua = { r: 0, g: 255, b: 255 };
    static brown = { r: 165, g: 42, b: 42 };
    static grey = { r: 128, g: 128, b: 128 };
    static violet = { r: 238, g: 130, b: 238 };

    static basicColours = [
        Colour.red,
        Colour.green,
        Colour.blue,
        Colour.orange,
        Colour.purple,
        Colour.pink,
        Colour.aqua,
        Colour.brown,
        Colour.grey,
        Colour.violet,
        Colour.yellow,
    ];

    static colourLerp(a, b, alpha) {
        return {
            r: Math.round(a.r + (b.r - a.r) * alpha),
            g: Math.round(a.g + (b.g - a.g) * alpha),
            b: Math.round(a.b + (b.b - a.b) * alpha),
        };
    }

    static hslToRgb(h, s, l) {
        let r, g, b;

        if (s == 0) {
            r = g = b = l; // achromatic
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;

                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }

        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255),
        };
    }

    static colourToHex(colour) {
        return '#' + ((1 << 24) + (colour.r << 16) + (colour.g << 8) + colour.b).toString(16).slice(1);
    }
}