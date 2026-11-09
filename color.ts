import {ColorSet} from "./color-set";

export const MTG_COLORS = {
    blue: '#00b2ff',
    red: '#ff3000',
    green: '#63d500',
    yellow: '#ffd145',
    silver: '#a4b7c6',
    purple: '#9300bd',
    orange: '#ff9200',
};

MTG_COLORS['W'] = MTG_COLORS.yellow;
MTG_COLORS['U'] = MTG_COLORS.blue;
MTG_COLORS['B'] = MTG_COLORS.purple;
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
            // return identity.colors.map(c => MTG_COLORS[c]);
        default:
            return identity.colors.map(c => MTG_COLORS[c]);
            // return [MTG_COLORS.gold];
    }
}
