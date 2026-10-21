import {DeckCard} from "./deck-card";
import {Deck} from "./deck";
import {Format} from "./format";
import {BoardName, BOARDS} from "./board";

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

export function validate(deck: Deck, format: Format = deck.format): DeckError[] {
    const errors: DeckError[] = [];

    if (format) {
        const commanders = deck.cards_on_board('Commander');
        const commander_count = deck.count('Commander');

        const rulebreaks = commanders.flatMap(commander => commander.rulebreaks());

        const card_count = deck.count('Commander', 'Deck');
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

        const sideboard_count = deck.count('Sideboard');
        if (sideboard_count > format.sideboard_limit) {
            errors.push({
                type: 'too-many-sideboard-cards',
                message: `You have ${sideboard_count} cards in your sideboard, you can have up to ${format.sideboard_limit}`,
                cards: deck.cards_on_board('Sideboard'),
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

        const color_identity = deck.color_identity();

        const copy_counts: Record<string, number> = {};
        deck.cards.forEach(card => {
            if (card.on_board('Planar Deck')) return;

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

            if (!card.on_board('Commander', 'Companion', 'Deck', 'Sideboard')) return;

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
        });

        BOARDS.forEach(board => {
            if (board.min_count) {
                const board_cards = deck.cards_on_board(board.name);
                const board_count = Deck.card_count(board_cards);
                if (board_count > 0) {
                    if (board_count < board.min_count) {
                        const plural = board.name === 'Stickers'
                            ? 'sticker sheets'
                            : `cards in a ${board.name.toLowerCase()}`;
                        errors.push({
                            type: 'too-few-cards',
                            message: `You must have at least ${board.min_count} ${plural}`,
                            cards: board_cards,
                        });
                    }

                    const copy_counts: Record<string, number> = {};
                    board_cards.forEach(card => {
                        copy_counts[card.name] ??= 0;
                        const count = copy_counts[card.name] += card.quantity;
                        if (count > 1) {
                            const singular = board.name === 'Stickers'
                                ? 'sticker sheet'
                                : `card in a ${board.name.toLowerCase()}`;
                            errors.push({
                                type: 'too-many-copies',
                                message: `You can have only 1 copy of each ${singular}`,
                                cards: [card],
                            });
                        }
                    });
                }
            }
        });

        const phenomena = deck.cards_on_board('Planar Deck')
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
