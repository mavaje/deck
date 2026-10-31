import {ColorIdentity} from "./color-identity";

export const MTG_COLORS = {
    black: '#2e272e',
    white: '#fff7e0',
    blue: '#2886c8',
    red: '#d32b22',
    green: '#3b8f26',
    gold: '#e6ae37',
    silver: '#aec3d3',
    purple: '#9c50b1',
    orange: '#f86a07',
};

MTG_COLORS['W'] = MTG_COLORS.white;
MTG_COLORS['U'] = MTG_COLORS.blue;
MTG_COLORS['B'] = MTG_COLORS.black;
MTG_COLORS['R'] = MTG_COLORS.red;
MTG_COLORS['G'] = MTG_COLORS.green;

export function contrast(...hexes: string[]): string {
    const rgb = [0, 0, 0];

    hexes.forEach(hex => [1, 3, 5]
        .map(i => hex.slice(i, i + 2))
        .map(s => Number.parseInt(s, 16) / 255)
        .forEach((v, i) => {
            rgb[i] += v / hexes.length;
        }));

    const [r, g, b] = rgb;
    return r * 0.299 + g * 0.587 + b * 0.114 > 0.5
        ? '#000000'
        : '#ffffff';
}

export function from_color_identity(identity: ColorIdentity): string[] {
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
