import {DeckCard} from "../deck-card";
import {Card} from "../scryfall/types";
import {Language} from "../designation/language";

export interface Action {
    name?: string;
    reverse(): Action;
}

const HISTORY: Action[] = [];
const FUTURE: Action[] = [];

function undo(): void {
    const action = HISTORY.pop();
    if (action) FUTURE.push(action.reverse());
    // console.log(HISTORY.map(({name}) => name));
}

function redo(): void {
    const action = FUTURE.pop();
    if (action) HISTORY.push(action.reverse());
    // console.log(HISTORY.map(({name}) => name));
}

function log_action(action: Action): void {
    HISTORY.push(action);
    FUTURE.splice(0, FUTURE.length);
    // console.log(HISTORY.map(({name}) => name));
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
        name: `Set card ${field} to ${new_value}`,
        reverse: () => edit_card_field_action(card, field, old_value),
    };
}

function edit_card_name_action(
    card: DeckCard,
    new_name: string,
): Action {
    const {name, set, collector_number, language} = card;
    card.name = new_name;
    card.set = null;
    card.collector_number = null;
    card.language = Language.DEFAULT;
    card.reload();
    card.render_hooks();
    return {
        name: `Set card name to ${new_name}`,
        reverse: () => {
            Object.assign(card, {name, set, collector_number, language});
            card.reload();
            card.render_hooks();
            return {
                name: `Revert card name`,
                reverse: () => edit_card_name_action(card, new_name),
            };
        },
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
    log_action(field === 'name'
        ? edit_card_name_action(card, value as string)
        : edit_card_field_action(card, field, value));
}

export function set_card_printing_action(
    card: DeckCard,
    printing: Card,
): Action {
    const {name, set, collector_number, language, finish, card: sf_card} = card;
    card.hydrate_printing(printing);
    return {
        name: `Set card printing to ${printing.set.toUpperCase()}:${printing.collector_number}`,
        reverse: () => {
            Object.assign(card, {name, set, collector_number, language, finish});
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
    if (printing.id === card.card?.id
        && printing.name === card.card_name()
        && printing.set === card.set
        && printing.collector_number === card.collector_number
        && printing.lang === card.language.code()
        && printing.finishes.includes(card.finish.sf_finish())
    ) {
        return;
    }
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
