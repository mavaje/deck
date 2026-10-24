import {API} from "./api";

export class Catalog {

    private static INSTANCES: Catalog[] = [];
    private static IS_LOADED: boolean = false;

    public static supertypes = new Catalog('supertypes');
    public static card_types = new Catalog('card-types');

    public static artifact_types = new Catalog('artifact-types');
    public static battle_types = new Catalog('battle-types');
    public static creature_types = new Catalog('creature-types');
    public static enchantment_types = new Catalog('enchantment-types');
    public static land_types = new Catalog('land-types');
    public static planeswalker_types = new Catalog('planeswalker-types');
    public static spell_types = new Catalog('spell-types');

    public static keyword_abilities = new Catalog('keyword-abilities', {
        'Augment': 'activated',
        'Aura Swap': 'activated',
        'Commander ninjutsu': 'activated',
        'Craft': 'activated',
        'Crew': 'activated',
        'Cycling': 'activated',
        'Embalm': 'activated',
        'Encore': 'activated',
        'Equip': 'activated',
        'Equipment Swap': 'activated',
        'Eternalize': 'activated',
        'Fortify': 'activated',
        'Host': 'activated',
        'Level Up': 'activated',
        'Ninjutsu': 'activated',
        'Outlast': 'activated',
        'Reconfigure': 'activated',
        'Reinforce': 'activated',
        'Saddle': 'activated',
        'Scavenge': 'activated',
        'Shackle': 'activated',
        'Specialize': 'activated',
        'Station': 'activated',
        'Transfigure': 'activated',
        'Transmute': 'activated',
        'Unearth': 'activated',
    });

    private data: string[] = [];
    private map: Record<string, true> = {};

    constructor(
        private type: string,
        private mapping?: Record<string, string>,
    ) {
        Catalog.INSTANCES.push(this);
    }

    private async load(): Promise<void> {
        this.data = (await API.catalog(this.type)).data;
        this.data.forEach(type => this.map[type] = true);
    }

    static async load(): Promise<void> {
        if (this.IS_LOADED) return;

        await Promise.all(this.INSTANCES.map(catalog => catalog.load()));

        this.IS_LOADED = true;
    }

    has(type: string): boolean {
        return this.map[type];
    }

    all(): string[] {
        return this.data;
    }

    filter(callback: (type: string) => boolean) {
        return this.data.filter(callback);
    }

    lookup(type: string): string {
        return this.mapping?.[type] ?? null;
    }
}
