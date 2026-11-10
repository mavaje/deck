import {DeckCard} from "./deck-card";
import {Deck} from "./deck";
import {Format} from "./format";
import {Catalog} from "./scryfall/catalog";
import {words_to_number} from "./text";
import {Board} from "./designation/board";
import {RuleBreak} from "./rule-break";

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
    'deck-restriction-error' |
    'planar-deck-error';

export type DeckError = {
    type: DeckErrorType;
    message: string;
    board?: Board;
    cards?: DeckCard[];
};

export class DeckValidator {

    private rulebreaks: RuleBreak[] = [];

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

        const conspiracies = this.deck.board(Board.conspiracy);

        this.rulebreaks.push(...commanders.skip_empty().flatMap(card => card.rulebreaks()));
        this.rulebreaks.push(...conspiracies.skip_empty().flatMap(card => card.rulebreaks()));

        if (format) {
            const banned_cards = this.deck
                .board(...Board.STANDARD)
                .filter(card => card.legality(format) === 'banned');
            if (banned_cards.count() > 0) {
                errors.push({
                    type: 'illegal-card',
                    message: `These cards are banned in this format`,
                    cards: banned_cards,
                });
            }

            const illegal_cards = this.deck
                .board(...Board.STANDARD)
                .filter(card => card.legality(format) === 'not_legal');
            if (illegal_cards.count() > 0) {
                errors.push({
                    type: 'illegal-card',
                    message: `These cards are not legal in this format`,
                    cards: illegal_cards,
                });
            }

            const card_count = this.deck.board(...Board.STARTING_DECK).count();
            if (card_count < format.min_cards()) {
                let min_cards = format.min_cards();
                this.rulebreaks.forEach(rulebreak => min_cards -= rulebreak.breaks_deck_min());
                if (card_count < min_cards) {
                    errors.push({
                        type: 'too-few-cards',
                        message: `You have ${card_count} cards, you need at least ${min_cards}`,
                        board: Board.deck,
                    });
                }
            } else if (card_count > format.max_cards() && !this.rulebreaks.some(rulebreak => rulebreak.breaks_deck_max())) {
                errors.push({
                    type: 'too-many-cards',
                    message: `You have ${card_count} cards, you can have up to ${format.max_cards()}`,
                    board: Board.deck,
                });
            }

            const sideboard = this.deck.board(Board.sideboard);
            if (sideboard.count() > format.sideboard_limit) {
                errors.push({
                    type: 'too-many-sideboard-cards',
                    message: `You have ${sideboard.count()} cards in your sideboard, you can have up to ${format.sideboard_limit}`,
                    board: Board.sideboard,
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
                            board: Board.commander,
                        });
                    } else if (commander_count > 1) {
                        errors.push({
                            type: 'too-many-commanders',
                            message: `You cannot have more than one commander`,
                            board: Board.commander,
                        });
                    } else if (format.has_signature_spell) {
                        errors.push({
                            type: 'too-few-commanders',
                            message: `You must have an oathbreaker and a signature spell`,
                            board: Board.commander,
                        });
                    }

                    const illegal_commanders = commanders.filter(card => !card.can_command(format));

                    if (illegal_commanders.count() > 0) {
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
                        board: Board.commander,
                    });
                }
            }
        }

        errors.push(...this.deck.board(Board.companion).skip_empty().flatMap(card => this.validate_deck_restrictions(card, format)));
        errors.push(...conspiracies.skip_empty().flatMap(card => this.validate_deck_restrictions(card, format)));

        let color_identity = this.deck.color_identity();

        this.deck
            .board(...Board.STANDARD)
            .map(card => {
            if (color_identity) {
                const additional_break = this.rulebreaks.find(rulebreak => rulebreak.breaks_color_identity(card));
                if (additional_break) {
                    const additional_colors = card.color_identity().difference(color_identity);
                    const additional_color = [...additional_colors][0];
                    if (additional_color) {
                        color_identity = color_identity.plus(additional_color);
                        additional_break.use();
                    }
                }

                if (!color_identity.contains(card.color_identity())
                    && !this.rulebreaks.some(rulebreak => rulebreak.breaks_color_identity(card))
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
            .board(...Board.STANDARD)
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

        Board.all()
            .filter(board => !Board.STANDARD.includes(board))
            .forEach(board => {
            const board_cards = this.deck.board(board);

            if (board_cards.count() === 0) return;

            if (board_cards.count() < board.min_cards()) {
                errors.push({
                    type: 'too-few-cards',
                    message: `You must have at least ${board.min_cards()} cards in a ${board.name.toLowerCase()}`,
                    board,
                });
            } else if (board_cards.count() > board.max_cards()) {
                errors.push({
                    type: 'too-many-cards',
                    message: `You can only have ${board.max_cards()} cards in a ${board.name.toLowerCase()}`,
                    board,
                });
            }

            if (board.copy_limit) {
                const too_many = board_cards
                    .filter_by_count(count => count > board.copy_limit);

                if (too_many.count() > 0) {
                    errors.push({
                        type: 'too-many-copies',
                        message: `You have only ${board.copy_limit} copy of each card in a ${board.name}`,
                        cards: too_many,
                    });
                }
            }

            if (board.card_types) {
                const wrong_type = board_cards
                    .filter(card => !board.can_include(card));

                if (wrong_type.count() > 0) {
                    errors.push({
                        type: 'illegal-card',
                        message: `A ${board.name} can contain only ${board.card_types.join(' or ')} cards`,
                        cards: wrong_type,
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
                cards: phenomena,
            });
        }

        return errors;
    }

    private validate_deck_restrictions(card: DeckCard, format: Format): DeckError[] {
        let deck = this.deck.board(...Board.STARTING_DECK);

        if (card.has_keyword('Companion')) {
            const companion_match = card.oracle().match(/Companion — (?<ability>[^(]+\.)/);
            if (!companion_match) return [];

            const {ability} = companion_match.groups;

            const mana_value_match = ability.match(/Your starting deck contains only (?<description>cards with ((?<parity>even|odd) )?mana values?( (?<mv>\d+) or (?<dir>less|greater))?(?<lands> and land cards)?)\./);
            if (mana_value_match) {
                const {parity, mv, dir, lands, description} = mana_value_match.groups;

                if (parity) {
                    deck = deck.filter(card => card.main_face().mana_value() % 2 !== (parity === 'even' ? 0 : 1));
                }

                if (mv) {
                    if (dir === 'less') {
                        deck = deck.filter(card => card.main_face().mana_value() > parseInt(mv));
                    } else {
                        deck = deck.filter(card => card.main_face().mana_value() < parseInt(mv));
                    }
                }

                if (lands) {
                    deck = deck.filter(card => !card.is_type('Land'));
                }

                return deck.count() > 0
                    ? [{
                        type: 'deck-restriction-error',
                        message: `Only ${description} are allowed in a deck with this companion`,
                        cards: deck,
                    }]
                    : [];
            }

            const unique_mana_symbol_match = ability.match(/No card in your starting deck has more than one of the same mana symbol in its mana cost\./);
            if (unique_mana_symbol_match) {
                deck = deck.filter(card => card.card.mana_cost.match(/(\{[^}]+}).*\1/));

                return deck.count() > 0
                    ? [{
                        type: 'deck-restriction-error',
                        message: `Each card must has unique symbols in its mana cost with this companion`,
                        cards: deck,
                    }]
                    : [];
            }

            if (format) {
                const deck_size_match = ability.match(/Your starting deck contains at least (?<count>\w+|\d+) cards? more than the minimum deck size\./);
                if (deck_size_match) {
                    const {count: count_string} = deck_size_match.groups;
                    let count = words_to_number(count_string) ?? Number.parseInt(count_string);

                    this.rulebreaks.forEach(rulebreak => count -= rulebreak.breaks_deck_min());

                    return deck.count() < format.min_cards() + count
                        ? [{
                            type: 'deck-restriction-error',
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
                            type: 'deck-restriction-error',
                            message: `${each_card} must be a ${joined_types} card with this companion`,
                            cards: deck,
                        }]
                        : [];
                }

                const mv_match = quality.match(/has mana value (?<mv>\d+) or (?<dir>less|greater)/);
                if (mv_match) {
                    const {mv, dir} = mv_match.groups;

                    if (mv) {
                        if (dir === 'less') {
                            deck = deck.filter(card => card.main_face().mana_value() > parseInt(mv));
                        } else {
                            deck = deck.filter(card => card.main_face().mana_value() < parseInt(mv));
                        }
                    }

                    return deck.count() > 0
                        ? [{
                            type: 'deck-restriction-error',
                            message: `${each_card} must have mana value ${mv} or ${dir}`,
                            cards: deck,
                        }]
                        : [];
                }

                const unique_match = quality.match(/has a different name/);
                if (unique_match) {
                    deck = deck.filter_by_count(count => count > 1);
                    return deck.count() > 0
                        ? [{
                            type: 'deck-restriction-error',
                            message: `${each_card} must have a different name`,
                            cards: deck,
                        }]
                        : [];
                }

                const shared_type_match = quality.match(/shares a card type/);
                if (shared_type_match) {
                    let types: Set<string> = new Set(Catalog.card_types.all());

                    deck = deck.filter(card => {
                        const card_types = new Set(card.card_types());
                        const intersection = types.intersection(card_types)
                        if (intersection.size > 0) {
                            types = intersection;
                            return false;
                        } else {
                            return true;
                        }
                    });

                    return deck.count() > 0
                        ? [{
                            type: 'deck-restriction-error',
                            message: `${each_card} must share a card type`,
                            cards: deck,
                        }]
                        : [];
                }

                const activated_ability_match = quality.match(/has an activated ability/);
                if (activated_ability_match) {
                    deck = deck.filter(card => !card.has_activate_ability());

                    return deck.count() > 0
                        ? [{
                            type: 'deck-restriction-error',
                            message: `${each_card} must have an activated ability`,
                            cards: deck,
                        }]
                        : [];
                }
            }
        } else if (card.is_type('Conspiracy')) {
            const types_match = card.oracle().match(/Your starting deck can't have (?<types>\w+( \w+)*) cards(.$| and)/);
            if (types_match) {
                const joined_types = types_match.groups.types;
                const types = joined_types.split(/ /g);

                deck = deck.filter(card => card.is_type(...types));

                return deck.count() > 0
                    ? [{
                        type: 'deck-restriction-error',
                        message: `You can't have any ${joined_types} in your deck`,
                        cards: deck,
                    }]
                    : [];
            }
        }

        return [];
    }
}
