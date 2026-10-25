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

        const commanders = this.deck.board(Board.commander);
        const commander_count = commanders.count();

        const rulebreaks = commanders.cards.flatMap(commander => commander.rulebreaks());

        if (format) {
            const card_count = this.deck.board(...Board.COMPRISES_DECK).count();
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

            const sideboard = this.deck.board(Board.sideboard);
            if (sideboard.count() > format.sideboard_limit) {
                errors.push({
                    type: 'too-many-sideboard-cards',
                    message: `You have ${sideboard.count()} cards in your sideboard, you can have up to ${format.sideboard_limit}`,
                    cards: sideboard.cards,
                });
            }

            if (format.has_command_zone()) {
                const [
                    commander_1,
                    commander_2,
                ] = commanders.flat();

                const has_legal_pair = commander_count === 2
                    && (commander_1.allows_second_commander(commander_2, format)
                        || commander_2.allows_second_commander(commander_1, format));

                if (!has_legal_pair) {
                    if (commander_count < 1) {
                        errors.push({
                            type: 'too-few-commanders',
                            message: `You must have a commander in this format`,
                            cards: commanders.cards,
                        });
                    } else if (commander_count > 1) {
                        errors.push({
                            type: 'too-many-commanders',
                            message: `You cannot have more than one commander`,
                            cards: commanders.cards,
                        });
                    } else if (format.has_signature_spell) {
                        errors.push({
                            type: 'too-few-commanders',
                            message: `You must have a signature spell`,
                            cards: commanders.cards,
                        });
                    }

                    const illegal_commanders = commanders.filter(card => !card.can_command(format));

                    if (illegal_commanders.count() > 0) {
                        errors.push({
                            type: 'illegal-commander',
                            message: `These cards cannot be commanders in this format`,
                            cards: illegal_commanders.cards,
                        });
                    }
                }
            } else {
                if (commander_count > 0) {
                    errors.push({
                        type: 'too-many-commanders',
                        message: `You cannot have commanders in this format`,
                        cards: commanders.cards,
                    });
                }
            }
        }

        this.deck.board(Board.companion).skip_empty().each(card => {
            errors.push(...this.companion_errors(card, format));
        });

        const color_identity = this.deck.color_identity();

        this.deck.each(card => {
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
        });

        this.deck
            .board(...Board.LIMITED_COPIES)
            .by_count((count, card) => {
                const max = card.copy_limit(format);
                if (count > max) {
                    errors.push({
                        type: 'too-many-copies',
                        message: `You have ${count} of this card, you can only have ${max}`,
                        cards: [card],
                    });
                }
            });

        Board.all().forEach(board => {
            if (!board.non_standard) return;

            const board_cards = this.deck.board(board);

            if (board_cards.count() === 0) return;

            if (board_cards.count() < board.min_cards) {
                errors.push({
                    type: 'too-few-cards',
                    message: `You must have at least ${board.min_cards} card in a ${board.name.toLowerCase()}`,
                    cards: board_cards.cards,
                });
            }

            if (board.copy_limit) {
                const too_many = board_cards
                    .filter_by_count(count => count > board.copy_limit);

                if (too_many.count() > 0) {
                    errors.push({
                        type: 'too-many-copies',
                        message: `You have only ${board.copy_limit} copy of each card in a ${board.name}`,
                        cards: too_many.cards,
                    });
                }
            }

            if (board.card_types) {
                const wrong_type = board_cards
                    .filter(card => board.card_types.every(type => !card.is_type(type)));

                if (wrong_type.count() > 0) {
                    errors.push({
                        type: 'illegal-card',
                        message: `A ${board.name} can contain only ${board.card_types.join(' or ')} cards`,
                        cards: wrong_type.cards,
                    });
                }
            }
        });

        const phenomena = this.deck.board(Board.planar)
            .filter(card => card.is_type('Phenomenon'));
        if (phenomena.count() > 2) {
            errors.push({
                type: 'planar-deck-error',
                message: `You can have up to 2 phenomenon cards in a planar deck`,
                cards: phenomena.cards,
            });
        }

        return errors;
    }

    private companion_errors(card: DeckCard, format: Format): DeckError[] {
        if (!card.has_keyword('Companion')) return [];

        const companion_match = card.front_oracle().match(/Companion — (?<ability>[^(]+\.)/);
        if (!companion_match) return [];

        const {ability} = companion_match.groups;

        let deck = this.deck.board(...Board.COMPRISES_DECK);

        const mana_value_match = ability.match(/Your starting deck contains only (?<description>cards with ((?<parity>even|odd) )?mana values?( (?<mv>\d+) or (?<dir>less|greater))?(?<lands> and land cards)?)\./);
        if (mana_value_match) {
            const {parity, mv, dir, lands, description} = mana_value_match.groups;

            if (parity) {
                deck = deck.filter(card => card.front_card()?.cmc % 2 !== (parity === 'even' ? 0 : 1));
            }

            if (mv) {
                if (dir === 'less') {
                    deck = deck.filter(card => card.front_card()?.cmc > parseInt(mv));
                } else {
                    deck = deck.filter(card => card.front_card()?.cmc < parseInt(mv));
                }
            }

            if (lands) {
                deck = deck.filter(card => !card.is_type('Land'));
            }

            return deck.count() > 0
                ? [{
                    type: 'companion-restriction-error',
                    message: `Only ${description} are allowed in a deck with this companion`,
                    cards: deck.cards,
                }]
                : [];
        }

        const unique_mana_symbol_match = ability.match(/No card in your starting deck has more than one of the same mana symbol in its mana cost\./);
        if (unique_mana_symbol_match) {
            deck = deck.filter(card => card.card.mana_cost.match(/(\{[^}]+}).*\1/));

            return deck.count() > 0
                ? [{
                    type: 'companion-restriction-error',
                    message: `Each card must has unique symbols in its mana cost with this companion`,
                    cards: deck.cards,
                }]
                : [];
        }

        if (format) {
            const deck_size_match = ability.match(/Your starting deck contains at least (?<count>\w+|\d+) cards? more than the minimum deck size\./);
            if (deck_size_match) {
                const {count: count_string} = deck_size_match.groups;
                const count = words_to_number(count_string) ?? Number.parseInt(count_string);

                return deck.count() < format.min_cards() + count
                    ? [{
                        type: 'companion-restriction-error',
                        message: `You must have ${count} more cards in a deck with this companion`,
                    }]
                    : [];
            }
        }

        const each_card_match = ability.match(/Each ((?<type>\w+) )?card in your starting deck (?<quality>[^.]+)\./);
        if (each_card_match) {
            const {type, quality} = each_card_match.groups;

            const each_card = `Each ${type ? `${type} ` : ''}card`;

            if (type === 'permanent') {
                deck = deck.filter(card => card.is_permanent());
            } else {
                const non_match = type.match(/non(?<type>\w+)/);
                if (non_match) {
                    deck = deck.filter(card => !card.is_type(non_match.groups.type));
                } else {
                    deck = deck.filter(card => card.is_type(type));
                }
            }

            const types_match = quality.match(/is a (?<types>\w+(, (or )?\w+)*) card/);
            if (types_match) {
                const joined_types = types_match.groups.types;
                const types = joined_types.split(/, or |, /g);
                deck = deck.filter(card => !card.is_any_type(types));

                return deck.count() > 0
                    ? [{
                        type: 'companion-restriction-error',
                        message: `${each_card} must be a ${joined_types} card with this companion`,
                        cards: deck.cards,
                    }]
                    : [];
            }

            const mv_match = quality.match(/has mana value (?<mv>\d+) or (?<dir>less|greater)/);
            if (mv_match) {
                const {mv, dir} = mv_match.groups;

                if (mv) {
                    if (dir === 'less') {
                        deck = deck.filter(card => card.front_card()?.cmc > parseInt(mv));
                    } else {
                        deck = deck.filter(card => card.front_card()?.cmc < parseInt(mv));
                    }
                }

                return deck.count() > 0
                    ? [{
                        type: 'companion-restriction-error',
                        message: `${each_card} must have mana value ${mv} or ${dir}`,
                        cards: deck.cards,
                    }]
                    : [];
            }

            const unique_match = quality.match(/has a different name/);
            if (unique_match) {
                deck = deck.filter_by_count(count => count > 1);
                return deck.count() > 0
                    ? [{
                        type: 'companion-restriction-error',
                        message: `${each_card} must have a different name`,
                        cards: deck.cards,
                    }]
                    : [];
            }

            const shared_type_match = quality.match(/shares a card type/);
            if (shared_type_match) {
                let types: string[] = Catalog.card_types.all();

                deck = deck.filter(card => {
                    if (card.card_types().some(type => types.includes(type))) {
                        types = types.filter(type => card.card_types().includes(type));
                        return false;
                    } else {
                        return true;
                    }
                });

                return deck.count() > 0
                    ? [{
                        type: 'companion-restriction-error',
                        message: `${each_card} must share a card type`,
                        cards: deck.cards,
                    }]
                    : [];
            }

            const activated_ability_match = quality.match(/has an activated ability/);
            if (activated_ability_match) {
                deck = deck.filter(card => !card.has_activate_ability());

                return deck.count() > 0
                    ? [{
                        type: 'companion-restriction-error',
                        message: `${each_card} must have an activated ability`,
                        cards: deck.cards,
                    }]
                    : [];
            }

            return [];
        }

        return [];
    }
}
