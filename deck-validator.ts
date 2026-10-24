import {DeckCard} from "./deck-card";
import {Deck} from "./deck";
import {Format} from "./format";
import {Catalog} from "./scryfall/catalog";
import {words_to_number} from "./text";
import {Board} from "./designation/board";

export type DeckErrorType =
    'too-few-cards' |
    'too-many-cards' |
    'too-few-commanders' |
    'too-many-commanders' |
    'too-many-sideboard-cards' |
    'too-many-copies' |
    'illegal-card'|
    'illegal-commander' |
    'illegal-companion' |
    'color-identity-error' |
    'companion-restriction-error' |
    'planar-deck-error';

export type DeckError = {
    type: DeckErrorType;
    message: string;
    cards?: DeckCard[];
};

export class DeckValidator {

    constructor(
        private deck: Deck,
        private format: Format = deck.format
    ) {}

    public is_valid(format: Format = this.format): boolean {
        return this.validate(format).length === 0;
    }

    public validate(format: Format = this.format): DeckError[] {
        const errors: DeckError[] = [];

        if (format) {
            const commanders = this.deck.cards_on_board(Board.commander);
            const commander_count = this.deck.count(Board.commander);

            const rulebreaks = commanders.flatMap(commander => commander.rulebreaks());

            const card_count = this.deck.count(...Board.COMPRISES_DECK);
            if (card_count < format.min_cards()) {
                errors.push({
                    type: 'too-few-cards',
                    message: `You have ${card_count} cards, you need at least ${format.min_cards()}`,
                });
            } else if (card_count > format.max_cards() && !rulebreaks.some(rulebreak => rulebreak.breaks_deck_limit())) {
                errors.push({
                    type: 'too-many-cards',
                    message: `You have ${card_count} cards, you can have up to ${format.max_cards()}`,
                });
            }

            const sideboard_count = this.deck.count(Board.sideboard);
            if (sideboard_count > format.sideboard_limit) {
                errors.push({
                    type: 'too-many-sideboard-cards',
                    message: `You have ${sideboard_count} cards in your sideboard, you can have up to ${format.sideboard_limit}`,
                    cards: this.deck.cards_on_board(Board.sideboard),
                });
            }

            if (format.has_command_zone()) {
                const commander_1 = commanders[0];
                const commander_2 = commanders.slice(-1)[0];

                const has_legal_pair = commander_count === 2
                    && (commander_1.allows_second_commander(commander_2, format)
                        || commander_2.allows_second_commander(commander_1, format));

                if (!has_legal_pair) {
                    if (commander_count < 1) {
                        errors.push({
                            type: 'too-few-commanders',
                            message: `You must have a commander in this format`,
                            cards: commanders,
                        });
                    } else if (commander_count > 1) {
                        errors.push({
                            type: 'too-many-commanders',
                            message: `You can only have one commander in this format`,
                            cards: commanders,
                        });
                    } else if (format.has_signature_spell) {
                        errors.push({
                            type: 'too-few-commanders',
                            message: `You must have a signature spell in this format`,
                            cards: commanders,
                        });
                    }

                    const illegal_commanders = commanders.filter(card => !card.can_command(format));

                    if (illegal_commanders.length > 0) {
                        errors.push({
                            type: 'illegal-commander',
                            message: `These cards cannot be commanders in this format`,
                            cards: illegal_commanders,
                        });
                    }
                }
            } else {
                if (commander_count > 0) {
                    errors.push({
                        type: 'too-many-commanders',
                        message: `You cannot have commanders in this format`,
                        cards: commanders,
                    });
                }
            }

            this.deck.cards_on_board(Board.companion).forEach(card => {
                errors.push(...this.companion_errors(card));
            });

            const color_identity = this.deck.color_identity();

            const copy_counts: Record<string, number> = {};
            this.deck.cards.forEach(card => {
                if (card.board.non_standard) return;

                if (!card.is_legal(format)) {
                    errors.push({
                        type: 'illegal-card',
                        message: `This card is ${card.legality(format).replace('_', ' ')} in this format`,
                        cards: [card],
                    });
                    return;
                }

                if (color_identity) {
                    const additional_break = rulebreaks.find(rulebreak => rulebreak.breaks_color_identity(card));
                    if (additional_break) {
                        const additional_color = card.color_identity().colors.find(color => !color_identity.includes(color));
                        if (additional_color) {
                            color_identity.add(additional_color);
                            additional_break.use();
                        }
                    }

                    if (!color_identity.contains(card.color_identity())
                        && !rulebreaks.some(rulebreak => rulebreak.breaks_color_identity(card))
                    ) {
                        errors.push({
                            type: 'color-identity-error',
                            message: `This card is not within your commander color identity`,
                            cards: [card],
                        });
                    }
                }

                if (card.on_board(...Board.LIMITED_COPIES)) {
                    copy_counts[card.name] ??= 0;
                    copy_counts[card.name] += card.quantity;

                    const count = copy_counts[card.name];
                    const max = card.copy_limit(format);

                    if (count > max) {
                        errors.push({
                            type: 'too-many-copies',
                            message: `You have ${count} of this card, you can only have ${max}`,
                            cards: [card],
                        });
                    }
                }
            });

            Board.all().forEach(board => {
                if (!board.non_standard) return;

                const board_cards = this.deck.cards_on_board(board);
                const board_count = Deck.card_count(board_cards);

                if (board_count === 0) return;

                if (board_count < board.min_cards) {
                    errors.push({
                        type: 'too-few-cards',
                        message: `You must have at least ${board.min_cards} card in a ${board.name.toLowerCase()}`,
                        cards: board_cards,
                    });
                }

                if (board.copy_limit) {
                    const copy_counts = Deck.copy_counts(board_cards);
                    const cards = board_cards
                        .filter(card => copy_counts[card.name] > board.copy_limit);

                    if (cards.length > 0) {
                        errors.push({
                            type: 'too-many-copies',
                            message: `You have only ${board.copy_limit} copy of each card in a ${board.name}`,
                            cards,
                        });
                    }
                }

                if (board.card_types) {
                    const cards = board_cards
                        .filter(card => board.card_types.every(type => !card.is_type(type)));

                    if (cards.length > 0) {
                        errors.push({
                            type: 'illegal-card',
                            message: `A ${board.name} can contain only ${board.card_types.join(' or ')} cards`,
                            cards,
                        });
                    }
                }
            });

            const phenomena = this.deck.cards_on_board(Board.planar)
                .filter(card => card.is_type('Phenomenon'));
            if (Deck.card_count(phenomena) > 2) {
                errors.push({
                    type: 'planar-deck-error',
                    message: `You can have up to 2 phenomenon cards in a planar deck`,
                    cards: phenomena,
                });
            }
        }

        return errors;
    }

