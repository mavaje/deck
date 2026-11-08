import {ColorSet} from "./color-set";

export const MTG_COLORS = {
    black: '#231825',
    white: '#f8e7b9',
    blue: '#2886c8',
    red: '#d34222',
    green: '#318f26',
    gold: '#cd9e45',
    silver: '#aec3d3',
    purple: '#9c50b1',
    orange: '#f88007',
};

MTG_COLORS['W'] = MTG_COLORS.white;
MTG_COLORS['U'] = MTG_COLORS.blue;
MTG_COLORS['B'] = MTG_COLORS.black;
MTG_COLORS['R'] = MTG_COLORS.red;
MTG_COLORS['G'] = MTG_COLORS.green;

export function hex2rgb(hex: string): number[] {
    return [1, 3, 5]
        .map(i => hex.slice(i, i + 2))
        .map(s => Number.parseInt(s, 16) / 255);
}

export function rgb2hex(rgb: number[]): string {
    return rgb
        .reduce((hex, c) => hex + Math.round(c * 255).toString(16), '#');
}

export function blend(...hexes: string[]): string {
    if (hexes.length < 2) return hexes[0];

    const rgb = hexes
        .map(hex2rgb)
        .reduce((blended, rgb) => blended.map((v, i) => v + rgb[i] / hexes.length), [0, 0, 0]);

    return rgb2hex(rgb);
}

export function contrast(hex: string): boolean {
    const [r, g, b] = hex2rgb(hex);
    return r * 0.299 + g * 0.587 + b * 0.114 > 0.5;
}

export function gradient(identity: ColorSet): string[] {
    switch (identity.colors.length) {
        case 0:
            return [MTG_COLORS.silver];
        case 1:
        case 2:
            return identity.colors.map(c => MTG_COLORS[c]);
        default:
            return [MTG_COLORS.gold];
    }
}
