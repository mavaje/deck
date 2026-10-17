import {Card, Identifier} from "./scryfall/types";
import {API} from "./scryfall/api";
import {get_language} from "./languages";

export class DeckCard {

    static REGEXP = new RegExp([
        '^',
        '((?<quantity>\\d{1,3})x?\\s)?',
        '(?<name>[^([^#*\\s]+(\\s+[^#*^[\\s]+)*?(\\s*\\(Used\\))?)?',
        '(\\((?<set>[0-9A-Z]{3,5})((:|\\)\\s*)(?<collector_number>[^)[(#*:\\s]+))?\\)?)?',
        '(?<extra>([#*^[]|lang:).*)?',
        '$'
    ].join('\\s*'), 'i');

    raw?: string;

    quantity: number;

    name?: string;
    set?: string;
    collector_number?: string;
    language?: string;
    is_foil: boolean = false;

    is_commander: boolean = false;
    is_companion: boolean = false;

    tags: string[] = [];

    card: Card = null;
    not_found: boolean = false;

    static parse(input: string): DeckCard {
        const match = this.REGEXP.exec(input);
        if (!match) return null;

        const card = new DeckCard();

        card.raw = input;

        const {
            quantity = '1',
            name,
            set,
            collector_number,
            extra,
        } = match.groups;

        if (!name && !(set && collector_number)) return null;

        card.quantity = Number.parseInt(quantity);
        card.name = name;
        card.set = set?.toLowerCase();
        card.collector_number = collector_number?.toLowerCase();

        if (extra) {
            for (const match of extra.matchAll(/\*(?<tag>[A-Z ]+)\*/gi)) {
                const {tag} = match.groups;
                switch (tag.toLowerCase()) {
                    case 'f':
                        card.is_foil = true;
                        break;
                    case 'cmdr':
                        card.is_commander = true;
                        break;
                    case 'cmpn':
                        card.is_companion = true;
                        break;
                    default:
                        const lang = get_language(tag);
                        if (lang) {
                            card.language = lang.codes[0];
                        } else {
                            card.tags.push(tag);
                        }
                }
            }

            for (const match of extra.matchAll(/\[(?<tag>[A-Z ]+)]/gi)) {
                const {tag} = match.groups;
                card.tags.push(tag);
            }

            for (const match of extra.matchAll(/\^(?<tag>[A-Z ]+)(,#[0-9A-F]{6})?\^/gi)) {
                const {tag} = match.groups;
                card.tags.push(tag);
            }

            for (const match of extra.matchAll(/#(?<tag>[A-Z_ ]*[A-Z])/gi)) {
                const {tag} = match.groups;
                card.tags.push(tag);
            }
        }

        return card;
    }

    identifier(): Identifier {
        const {name, set, collector_number} = this;

        if (set && collector_number) {
            return {set, collector_number};
        }

        if (name) {
            return {name, set};
        }

        return null;
    }

    async load(force: boolean = false): Promise<this> {
        const {name, set, collector_number, language} = this;

        if (force) this.card = null;

        if (set && collector_number) {
            if (language) this.card ??= await API.card(set, collector_number, language);
            this.card ??= await API.card(set, collector_number);
        }

        if (name) {
            if (set) this.card ??= await API.card_named(name, set);
            this.card ??= await API.card_named(name);
        }

        if (!this.card) this.not_found = true;

        return this.hydrate();
    }

    hydrate(card = this.card) {
        if (card) {
            this.card = card;
            this.name = card.layout === 'split'
                ? card.name
                : card.name.split(/\s*\/\//)[0];
        }

        return this;
    }
}
