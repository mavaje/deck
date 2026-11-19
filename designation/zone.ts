import {Designation} from "./designation";
import {DeckCard} from "../deck-card";
import {normalise} from "../text";

export class Zone extends Designation {
    static vanguard = new Zone('Vanguard', ['vanguard'], 1, 1, ['Vanguard']);
    static conspiracy = new Zone('Conspiracy', ['conspiracy'], [0], null, ['Conspiracy']);
    static hero = new Zone('Hero', ['hero'], 1, 1, ['Hero']);
    static commander = new Zone('Commander', ['cmdr', 'commanders', 'brawlers', 'oathbreakers']);
    static companion = new Zone('Companion', ['cmpn', 'companions'])
        .with_filter(card => card.has_keyword('Companion'));
    static deck = new Zone('Deck', ['main', 'main board', 'main deck']);
    static sideboard = new Zone('Sideboard', ['sb', 'side board', 'side']);
    static stickers = new Zone('Sticker Deck', ['stickers'], [10], 1, ['Stickers']);
    static attractions = new Zone('Attraction Deck', ['attraction', 'attractions'], 10, 1, ['Artifact - Attraction']);
    static contraptions = new Zone('Contraption Deck', ['contraption', 'contraptions'], [15], 1, ['Artifact - Contraption']);
    static planar = new Zone('Planar Deck', ['planar', 'planes'], [10], 1, ['Plane', 'Phenomenon']);
    static schemes = new Zone('Scheme Deck', ['scheme', 'schemes', 'archenemy'], [20], 2, ['Scheme']);
    static tokens = new Zone('Tokens', ['tokens', 'emblems', 'dungeons'], [20], 2, ['Token', 'Emblem', 'Dungeon', 'Card']);
    static maybeboard = new Zone('Maybeboard', ['mb', 'maybe board', 'maybe']);
    static acquireboard = new Zone('Acquireboard', ['ab', 'acquire', 'acquire board']);

    static DEFAULT = this.deck;

    static STARTING_DECK = [
        this.commander,
        this.deck,
    ];

    static STANDARD = [
        this.commander,
        this.companion,
        this.deck,
        this.sideboard,
    ];

    filters: ((card: DeckCard) => boolean)[] = [];

    constructor(
        public name: string,
        public codes: string[],
        public cards: number | [number, number?] = [0],
        public copy_limit: number = null,
        public card_types: string[] = null,
    ) {
        super(name, codes);

        if (this.card_types) {
            this.filters.push(card => this.card_types.some(type => {
                const [card_type, subtype] = type.split(' - ');
                return card.is_card_type(card_type)
                    && (!subtype || card.is_type(subtype));
            }));
        }
    }

    is_default(): boolean {
        return this === Zone.DEFAULT;
    }

    min_cards(): number {
        return (Array.isArray(this.cards)
            ? this.cards[0]
            : this.cards) ?? 0;
    }

    max_cards(): number {
        return (Array.isArray(this.cards)
            ? this.cards[1]
            : this.cards) ?? Infinity;
    }

    regexp(code: string): RegExp {
        return new RegExp(`^(${
            normalise(code)
                .replaceAll(' ', '.?')
                .replaceAll(/s$/g, 's?')
        })({top})?$`, 'i');
    }

    can_include(card: DeckCard): boolean {
        return this.filters.every(filter => filter(card));
    }

    with_filter(filter: (card: DeckCard) => boolean): this {
        this.filters.push(filter);
        return this;
    }

    has_filter(): boolean {
        return this.filters.length > 0;
    }

    static default_for(card: DeckCard): Zone {
        for (const zone of this.all()) {
            if (zone.has_filter() && zone.can_include(card)) {
                return zone;
            }
        }

        return Zone.deck;
    }
}
