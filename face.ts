import {Card, CardFace, Color, Legality} from "./scryfall/types";
import {Language} from "./designation/language";
import {Catalog} from "./scryfall/catalog";
import {Format} from "./format";
import {ColorSet} from "./color-set";

export class Face<T extends Card | CardFace = Card | CardFace> {

    constructor(
        public card: Card,
        public face: T = card as T,
    ) {}

    flush(): this {
        this.card = null;
        this.face = null;
        return this;
    }

    hydrate(card: Card, face: T = card as T): this {
        this.card = card;
        this.face = face;
        return this;
    }

    is_card(): this is Face<Card> {
        return this.face?.object === 'card';
    }

    is_face(): this is Face<CardFace> {
        return this.face?.object === 'card_face';
    }

    faces(): Face[] {
        return this.is_card()
            && this.card.card_faces?.map(face => new Face(this.card, face))
            || [this];
    }

    off_battlefield_overrides(): Partial<Card> {
        const match = this.oracle()?.match(/As long as ~ isn't on the battlefield, it's a ((?<power>\d+)\/(?<toughness>\d+) )?(?<type_line>\w+( \w+)*) in addition to its other types./i);
        return match?.groups ?? {};
    }

    legality(format: Format): Legality {
        return this.card?.legalities[format?.code];
    }

    is_legal(format: Format): boolean {
        return !([
            'not_legal',
            'banned',
        ] as Legality[]).includes(this.legality(format));
    }

    is_default_language(): boolean {
        return !this.card || this.card?.lang === Language.DEFAULT.code();
    }

    layout(): string {
        return this.card?.layout ?? 'normal';
    }

    is_layout(layout: string): boolean;
    is_layout(...layouts: string[]): boolean;
    is_layout(...layouts: string[]): boolean {
        return layouts.some(layout => this.card?.layout === layout);
    }

    colors(): ColorSet {
        const colors = this.face?.colors ?? this.card?.colors;
        return colors ? new ColorSet(colors) : null;
    }

    color_identity(): ColorSet {
        return this.card
            ? new ColorSet(this.card.color_identity)
            : null;
    }

    colors_produced(): ColorSet {
        return this.card
            ? new ColorSet(this.card.produced_mana as Color[])
            : null;
    }

    full_type_line() {
        return (this.off_battlefield_overrides()?.type_line ?? '')
            + ' ' + this.face?.type_line;
    }

    card_types(): string[] {
        return Catalog.card_types.filter(type => this.is_card_type(type));
    }

    is_card_type(card_type: string): boolean {
        if (!this.card) return null;

        return new RegExp(`^[a-z ]*\\b${card_type}\\b`, 'i').test(this.full_type_line())
        || {
            creature: /\b(Summon|Eaturecray)\b/i,
            phenomenon: /\bPhenome-nom\b/i,
            planeswalker: /\bUniversewalker\b/i,
        }[card_type.toLowerCase()]?.test(this.full_type_line());
    }

    is_all_types(card_type: string): boolean {
        return this.is_card_type(card_type) && ({
            creature: /(^|\n)Changeling\b/i,
            land: /(^|\n)Rangeling\b/i,
        }[card_type.toLowerCase()]?.test(this.oracle()) ?? false);
    }

    is_type(type: string): boolean;
    is_type(...types: string[]): boolean;
    is_type(...types: string[]): boolean {
        if (!this.card) return null;

        return types.every(type =>
            this.is_card_type(type)
            || new RegExp(`\\b${type}\\b`, 'i').test(this.full_type_line())
            || Catalog.card_types.any(card_type => this.is_all_types(card_type)
                && Catalog.subtypes[card_type]?.has(type))
            || {
                boar: /\bIgpay\b/i,
            }[type.toLowerCase()]?.test(this.full_type_line())
        );
    }

    is_any_type(types: string[]): boolean;
    is_any_type(type_groups: string[][]): boolean;
    is_any_type(type_groups: (string | string[])[]): boolean {
        if (!this.card) return null;
        return type_groups.some(types => this.is_type(...Array.isArray(types) ? types : [types]));
    }

    is_basic_land(): boolean {
        return this.is_type('Basic', 'Land');
    }

    is_permanent(): boolean {
        return this.is_any_type([
            'Artifact',
            'Battle',
            'Creature',
            'Enchantment',
            'Land',
            'Planeswalker',
        ]);
    }

    mana_value(): number {
        return this.face?.cmc;
    }

    power(): string {
        return this.face?.power ?? this.off_battlefield_overrides()?.power;
    }

    toughness(): string {
        return this.face?.toughness ?? this.off_battlefield_overrides()?.toughness;
    }

    loyalty(): string {
        return this.face?.loyalty;
    }

    defense(): string {
        return this.face?.defense;
    }

    oracle(): string {
        return this.is_card() && this.is_layout('split')
            ? this.faces().map(face => face.oracle()).join('\n')
            : this.face?.oracle_text
                ?.replaceAll(this.card_name(), '~')
                .replaceAll(this.card_name().split(',')[0], '~');
    }

    has_ability(ability: string | RegExp): boolean {
        if (!(ability instanceof RegExp)) ability = new RegExp(`(^|\\n)${ability}(—| [\d{(]|$)`, 'i');
        return ability.test(this.oracle());
    }

    has_activate_ability(): boolean {
        if (!this.card) return false;

        if (this.oracle().match(/(^|\n)[^"]+("[^"]+"[^"]*)*:/)) {
            return true;
        }

        if (this.is_any_type([
            'Plains',
            'Island',
            'Swamp',
            'Mountain',
            'Forest',
        ])) {
            return true;
        }

        const activated_ability_words = {
            'Augment': true,
            'Aura Swap': true,
            'Commander ninjutsu': true,
            'Craft': true,
            'Crew': true,
            'Cycling': true,
            'Embalm': true,
            'Encore': true,
            'Equip': true,
            'Equipment Swap': true,
            'Eternalize': true,
            'Fortify': true,
            'Host': true,
            'Level Up': true,
            'Ninjutsu': true,
            'Outlast': true,
            'Reconfigure': true,
            'Reinforce': true,
            'Saddle': true,
            'Scavenge': true,
            'Shackle': true,
            'Specialize': true,
            'Station': true,
            'Transfigure': true,
            'Transmute': true,
            'Unearth': true,
        };

        if (this.card.keywords.some(kw => activated_ability_words[kw])) {
            return true;
        }

        return Object.entries(activated_ability_words)
            .filter(([_, activated]) => activated)
            .some(([kw]) => this.has_ability(kw));
    }

    has_keyword(keyword: string): boolean {
        return this.card?.keywords.includes(keyword);
    }

    image_urls(): string[] {
        const image_uris = this.face?.image_uris ?? this.card?.image_uris;

        if (image_uris) {
            return [
                image_uris.grid,
                image_uris.thumb,
            ].filter(Boolean);
        }

        return [];
    }

    card_name(printed: boolean = false): string {
        return printed && this.is_default_language()
            ? this.face?.printed_name ?? this.face?.name
            : this.face?.name;
    }
}
