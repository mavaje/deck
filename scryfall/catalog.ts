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

    public static keyword_abilities = new Catalog('keyword-abilities');

    private data: string[] = [];
    private map: Set<string> = new Set();

    constructor(
        private type: string,
    ) {
        Catalog.INSTANCES.push(this);
    }

    private async load(): Promise<void> {
        this.data = (await API.catalog(this.type)).data;
        this.data.forEach(type => this.map.add(type));
    }

    static async load(): Promise<void> {
        if (this.IS_LOADED) return;

        await Promise.all(this.INSTANCES.map(catalog => catalog.load()));

        this.IS_LOADED = true;
    }

    has(type: string): boolean {
        return this.map.has(type);
    }

    all(): string[] {
        return this.data;
    }

    filter(callback: (type: string) => any): string[] {
        return this.data.filter(callback);
    }
}
