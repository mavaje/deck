import {DeckCard, JSONCard} from "./deck-card";
import {Format} from "./format";
import {API} from "./scryfall/api";
import {ColorSet} from "./color-set";
import {Zone} from "./designation/zone";
import {CardList} from "./card-list";
import {Tag} from "./designation/tag";
import {DeckView} from "./ui/deck-view";
import {History} from "./history/history";
import {Game} from "./game";
import {CardPanel} from "./ui/deck/card-panel";
import {DeckPanel} from "./ui/deck/deck-panel";
import {Storage} from "./storage";

export type JSONDeck = {
    title: string;
    format: string;
    game: string;
    tags: {
        name: string;
        hex?: string;
    }[];
    cards: JSONCard[];
}

export class Deck extends CardList {

    static CURRENT: Deck = new Deck();

    raw?: string;

    title?: string;

    format: Format = null;
    game: Game = null;

    static parse(
        input: string,
        title?: string,
        exclude_zones: Zone[] = [],
    ) {
        const deck = new Deck();
        deck.title = title;
        deck.raw = input;

        let group_zone: Zone = Zone.DEFAULT;
        let group_tag: Tag = null;

        input.split('\n').forEach(line => {
            if (/^\s*$/.test(line)) {
                group_zone = Zone.DEFAULT;
                group_tag = null;
                return;
            }

            // if (/^about$/i.test(group_tag.name)) return;

            const header_match = line.match(/^\s*(?<tag>\/\/|#)?\s*(?<header>\w.*?):?(\s*\(\d+\):?)?\s*$/i);
            if (header_match) {
                const {tag, header} = header_match.groups;

                const zone = Zone.match(header, !tag);
                if (zone && !exclude_zones.includes(zone)) {
                    group_zone = zone;
                    return;
                }

                if (tag || /^about$/i.test(header)) {
                    group_tag = Tag.match_or_new(header);
                    return;
                }
            }

            const card = DeckCard.parse(line, deck, group_zone, exclude_zones);
            if (card) {
                if (group_tag) {
                    card.tags.add(group_tag);
                }
            } else {
                console.error(`Failed to parse line "${line}"`);
            }
        });

        return deck;
    }

    static async load_current(input: string, title?: string): Promise<Deck> {
        CardPanel.close();
        History.reset();

        DeckPanel.update();

        let invalid_zones: Zone[] = [];

        do {
            Tag.clear();
            Deck.CURRENT = Deck.parse(input, title, invalid_zones);
            DeckView.render();
            await Deck.CURRENT.load(() => DeckView.render());

            invalid_zones = Zone.all()
                .filter(zone => {
                    if (!zone.has_filter()) return false;
                    const cards = Deck.CURRENT.zone(zone);
                    return cards.length > 0
                        && cards.every(card => !zone.can_include(card));
                });
        } while (invalid_zones.length > 0);

        Storage.store_deck();

        return Deck.CURRENT;
    }

    static async load_from_json(deck: JSONDeck): Promise<Deck> {
        Deck.CURRENT = new Deck();
        Deck.CURRENT.title = deck.title || null;
        Deck.CURRENT.format = Format.match(deck.format) ?? null;
        Deck.CURRENT.game = Game.match(deck.game) ?? null;
        deck.tags.forEach(tag => Tag.match_or_new(tag.name, tag.hex));
        Deck.CURRENT.push(...deck.cards.map((card, id) => DeckCard.from_json(card, id)));

        DeckPanel.update();

        await Deck.CURRENT.load(() => DeckView.render());

        return Deck.CURRENT;
    }

    async load(on_progress: () => void = null): Promise<this> {
        this.forEach(card => card.load_from_cache(this.game));
        on_progress?.();

        const card_map: Record<string, DeckCard[]> = {};

        this.forEach(card => {
            if (card.can_bulk_load()) {
                const id = JSON.stringify(card.identifier());
                card_map[id] ??= [];
                card_map[id].push(card);
            }
        });

        const unique_cards = Object.values(card_map);

        for (let i = 0; i < unique_cards.length; i += API.CARDS_MAX) {
            const chunk = unique_cards.slice(i, i + API.CARDS_MAX);

            if (chunk.length < 2) break;

            const card_list = await API.cards(chunk.map(c => c[0].identifier()));
            if (!card_list) break;

            let index = 0;
            for (const cards of chunk) {
                const i1 = cards[0].identifier();
                if (!card_list.not_found.some(i2 =>
                    Object.keys(i1).length === Object.keys(i2).length &&
                    Object.keys(i1).every(key => i1[key] === i2[key])
                )) {
                    cards.forEach(card => card.hydrate(card_list.data[index]).cache());
                    index++;
                }
            }

            on_progress?.();
        }

        await Promise.all(this.map(async card => {
            await card.load(this.game);
            on_progress?.();
        }));

        return this;
    }

    render_hooks() {
        DeckView.render();

    }

    zone(zone: Zone): CardList;
    zone(...zones: Zone[]): CardList;
    zone(...zones: Zone[]): CardList {
        return this.filter(card => card.in_zone(...zones));
    }

    color_identity(): ColorSet {
        const commanders = this.zone(Zone.commander).skip_empty();

        if (commanders.count() === 0) return null;

        let color_identity = ColorSet.colors.c;
        commanders.forEach(card => color_identity = color_identity.plus(card.color_identity()));

        return color_identity;
    }

    to_string(card_format?: string): string {
        return Zone.all()
            .filter(zone => this.zone(zone).length > 0)
            .map(zone => `# ${zone.name}\n`
                + this.zone(zone).map(card => card.to_string(card_format) + ` (${card.display_face_id}:${card.display_printed})`).join('\n') + '\n')
            .join('\n');
    }

    toString(): string {
        return this.to_string();
    }

    json(): JSONDeck {
        return {
            title: this.title || null,
            format: this.format?.code() ?? null,
            game: this.game?.code() ?? null,
            tags: Tag.all().map(tag => ({
                name: tag.name,
                hex: tag.hex,
            })),
            cards: this.map(card => card.json()),
        };
    }
}
