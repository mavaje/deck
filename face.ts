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

    card_types(): string[] {
        return Catalog.card_types.filter(type => this.is_card_type(type));
    }

    is_card_type(type: string): boolean {
        if (!this.card) return null;

        return new RegExp(`^[a-z ]*\\b${type}\\b`, 'i').test(this.face.type_line)
        || {
            Creature: /\b(Summon|Eaturecray)\b/i,
            Phenomenon: /\bPhenome-nom\b/i,
            Planeswalker: /\bUniversewalker\b/i,
        }[type]?.test(this.face.type_line);
    }

    is_all_types(card_type: string): boolean {
        return this.is_card_type(card_type) && ({
            Creature: /(^|\n)Changeling\b/i,
            Land: /(^|\n)Rangeling\b/i,
        }[card_type]?.test(this.oracle()) ?? false);
    }

    is_type(type: string): boolean;
    is_type(...types: string[]): boolean;
    is_type(...types: string[]): boolean {
        if (!this.card) return null;

        return types.every(type =>
            new RegExp(`\\b${type}\\b`, 'i').test(this.face.type_line)
            || this.is_card_type(type)
            || Catalog.card_types.any(type => Catalog.subtypes[type]?.has(type) && this.is_card_type(type))
            || {
                Boar: /\bIgpay\b/i,
            }[type]?.test(this.face.type_line)
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
        return this.face?.power;
    }

    toughness(): string {
        return this.face?.toughness;
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
            : this.face?.oracle_text?.replaceAll(this.card_name(), '~');
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
        return (printed && this.is_default_language() && this.face?.printed_name) || this.face?.name;
    }
}
