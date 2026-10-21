import {Color, COLORS} from "./scryfall/types";

export class ColorIdentity {
    public colors: Color[];

    constructor(colors: Color[] | ColorIdentity = []) {
        this.colors = COLORS.filter(color => colors.includes(color));
    }

    includes(color: Color): boolean {
        return this.colors.includes(color);
    }

    add(color: Color): void;
    add(colors: Color[] | ColorIdentity): void;
    add(colors: Color | Color[] | ColorIdentity): void {
        if (typeof colors === 'string') colors = [colors];
        this.colors = COLORS
            .filter(color => this.colors.includes(color) || colors.includes(color));
    }

    within(colors: Color[] | ColorIdentity): boolean {
        return this.colors.every(color => colors.includes(color));
    }

    contains(colors: Color[] | ColorIdentity): boolean {
        return new ColorIdentity(colors).within(this);
    }
}
