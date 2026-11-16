import {DeckCard} from "../deck-card";
import {Card} from "../scryfall/types";

export interface Action {
    name?: string;
    reverse(): Action;
}

const HISTORY: Action[] = [];
const FUTURE: Action[] = [];

function undo(): void {
    const action = HISTORY.pop();
    if (action) FUTURE.push(action.reverse());
    console.log(HISTORY.map(({name}) => name));
}

function redo(): void {
    const action = FUTURE.pop();
    if (action) HISTORY.push(action.reverse());
    console.log(HISTORY.map(({name}) => name));
}

function log_action(action: Action): void {
    HISTORY.push(action);
    FUTURE.splice(0, FUTURE.length);
    console.log(HISTORY.map(({name}) => name));
}

function edit_card_field_action<
    K extends keyof DeckCard
>(
    card: DeckCard,
    field: K,
    new_value: DeckCard[K],
): Action {
    const old_value: DeckCard[K] = card[field];
    card[field] = new_value;
    if (([
        'name',
        'set',
        'collector_number',
        'language',
    ] as (keyof DeckCard)[]).includes(field)) {
        card.reload();
    }
    card.render_hooks();
    return {
        name: `Set card.${field} to ${new_value}`,
        reverse: () => edit_card_field_action(card, field, old_value),
    };
}

export function edit_card_field<
    K extends keyof DeckCard
>(
    card: DeckCard,
    field: K,
    value: DeckCard[K],
): void {
    if (card[field] === value) return;
    log_action(edit_card_field_action(card, field, value));
}

export function set_card_printing_action(
    card: DeckCard,
    printing: Card,
): Action {
    const {name, set, collector_number, language, card: sf_card} = card;
    card.hydrate_printing(printing);
    return {
        name: `Set card printing to ${printing.set.toUpperCase()}:${printing.collector_number}`,
        reverse: () => {
            // const printing = card.card;
            Object.assign(card, {name, set, collector_number, language});
            card.hydrate(sf_card);
            return {
                name: 'Reverted card printing',
                reverse: () => set_card_printing_action(card, printing),
            };
        },
    };
}

export function set_card_printing(
    card: DeckCard,
    printing: Card,
): void {
    if (card.card?.id === printing.id) return;
    log_action(set_card_printing_action(card, printing));
}

window.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.target instanceof HTMLInputElement) return
    if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
            case 'y':
                if (event.shiftKey) {
                    undo();
                } else {
                    redo();
                }
                event.preventDefault();
                break;
            case 'z':
                if (event.shiftKey) {
                    redo();
                } else {
                    undo();
                }
                event.preventDefault();
                break;
        }
    }
});
