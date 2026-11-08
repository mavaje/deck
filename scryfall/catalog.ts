import {API} from "./api";
import {OneTimeLoader} from "./one-time-loader";

export class Catalog {

    private static INSTANCES: Catalog[] = [];
    private static LOADER = new OneTimeLoader();

    public static supertypes = new Catalog('supertypes');
    public static card_types = new Catalog('card-types', [
        'Card',
        'Stickers',
        'Token',
    ]);

    public static artifact_types = new Catalog('artifact-types');
    public static battle_types = new Catalog('battle-types');
    public static creature_types = new Catalog('creature-types');
    public static enchantment_types = new Catalog('enchantment-types');
    public static land_types = new Catalog('land-types');
    public static planeswalker_types = new Catalog('planeswalker-types');
    public static spell_types = new Catalog('spell-types');

    public static subtypes: Record<string, Catalog> = {
        'Land': Catalog.land_types,
        'Artifact': Catalog.artifact_types,
        'Enchantment': Catalog.enchantment_types,
        'Creature': Catalog.creature_types,
        'Kindred': Catalog.creature_types,
        'Battle': Catalog.battle_types,
        'Planeswalker': Catalog.planeswalker_types,
        'Instant': Catalog.spell_types,
        'Sorcery': Catalog.spell_types,
    };

    public static keyword_abilities = new Catalog('keyword-abilities');

    private loader = new OneTimeLoader();

    private data: string[] = [];
    private map: Set<string> = new Set();

    constructor(
        private type: string,
        private extra: string[] = [],
    ) {
        Catalog.INSTANCES.push(this);
    }

    private async load(): Promise<void> {
        await this.loader.load(async () => {
            const catalog = await API.catalog(this.type);
            if (catalog) {
                this.data = catalog.data;
                this.data.push(...this.extra);
                this.data.forEach(type => {
                    this.map.add(type);
                    this.map.add(type.toLowerCase());
                });
            }
        });
    }

    static async load(): Promise<void> {
        await this.LOADER.load(() => Promise.all(this.INSTANCES.map(catalog => catalog.load())));
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

    any(callback: (type: string) => any): boolean {
        return this.data.some(callback);
    }
}