    private companion_errors(card: DeckCard): DeckError[] {
        if (!card.has_keyword('Companion')) return [];

        const companion_match = card.plain_oracle().match(/Companion — (?<ability>[^(]+\.)/);
        if (!companion_match) return [];

        const {ability} = companion_match.groups;

        let cards: DeckCard[] = this.deck.cards_on_board(...Board.COMPRISES_DECK);

        const mana_value_match = ability.match(/Your starting deck contains only (?<description>cards with ((?<parity>even|odd) )?mana values?( (?<mv>\d+) or (?<dir>less|greater))?(?<lands> and land cards)?)\./);
        if (mana_value_match) {
            const {parity, mv, dir, lands, description} = mana_value_match.groups;

            if (parity) {
                cards = cards.filter(card => card.front_card()?.cmc % 2 !== (parity === 'even' ? 0 : 1));
            }

            if (mv) {
                if (dir === 'less') {
                    cards = cards.filter(card => card.front_card()?.cmc > parseInt(mv));
                } else {
                    cards = cards.filter(card => card.front_card()?.cmc < parseInt(mv));
                }
            }

            if (lands) {
                cards = cards.filter(card => !card.is_type('Land'));
            }

            return cards.length > 0
                ? [{
                    type: 'companion-restriction-error',
                    message: `Only ${description} are allowed in a deck with this companion`,
                    cards,
                }]
                : [];
        }

        const unique_mana_symbol_match = ability.match(/No card in your starting deck has more than one of the same mana symbol in its mana cost\./);
        if (unique_mana_symbol_match) {
            cards = cards.filter(card => card.card.mana_cost.match(/(\{[^}]+}).*\1/));

            return cards.length > 0
                ? [{
                    type: 'companion-restriction-error',
                    message: `Each card must has unique symbols in its mana cost with this companion`,
                    cards,
                }]
                : [];
        }

        const deck_size_match = ability.match(/Your starting deck contains at least (?<count>\w+|\d+) cards? more than the minimum deck size\./);
        if (deck_size_match) {
            const {count: count_string} = deck_size_match.groups;
            const count = words_to_number(count_string) ?? Number.parseInt(count_string);

            return Deck.card_count(cards) < this.format.min_cards() + count
                ? [{
                    type: 'companion-restriction-error',
                    message: `You must have ${count} more cards in a deck with this companion`,
                }]
                : [];
        }

        const each_card_match = ability.match(/Each ((?<type>\w+) )?card in your starting deck (?<quality>[^.]+)\./);
        if (each_card_match) {
            const {type, quality} = each_card_match.groups;

            const each_card = `Each ${type ? `${type} ` : ''}card`;

            if (type === 'permanent') {
                cards = cards.filter(card => card.is_permanent());
            } else {
                const non_match = type.match(/non(?<type>\w+)/);
                if (non_match) {
                    cards = cards.filter(card => !card.is_type(non_match.groups.type));
                } else {
                    cards = cards.filter(card => card.is_type(type));
                }
            }

            const types_match = quality.match(/is a (?<types>\w+(, (or )?\w+)*) card/);
            if (types_match) {
                const joined_types = types_match.groups.types;
                const types = joined_types.split(/, or |, /g);
                cards = cards.filter(card => !card.is_any_type(types));

                return cards.length > 0
                    ? [{
                        type: 'companion-restriction-error',
                        message: `${each_card} must be a ${joined_types} card with this companion`,
                        cards,
                    }]
                    : [];
            }

            const mv_match = quality.match(/has mana value (?<mv>\d+) or (?<dir>less|greater)/);
            if (mv_match) {
                const {mv, dir} = mv_match.groups;

                if (mv) {
                    if (dir === 'less') {
                        cards = cards.filter(card => card.front_card()?.cmc > parseInt(mv));
                    } else {
                        cards = cards.filter(card => card.front_card()?.cmc < parseInt(mv));
                    }
                }

                return cards.length > 0
                    ? [{
                        type: 'companion-restriction-error',
                        message: `${each_card} must have mana value ${mv} or ${dir}`,
                        cards,
                    }]
                    : [];
            }

            const unique_match = quality.match(/has a different name/);
            if (unique_match) {
                const copy_counts = Deck.copy_counts(cards);

                cards = cards.filter(card => copy_counts[card.name] > 1);

                return cards.length > 0
                    ? [{
                        type: 'companion-restriction-error',
                        message: `${each_card} must have a different name`,
                        cards,
                    }]
                    : [];
            }

            const shared_type_match = quality.match(/shares a card type/);
            if (shared_type_match) {
                let types: string[] = Catalog.card_types.all();

                cards = cards.filter(card => {
                    if (card.card_types().some(type => types.includes(type))) {
                        types = types.filter(type => card.card_types().includes(type));
                        return false;
                    } else {
                        return true;
                    }
                });

                return cards.length > 0
                    ? [{
                        type: 'companion-restriction-error',
                        message: `${each_card} must share a card type`,
                        cards,
                    }]
                    : [];
            }

            const activated_ability_match = quality.match(/has an activated ability/);
            if (activated_ability_match) {
                cards = cards.filter(card => !card.plain_oracle().match(/(^|\n)[^"]+:/));

                cards = cards.filter(card => !card.is_any_type([
                    'Plains',
                    'Island',
                    'Swamp',
                    'Mountain',
                    'Forest',
                ]));

                cards = cards.filter(card => !card.card?.keywords.some(kw => Catalog.keyword_abilities.lookup(kw) === 'activated'));

                return cards.length > 0
                    ? [{
                        type: 'companion-restriction-error',
                        message: `${each_card} must have an activated ability`,
                        cards,
                    }]
                    : [];
            }

            return [];
        }

        return [];
    }
}
